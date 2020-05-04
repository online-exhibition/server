import {Router} from 'express';

import versions from '../../utils/versions';

import listExhibition from './list-exhibition';
import getExhibition from './get-exhibition';

/**
 * Sets up the routes for the user management
 * @param  {object} server The server where routes are registered
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 */
export default async function setup(server, config, logger) {
  const router = new Router();

  router.get('/', versions([
    {version: '1.0.0', handler: await listExhibition.v1(config, logger)},
  ]));

  router.get('/:exhibitionId', versions([
    {version: '1.0.0', handler: await getExhibition.v1(config, logger)},
  ]));

  return router;
}
