
import passport from 'passport';
import {BasicStrategy} from 'passport-http';
import {connectDatabase} from '../../database';

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

        delete user._id;
        delete user.password;
        return done(null, user);
      },
  ));
  return passport.initialize();
}
