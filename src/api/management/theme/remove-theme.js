import { connectDatabase } from "../../../database";

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  const database = await connectDatabase(config.database);
  const themes = database.collection("themes");
  return async (req, res) => {
    const { params } = req;
    const { id } = params;
    const objectId = new ObjectId(id);
    const result = await themes.deleteOne({ _id: objectId });
    if (result.result.ok !== 1) {
      throw new HttpError(
        500,
        "ErrorDeleteTheme",
        "Error deleting the requested theme."
      );
    }
    res.status(200).send({ oke: true });
  };
}

export default {
  v1,
};
