import { connectDatabase } from "../../../database";
import { imageDataProjection } from "./utils";
import { ObjectId } from "mongodb";

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  let database;
  let images;
  (async () => {
    database = await connectDatabase(config.database);
    images = database.collection("images.files");
  })();
  return async (req, res) => {
    const { traceId, user, params, origin, body } = req;
    const { id } = params;
    logger.debug({ traceId, body }, "Update data");
    const { author, category, description, title } = body;
    const objectId = new ObjectId(id);
    const imageQuery = { _id: objectId, "metadata.user": user._id };
    const image = await images.findOne(imageQuery);
    const update = {
      ...image.metadata,
      user: user._id,
      author,
      category,
      title,
      description,
      updated: new Date(),
    };
    logger.debug({ traceId, update }, "Data to update");
    await images.updateOne(imageQuery, { $set: { metadata: update } });
    res
      .status(200)
      .send(imageDataProjection(origin)(await images.findOne(imageQuery)));
  };
}

export default {
  v1,
};
