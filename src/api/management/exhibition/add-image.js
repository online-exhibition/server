import { connectDatabase } from "../../../database";
import { ObjectId } from "mongodb";

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
    const { exhibitionId } = params;
    const {
      id,
      filename,
      title,
      width,
      height,
      author,
      description,
      originalCreated,
      at,
    } = body;
    console.log(body);
    const objectId = new ObjectId(exhibitionId);
    const exhibition = await exhibitions.findOne({ _id: objectId });
    const images = exhibition.images || [];
    const newImage = {
      id,
      filename,
      title,
      width,
      height,
      author,
      description,
      originalCreated,
    };
    if (at != null) {
      images.splice(at, 0, newImage);
    } else {
      images.push(newImage);
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
