import { ObjectId } from "mongodb";

import { connectDatabase } from "../../../database";
import { validate } from "../../../utils/data";
import assert from "../../../utils/assert";

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
    const { traceId, user, params, body, origin } = req;
    const { exhibitionId } = params;
    const { title, description, maxCount, expire, theme, active } = body;
    const exhibition = {
      title,
      description,
      maxCount,
      expire,
      theme,
      active,
    };
    validate(exhibition, ["title", "description"], 2048);

    assert.regex(title, /.{0,100}/, "title", traceId);
    assert.regex(description, /.{0,1024}/, "description", traceId);
    assert.regex(maxCount, /\d{0,10}/, "maxCount", traceId);
    assert.regex(theme, /.{0,100}/, "theme", traceId);
    assert.isoDate(expire, "expire", traceId);

    const objectId = new ObjectId(exhibitionId);
    const imageQuery = { _id: objectId };
    const originExhibition = await exhibitions.findOne(imageQuery);
    const update = {
      ...exhibition,
      images: originExhibition.images,
      expire: expire ? new Date(expire) : null,
      active: !!active,
      updated: new Date(),
      modifier: user.username,
    };
    await exhibitions.update(imageQuery, { $set: update });

    res
      .status(200)
      .send(
        exhibitionDataProjection(origin)(
          await exhibitions.findOne({ _id: objectId })
        )
      );
  };
}

export default {
  v1,
};
