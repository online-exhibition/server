import {Router} from 'express';
import passport from 'passport';

import {getModificationDate} from '../../utils/filesystem';

import versions from '../../utils/versions';
import downloadImage from './download-image';

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
      ],
    });
  });

  router.get('/:id',
      // passport.authenticate('basic', {session: false}),
      versions([
        {version: '1.0.0', handler: await downloadImage.v1(config, logger)},
      ]));
  router.head('/:id', versions([
    {version: '1.0.0', handler: await downloadImage.v1Head(config, logger)},
  ]));

  return router;
}
