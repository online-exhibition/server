import multer from 'multer';
import {connectDatabase} from '../../database';
import {MongoStorage} from './mongo-storage';

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function uploadHandler(config, logger) {
  const database = await connectDatabase(config.database);
  const uploadHandler = multer({
    storage: new MongoStorage(database, 'images', logger),
  });
  return uploadHandler.single('image');
}

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  return async (req, res) => {
    const {file} = req;
    logger.debug({file}, 'Upload finish, send response now.');
    res.json(file);
  };
}

export default {
  uploadHandler,
  v1,
};
