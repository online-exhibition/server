import {connectDatabase} from '../../database';
import {ObjectId} from 'mongodb';
import {exhibitionDataProjection} from '../management/exhibition/utils';

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
    const {params, origin} = req;
    const {exhibitionId} = params;
    const objectId = new ObjectId(exhibitionId);
    const exhibition = await exhibitions.findOne({_id: objectId});

    res.status(200).send(exhibitionDataProjection(origin)(exhibition));
  };
}

export default {
  v1,
};
