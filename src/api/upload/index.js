import {Router} from 'express';
import passport from 'passport';

import {getModificationDate} from '../../utils/filesystem';

import uploadFile from './upload-file';
import versions from '../../utils/versions';

/**
 * Sets up the routes for the user management
 * @param  {object} server The server where routes are registered
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 */
export default async function setup(server, config, logger) {
  const modificationDate = getModificationDate(__filename).toUTCString();
  const router = new Router();

  router.get('/', (req, res) => {
    res.append('Cache-Control', 'public, must-revalidate');
    res.append('Last-Modified', modificationDate);
    res.json({
      '.': [
        {
          url: req.urlPrefix + req.originalUrl,
          method: 'Get',
          description: 'Get this information.',
          versions: ['1.0.0'],
          private: false,
        },
        {
          url: req.urlPrefix + req.originalUrl,
          method: 'POST',
          description: 'Upload a file.',
          versions: ['1.0.0'],
          private: false,
        },
      ],
    });
  });

  router.post('/',
      passport.authenticate('basic', {session: false}),
      await uploadFile.uploadHandler(config, logger),
      versions([
        {version: '1.0.0', handler: await uploadFile.v1(config, logger)},
      ]));


  return router;
}
