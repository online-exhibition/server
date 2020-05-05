import { ObjectId } from "mongodb";

import { connectDatabase } from "../../../database";
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
    const { params } = req;
    const { exhibitionId } = params;
    const objectId = new ObjectId(exhibitionId);
    const result = await exhibitions.deleteOne({ _id: objectId });

    if (result.ok !== 1) {
      throw new HttpError(
        500,
        "ErrorDeleteExhibition",
        "Error deleting the requested exhibition."
      );
    }
    res.status(200).send({ oke: true });
  };
}

export default {
  v1,
};
