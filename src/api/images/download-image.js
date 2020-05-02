import {GridFSBucket, ObjectId} from 'mongodb';

import {connectDatabase} from '../../database';

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  const database = await connectDatabase(config.database);
  const images = new GridFSBucket(database, {bucketName: 'images'});
  const imagesFiles = database.collection('images.files');
  return async (req, res, next) => {
    const {traceId, user, params, query, body} = req;
    const {id} = params;
    const objectId = new ObjectId(id);
    const inputStream = images.openDownloadStream(objectId);
    const file = await imagesFiles.findOne({_id: objectId});
    logger.debug({traceId, file}, 'Load image from %s', id);
    res.append('Content-Type', 'image/jpeg');
    res.append('Content-Length', file.length.toString());
    res.append('Cache-Control', 'public');
    res.append('Last-Modified', new Date(file.uploadDate).toUTCString());
    await new Promise((resolve, reject) => {
      inputStream.on('error', reject);
      inputStream.on('finish', resolve);
      inputStream.pipe(res, {end: true});
    });
    res.status(200).send();
  };
}

/**
 * Creates a head route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1Head(config, logger) {
  const database = await connectDatabase(config.database);
  const imagesFiles = database.collection('images.files');
  return async (req, res, next) => {
    const {traceId, user, params, query, body} = req;
    const {id} = params;
    const objectId = new ObjectId(id);
    const file = await imagesFiles.findOne({_id: objectId});
    logger.debug({traceId, file}, 'Send image information from %s', id);
    res.append('Content-Type', 'image/jpeg');
    res.append('Content-Length', file.length.toString());
    res.append('Cache-Control', 'public, must-revalidate');
    res.append('Last-Modified', new Date(file.uploadDate).toUTCString());
    res.status(200).send();
  };
}

export default {
  v1,
  v1Head,
};
