import { ObjectId } from "mongodb";

import { connectDatabase } from "../../../database";
import { imageDataProjection } from "./utils";
import assert from "../../../utils/assert";

export const IMAGE_LICENSES = [
  "CC BY",
  "CC BY-SA",
  "CC BY-ND",
  "CC BY-NC",
  "CC BY-NC-SA",
  "CC BY-NC-ND",
];

async function licensesV1(config, logger) {
  return (req, res) => {
    res.status(200).json(IMAGE_LICENSES);
  };
}

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  const database = await connectDatabase(config.database);
  const images = database.collection("images.files");
  return async (req, res) => {
    const { traceId, user, params, origin, body } = req;
    const { id } = params;
    logger.debug({ traceId, body }, "Update data");
    const { author, license, category, description, title } = body;
    const objectId = new ObjectId(id);
    assert.contains(license, IMAGE_LICENSES);
    const imageQuery = { _id: objectId, "metadata.user": user._id };
    const image = await images.findOne(imageQuery);
    const update = {
      ...image.metadata,
      user: user._id,
      author,
      license,
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
  licensesV1,
};
