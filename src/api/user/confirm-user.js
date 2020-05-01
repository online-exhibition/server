import {connectDatabase} from '../../database';

import {HttpError} from '../../utils/error';
import {sendEmail} from '../../utils/email';
import confirmTemplate from './templates/confirm';
import {ObjectId, ObjectID} from 'mongodb';

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  let database;
  let register;
  let users;
  (async () => {
    database = await connectDatabase(config.database);
    register = database.collection('register');
    users = database.collection('users');
  })();
  return async (req, res) => {
    const {traceId, params} = req;

    const {userId} = params;
    logger.debug({userId}, 'Confirm user');
    const exists = await register.findOne({_id: new ObjectID(userId)});
    if (!exists) {
      throw new HttpError(
          404,
          'UserNotExists',
          'The requested username does not exist.',
      );
    }
    delete exists._id;

    const {username, email, name, firstname}=exists;
    logger.debug({traceId}, 'Create user %s', username);
    const result = await users.insertOne({...exists, created: new Date()});

    if (result.result.ok === 1) {
      await register.deleteOne({_id: new ObjectId(userId)});
      logger.debug({traceId},
          '%s successfully created. Sending E-Mail to %s',
          username, email);
      const emailSendInfo = await sendEmail(
          config.email.transport,
          '"Foto Labor Server" <noreply@chomim.de>',
          email,
          '[flab] Benutzerkonto ist angelegt',
          {
            origin: req.origin,
            username,
            email,
            name,
            firstname,
          },
          confirmTemplate,
      );

      logger.debug({traceId, emailSendInfo},
          '%s successfully created. Sending E-Mail to %s',
          username, email);
      res.status(200).send({ok: true});
    } else {
      logger.error({error: result});
      throw new HttpError(
          500,
          'CannotCreateUser',
          'The user couldn\'t be created.',
      );
    }
  };
}

export default {
  v1,
};
