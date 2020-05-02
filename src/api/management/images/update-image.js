import {connectDatabase} from '../../../database';
import {imageDataProjection} from './utils';
import {ObjectId} from 'mongodb';

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  let database;
  let images;
  (async () => {
    database = await connectDatabase(config.database);
    images = database.collection('images.files');
  })();
  return async (req, res) => {
    const {traceId, user, params, origin, body} = req;
    const {id} = params;
    const {category, author, description} = body;
    const objectId = new ObjectId(id);
    const update = {user: user._id, category, author, description, updated: new Date()};
    const imageQuery = {'_id': objectId, 'metadata.user': user._id};
    await images.updateOne(imageQuery, {$set: {metadata: update}});
    res.status(200).send(imageDataProjection(origin)(await images.findOne(imageQuery)));
  };
}

export default {
  v1,
};
