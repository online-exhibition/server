import {connectDatabase} from '../../../database';
import {ObjectId} from 'mongodb';
import {HttpError} from '../../../utils/error';

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
    const {user, params} = req;
    const {exhibitionId, id} = params;
    const objectId = new ObjectId(exhibitionId);
    const exhibition = await exhibitions.findOne({_id: objectId});
    const images = exhibition.images || [];
    const imageIndex = images.findIndex((image) => image.id === id);
    if (imageIndex < 0) {
      throw new HttpError(
          404,
          'ImageNotFound',
          'The requested image is not available.');
    }
    images.splice(imageIndex, 1);
    const update = {
      images,
      updated: new Date(),
      modifier: user.username,
    };
    await exhibitions.updateOne({_id: objectId}, {$set: update});

    res.status(200).send({ok: true});
  };
}

export default {
  v1,
};
