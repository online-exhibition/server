import {GridFSBucket} from 'mongodb';

export class MongoStorage {
  constructor(database, name, logger) {
    this.bucket = new GridFSBucket(database, {bucketName: name});
    this.logger = logger;
  }

  _handleFile(req, file, done) {
    if (!req._upload) {
      req._upload = {};
    }
    const {traceId, _upload, user} = req;
    const {originalname, mimetype: contentType} = file;
    const {logger} = this;
    const outputStream = this.bucket.openUploadStream(originalname,
        {contentType, metadata: user != null ? {user: user._id} : null});
    _upload[originalname] = outputStream.id;
    logger.debug({traceId, file},
        'Upload file %s and store with ID %s', originalname, outputStream.id);
    file.stream.pipe(outputStream).
        on('error', function(error) {
          done(error);
        }).
        on('finish', function() {
          logger.debug({traceId},
              'File %s upload and stored with ID %s',
              originalname, outputStream.id);
          done(null, {id: outputStream.id});
        });
  }

  _removeFile(req, file, done) {
    const {traceId, _upload} = req;
    const {originalname} = file;
    const {logger} = this;
    if (_upload && _upload[originalname]) {
      this.bucket.delete(_upload[originalname], (err) => {
        if (err) {
          logger.erro({error: err},
              'Error while deleting file "%s" with ID %s',
              originalname, _upload[originalname]);
          return done(err);
        }
        logger.debug({traceId, file}, 'File deleted.');
        done();
      });
    }
  }
}
