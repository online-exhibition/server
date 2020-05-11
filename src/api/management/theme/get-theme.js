import { ObjectId } from "mongodb";

import { connectDatabase } from "../../../database";
import { themeDataProjection } from "./utils";

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
    const themeQuery = { _id: objectId };
    res
      .status(200)
      .send(themeDataProjection()(await themes.findOne(themeQuery)));
  };
}

export default {
  v1,
};
