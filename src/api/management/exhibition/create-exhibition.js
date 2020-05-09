import { connectDatabase } from "../../../database";
import { validate } from "../../../utils/data";
import assert from "../../../utils/assert";
import { HttpError } from "../../../utils/error";
import { exhibitionDataProjection } from "./utils";

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
    const { traceId, user, body, origin } = req;
    const {
      title,
      summary,
      description,
      maxCount,
      start,
      expire,
      theme,
    } = body;
    const exhibition = {
      title,
      summary,
      description,
      maxCount,
      start,
      expire,
      theme,
    };
    validate(exhibition, ["title"], 4096);

    assert.regex(title, /.{0,100}/, "title", traceId);
    assert.regex(summary, /.{0,1024}/, "description", traceId);
    assert.regex(description, /.{0,4096}/, "description", traceId);
    assert.regex(maxCount, /\d{0,10}/, "maxCount", traceId);
    assert.regex(theme, /.{0,50}/, "theme", traceId);
    assert.isoDate(start, "start", traceId);
    assert.isoDate(expire, "expire", traceId);

    exhibition.start = start ? new Date(start) : new Date();
    if (!start) {
      exhibition.start.setDate(exhibition.start.getDate() + 8);
    }
    exhibition.expire = expire
      ? new Date(expire)
      : new Date(exhibition.start.getTime());
    if (!expire) {
      exhibition.expire.setDate(exhibition.expire.getDate() + 8);
    }

    const data = {
      ...exhibition,
      images: [],
      active: false,
      created: new Date(),
      owner: user.username,
    };
    const result = await exhibitions.insertOne(data);

    if (result.ok === 1) {
      logger.error({ result, data }, "Exhibition is not created.");
      throw new HttpError(
        500,
        "CannotCreateExhibition",
        "Exhibition is not created"
      );
    }

    res
      .status(200)
      .send(
        exhibitionDataProjection(origin)(
          await exhibitions.findOne({ _id: result.insertedId })
        )
      );
  };
}

export default {
  v1,
};
