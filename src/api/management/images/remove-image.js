import { connectDatabase } from "../../../database";
import { ObjectId, GridFSBucket } from "mongodb";

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  const database = await connectDatabase(config.database);
  const images = new GridFSBucket(database, { bucketName: "images" });
  return async (req, res) => {
    const { traceId, params } = req;
    const { id } = params;
    const objectId = new ObjectId(id);
    try {
      await new Promise((resolve, reject) => {
        images.delete(objectId, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    } catch (err) {
      logger.error({ traceId, error: err });
      throw new HttpError(
        500,
        "ErrorDeleteImage",
        "Error deleting the requested image."
      );
    }
    res.status(200).send();
  };
}

export default {
  v1,
};
