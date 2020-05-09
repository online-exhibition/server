import { connectDatabase } from "../../database";
import assert from "../../utils/assert";
import { exhibitionShortDataProjection } from "../management/exhibition/utils";

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  const database = await connectDatabase(config.database);
  const exhibitions = database.collection("exhibitions");
  await exhibitions.updateMany(
    { start: null },
    { $set: { start: new Date() } }
  );
  return async (req, res) => {
    const { traceId, query, origin } = req;
    const { skip = "0", limit = "10", expired = false } = query;

    assert.regex(skip, /\d{0,10}/, "skip", traceId);
    assert.regex(limit, /\d{0,10}/, "limit", traceId);
    let listQuery = { active: true, expire: { $gte: new Date() } };
    if (expired) {
      listQuery = { active: true, expire: { $lt: new Date() } };
    }
    const cursor = exhibitions.find(listQuery, {
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
      sort: { start: 1 },
    });

    res.set("X-Skip", skip);
    res.set("X-Limit", limit);
    res.set("X-Count", await cursor.count(false));
    res
      .status(200)
      .send(
        (await cursor.toArray()).map(exhibitionShortDataProjection(origin))
      );
  };
}

export default {
  v1,
};
