import path from 'path';

import {Router} from 'express';
import passport from 'passport';

import {getModificationDate} from '../utils/filesystem';

/**
 * Sets up the routes for the API server
 * @param  {object} server The server where routes are registered
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 */
export default async function setup(server, config, logger) {
  const modificationDate = getModificationDate(__filename).toUTCString();
  const {name, version} = config;
  const router = new Router();

  global.debug = logger.debug;
  const toplevelRoutes = [{uri: '/'}, {uri: '/memory', private: true}];
  router.get('/', (req, res) => {
    const api = {};
    toplevelRoutes.forEach((entry) => {
      const uripart = entry.uri;
      api[uripart] = {url: req.urlPrefix + uripart, private: !!entry.private};
    });
    res.append('Cache-Control', 'public, max-age=' + 60 * 60);
    res.append('Last-Modified', modificationDate);
    res.json({
      name,
      version,
      api,
    });
  });

  router.get('/memory', passport.authenticate('basic', {session: false}),
      (req, res) => {
        res.append('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.json({memory: process.memoryUsage(), user: req.user});
      });

  server.use('/', router);
}
