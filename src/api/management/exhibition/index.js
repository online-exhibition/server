import {Router} from 'express';

import versions from '../../../utils/versions';

import listExhibition from './list-exhibition';
import getExhibition from './get-exhibition';
import createExhibition from './create-exhibition';
import updateExhibtion from './update-exhibtion';
import addImage from './add-image';
import updateImage from './update-image';
import removeImage from './remove-image';
import removeExhibition from './remove-exhibition';

/**
 * Sets up the routes
 * @param  {object} server The server where routes are registered
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 */
export default async function setup(server, config, logger) {
  const router = new Router();

  router.get('/', versions([
    {version: '1.0.0', handler: await listExhibition.v1(config, logger)},
  ]));

  router.post('/', versions([
    {version: '1.0.0', handler: await createExhibition.v1(config, logger)},
  ]));

  router.get('/:exhibitionId', versions([
    {version: '1.0.0', handler: await getExhibition.v1(config, logger)},
  ]));

  router.put('/:exhibitionId', versions([
    {version: '1.0.0', handler: await updateExhibtion.v1(config, logger)},
  ]));

  router.post('/:exhibitionId', versions([
    {version: '1.0.0', handler: await addImage.v1(config, logger)},
  ]));

  router.delete('/:exhibitionId', versions([
    {version: '1.0.0', handler: await removeExhibition.v1(config, logger)},
  ]));

  router.put('/:exhibitionId/:id', versions([
    {version: '1.0.0', handler: await updateImage.v1(config, logger)},
  ]));

  router.delete('/:exhibitionId/:id', versions([
    {version: '1.0.0', handler: await removeImage.v1(config, logger)},
  ]));


  return router;
}
