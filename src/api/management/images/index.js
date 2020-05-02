import {Router} from 'express';

import versions from '../../../utils/versions';
import listImages from './list-images';
import updateImage from './update-image';

/**
 * Sets up the routes
 * @param  {object} server The server where routes are registered
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 */
export default async function setup(server, config, logger) {
  const router = new Router();

  router.get('/', versions([
    {version: '1.0.0', handler: await listImages.v1(config, logger)},
  ]));

  router.put('/:id', versions([
    {version: '1.0.0', handler: await updateImage.v1(config, logger)},
  ]));

  return router;
}
