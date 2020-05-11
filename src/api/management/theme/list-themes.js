import { connectDatabase } from "../../../database";
import assert from "../../../utils/assert";

import { themeShortDataProjection } from "./utils";

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
    const { traceId, query } = req;
    const { skip = "0", limit = "10" } = query;

    assert.regex(skip, /\d{0,10}/, "skip", traceId);
    assert.regex(limit, /\d{0,10}/, "limit", traceId);

    const cursor = themes.find(
      {},
      {
        limit: parseInt(limit, 10),
        skip: parseInt(skip, 10),
        sort: { name: 1 },
      }
    );

    res.set("X-Skip", skip);
    res.set("X-Limit", limit);
    res.set("X-Count", await cursor.count(false));
    res
      .status(200)
      .send((await cursor.toArray()).map(themeShortDataProjection()));
  };
}

export default {
  v1,
};
