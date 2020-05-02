
import passport from 'passport';
import {BasicStrategy} from 'passport-http';
import intersection from 'lodash/intersection';

import {connectDatabase} from '../../database';
import {HttpError} from '../../utils/error';

/**
 * Create the authentication middleware processor.
 * @param {object} config The server configuration.
 * @param {object} logger The bunyan logger.
 * @return {function} The CORS middleware processor.
 */
export function authentication(config, logger) {
  let database;
  (async () => {
    database = await connectDatabase(config.database);
    const users = database.collection('users');
    users.createIndexes([
      {key: {username: 1}, name: 'username_unique', unique: true},
      {key: {username: 1, password: 1}, name: 'username_password'},
    ]);
  })();
  passport.use(new BasicStrategy(
      async function(username, password, done) {
        if (!username || !password) {
          return done(null, false);
        }
        const users = database.collection('users');
        const user = await users.findOne({username, password});

        if (!user) {
          return done(null, false);
        }

        delete user.password;
        return done(null, user);
      },
  ));
  return passport.initialize();
}

/**
 * Creates a permission checking middleware.
 * @param  {array} permissions The permissions to check against
 *    the user permissions
 * @return {function} The permission checking middleware gate.
 */
export function permissionGate(permissions) {
  return (req, res, next) => {
    const {user} = req;
    console.log(user);
    if (!user || !user.permissions) {
      return next(new HttpError(403, 'Unauthorized',
          'The given user has not sufficient permissions.'));
    }
    const availablePermissions = intersection(permissions, user.permissions);
    console.log(user, permissions, availablePermissions);
    if (availablePermissions.length !== permissions.length) {
      return next(new HttpError(403, 'Unauthorized',
          'The given user has not sufficient permissions.'));
    }
    next();
  };
}
