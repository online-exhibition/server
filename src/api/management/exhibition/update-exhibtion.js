import {ObjectId} from 'mongodb';

import {validate} from '../../../utils/data';
import {connectDatabase} from '../../../database';
import assert from '../../../utils/assert';

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  const database = await connectDatabase(config.database);
  const exhibitions = database.collection('exhibitions');
  return async (req, res) => {
    const {traceId, user, params, body} = req;
    const {exhibitionId} = params;
    const {title, description, maxCount, expire, backgroundColor, textColor,
      active, images} = body;
    const exhibition = {title, description, maxCount, expire, textColor,
      backgroundColor, active, images};
    validate(exhibition, ['title', 'description'], 2048);

    assert.regex(title, /.{0,100}/, 'title', traceId);
    assert.regex(description, /.{0,1024}/, 'description', traceId);
    assert.regex(maxCount, /\d{0,10}/, 'maxCount', traceId);
    assert.regex(textColor,
        /#[0-9abcdef]{0,6}/i, 'textColor', traceId);
    assert.regex(backgroundColor,
        /#[0-9abcdef]{0,6}/i, 'backgroundColor', traceId);
    assert.isoDate(expire, 'expire', traceId);

    const objectId = new ObjectId(exhibitionId);
    const update = {
      ...exhibition,
      expire: expire ? new Date(expire) : null,
      active: !!active,
      updated: new Date(),
      modifier: user.username,
    };
    await exhibitions.update({_id: objectId}, {$set: update});

    res.status(200).send(
        exhibitionDataProjection(origin)(await exhibitions
            .findOne({_id: objectId})));
  };
}

export default {
  v1,
};
