import { connectDatabase } from "../../../database";
import { ObjectId } from "mongodb";
import { HttpError } from "../../../utils/error";

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  const database = await connectDatabase(config.database);
  const exhibitions = database.collection("exhibitions");
  return async (req, res) => {
    const { user, params, body } = req;
    const { exhibitionId, id } = params;
    const { title, description } = body;
    const objectId = new ObjectId(exhibitionId);
    const exhibition = await exhibitions.findOne({ _id: objectId });
    const images = exhibition.images || [];
    const image = images.find((image) => image.id === id);
    if (!image) {
      throw new HttpError(
        404,
        "ImageNotFound",
        "The requested image is not available."
      );
    }
    if (title) {
      image.title = title;
    }
    if (description) {
      image.description = description;
    }
    const update = {
      images,
      updated: new Date(),
      modifier: user.username,
    };
    await exhibitions.updateOne({ _id: objectId }, { $set: update });

    res.status(200).send({ ok: true });
  };
}

export default {
  v1,
};
