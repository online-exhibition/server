import multer from 'multer';

import {ObjectId, GridFSBucket} from 'mongodb';
// import JPGDecoder from 'jpg-stream/decoder';

import {connectDatabase} from '../../database';

import {MongoStorage} from './mongo-storage';
import pick from 'lodash/pick';

function postProcessing(images, imagesFiles, user, id, logger, traceId) {
  setTimeout(async () => {
    // try {
    //   const objectId = new ObjectId(id);
    //   const inputStream = images.openDownloadStream(objectId);
    //   const metadata = await new Promise((resolve, reject) => {
    //     let meta;
    //     inputStream.pipe(new JPGDecoder()).on('meta', (metadata) => {
    //       meta = metadata;
    //       resolve(meta);
    //     });
    //   });

    //   let update = {
    //     user: user._id,
    //     updated: new Date(),
    //   };
    //   if (metadata && metadata.exif) {
    //     update = {...update,
    //       originalCreated: metadata.exif.DateTimeOriginal &&
    //           new Date(metadata.exif.DateTimeOriginal),
    //       exif: pick(metadata.exif, [
    //         'ExposureTime',
    //         'FNumber',
    //         'ExposureProgram',
    //         'ISO',
    //         'FocalLength',
    //         'FocalLengthIn35mmFormat',
    //         'LensMake',
    //         'LensModel',
    //       ]),
    //     };
    //   }
    //   if (metadata && metadata.image) {
    //     update = {...update,
    //       author: metadata.image.Artist,
    //       exif: {
    //         ...pick(metadata.image, [
    //           'Make',
    //           'Model',
    //         ]),
    //         ...update.exif,
    //       },
    //     };
    //   }
    //   const imageQuery = {'_id': objectId, 'metadata.user': user._id};
    //   await imagesFiles.updateOne(imageQuery, {$set: {metadata: update}});
    // } catch (err) {
    //   console.error(err);
    //   logger.error({error: err});
    // }
    logger.debug({traceId}, 'Post processing finished');
  }, 0);
}

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
  const database = await connectDatabase(config.database);
  const images = new GridFSBucket(database, {bucketName: 'images'});
  const imagesFiles = database.collection('images.files');
  return async (req, res) => {
    const {file, traceId, user} = req;
    if (file.mimetype && file.mimetype.endsWith('jpeg')) {
      postProcessing(images, imagesFiles, user, file.id, logger, traceId);
    }
    logger.debug({file}, 'Upload finished, send response now.');
    res.json(file);
  };
}

export default {
  uploadHandler,
  v1,
};
