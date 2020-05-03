import {connectDatabase} from '../../../database';
import {validate} from '../../../utils/data';
import assert from '../../../utils/assert';
import {HttpError} from '../../../utils/error';
import {exhibitionDataProjection} from './utils';

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
    const {traceId, user, body, origin} = req;
    const {title, description, maxCount, expire, backgroundColor} = body;
    const exhibition = {title, description, maxCount, expire, backgroundColor};
    validate(exhibition, ['title', 'description'], 2048);

    assert.regex(title, /.{0,100}/, 'title', traceId);
    assert.regex(description, /.{0,1024}/, 'description', traceId);
    assert.regex(maxCount, /\d{0,10}/, 'maxCount', traceId);
    assert.regex(backgroundColor,
        /#[0-9abcdef]{0,6}/, 'backgroundColor', traceId);
    assert.isoDate(expire, 'expire', traceId);

    const data = {
      ...exhibition,
      images: [],
      expire: new Date(expire),
      active: false,
      created: new Date(),
      owner: user.username,
    };
    const result = await exhibitions.insertOne(data);

    if (result.ok === 1) {
      logger.error({result, data}, 'Exhibition is not created.');
      throw new HttpError(
          500,
          'CannotCreateExhibition',
          'Exhibition is not created',
      );
    }

    res.status(200).send(
        exhibitionDataProjection(origin)(await exhibitions
            .findOne({_id: result.insertedId})));
  };
}

export default {
  v1,
};
