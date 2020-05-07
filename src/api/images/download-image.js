import { GridFSBucket, ObjectId } from "mongodb";

import { connectDatabase } from "../../database";
import { HttpError } from "../../utils/error";

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  const database = await connectDatabase(config.database);
  const images = new GridFSBucket(database, { bucketName: "images" });
  const imagesFiles = database.collection("images.files");
  return async (req, res, next) => {
    const { traceId, user, params } = req;
    const { id } = params;
    const objectId = new ObjectId(id);
    const etagMatch = req.get("If-None-Match");
    const file = await imagesFiles.findOne({ _id: objectId });
    if (!file) {
      throw new HttpError(
        404,
        "ImageNotFound",
        "The requested image is not found."
      );
    }
    logger.debug({ from: file.md5, to: etagMatch });
    if (file.md5 === etagMatch) {
      return res.status(304).send();
    }
    const inputStream = images.openDownloadStream(objectId);
    logger.debug({ traceId, file }, "Load image from %s", id);
    res.append("Content-Type", "image/jpeg");
    res.append("Content-Length", file.length.toString());
    res.append("Cache-Control", "public, must-revalidate");
    res.append("ETag", file.md5);
    await new Promise((resolve, reject) => {
      inputStream.on("error", reject);
      inputStream.on("finish", resolve);
      inputStream.pipe(res, { end: true });
    });
    res.status(200).send();
  };
}

/**
 * Creates a head route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1Head(config, logger) {
  const database = await connectDatabase(config.database);
  const imagesFiles = database.collection("images.files");
  return async (req, res, next) => {
    const { traceId, user, params, query, body } = req;
    const { id } = params;
    const objectId = new ObjectId(id);
    const file = await imagesFiles.findOne({ _id: objectId });
    logger.debug({ traceId, file }, "Send image information from %s", id);
    res.append("Content-Type", "image/jpeg");
    res.append("Content-Length", file.length.toString());
    res.append("Cache-Control", "public, must-revalidate");
    res.append("ETag", file.md5);
    res.status(200).send();
  };
}

export default {
  v1,
  v1Head,
};
