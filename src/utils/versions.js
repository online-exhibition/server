import semver from 'semver';
import find from 'lodash/find';

import {HttpError} from '../utils/error';

/**
 * Creates a version handler for a route
 * @param  {array} handlers A list of route handlers with version information
 * @return {function} The version handler for a route
 */
export default function versions(handlers) {
  if (!Array.isArray(handlers)) {
    throw new Error('The argument must be an array.');
  }
  handlers.sort((a, b) => {
    if (semver.gt(a.version, b.version)) {
      return -1;
    } else if (semver.lt(a.version, b.version)) {
      return 1;
    }
    return 0;
  });
  return function versionsHandler(req, res, next) {
    const requestedVersion = req.get('X-Version');
    let handler;
    if (requestedVersion) {
      handler = find(handlers, (h) =>
        semver.satisfies(h.version, requestedVersion),
      );
    } else {
      handler = handlers[0];
    }
    if (!handler) {
      return next(
          new HttpError(
              404,
              'VersionNotFound',
              'The requested version is not found.',
          ),
      );
    }
    const result = handler.handler(req, res, next);
    if (result instanceof Promise) {
      result
          .then(() => {
            next();
          })
          .catch((err) => {
            next(err);
          });
    } else {
      next();
    }
  };
}
