import { connectDatabase } from "../../../database";

import { validate } from "../../../utils/data";
import assert from "../../../utils/assert";
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
    const { traceId, user, body } = req;
    const { name } = body;
    const theme = { name };
    validate(theme, ["name"]);

    assert.regex(name, /.{0,50}/, "name", traceId);

    const data = {
      ...theme,
      styles: [],
      created: new Date(),
      owner: user.username,
    };
    const result = await themes.insertOne(data);

    if (result.ok === 1) {
      logger.error({ result, data }, "Theme is not created.");
      throw new HttpError(500, "CannotCreateTheme", "Theme is not created");
    }

    res
      .status(200)
      .send(
        themeDataProjection(await themes.findOne({ _id: result.insertedId }))
      );
  };
}

export default {
  v1,
};
