import { connectDatabase } from "../../../database";
import { ObjectId } from "mongodb";

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
    const { traceId, user, params, body } = req;
    const { id } = params;
    logger.debug({ traceId, body }, "Update theme");
    const { name, styles } = body;
    const objectId = new ObjectId(id);

    const themeQuery = { _id: objectId };
    const theme = await themes.findOne(themeQuery);
    const update = {
      ...theme,
      name,
      styles,
      modifier: user._id,
      updated: new Date(),
    };
    logger.debug({ traceId, update }, "Theme to update");
    await themes.updateOne(themeQuery, { $set: update });
    res
      .status(200)
      .send(themeDataProjection()(await themes.findOne(themeQuery)));
  };
}

export default {
  v1,
};
