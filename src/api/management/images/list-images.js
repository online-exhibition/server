import pick from 'lodash/pick';

import {connectDatabase} from '../../../database';
import assert from '../../../utils/assert';
import {imageShortDataProjection} from './utils';

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  const database = await connectDatabase(config.database);
  const images = database.collection('images.files');
  return async (req, res) => {
    const {traceId, user, query, origin} = req;
    const {skip='0', limit='10'} = query;

    assert.regex(skip, /\d{0,10}/, 'skip', traceId);
    assert.regex(limit, /\d{0,10}/, 'limit', traceId);

    try {
      const cursor = images.find({'metadata.user': user._id},
          {limit: parseInt(limit, 10), skip: parseInt(skip, 10)});

      res.set('X-Skip', skip);
      res.set('X-Limit', limit);
      res.set('X-Count', await cursor.count(false));
      res.status(200).send((await cursor.toArray()).map(imageShortDataProjection(origin)));
    } catch (err) {
      console.error(err);
    }
  };
}

export default {
  v1,
};
