import { connectDatabase } from "../../database";
import { validate } from "../../utils/data";
import assert from "../../utils/assert";

import { HttpError } from "../../utils/error";
import { sendEmail } from "../../utils/email";
import registrationTemplate from "./templates/registration";

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
    register = database.collection("register");
    users = database.collection("users");
    register.createIndexes([
      { key: { username: 1 }, name: "username_unique", unique: true },
      {
        key: { registered: 1 },
        name: "registered",
        expireAfterSeconds: 60 * 60 * 24 * 2,
      },
    ]);
  })();
  return async (req, res) => {
    const { traceId, body } = req;

    const { username, password, email, name, firstname } = body;
    const user = { username, password, email, name, firstname };
    validate(user, ["username", "email", "name", "firstname"]);

    assert.regex(username, /\w[\w\d]{2,50}/, "username", traceId);
    assert.regex(name, /\w[\w\d]{2,50}/, "name", traceId);
    assert.regex(password, /\w[\w\d]{2,50}/, "password", traceId);
    assert.regex(firstname, /\w[\w\d]{2,50}/, "firstname", traceId);
    assert.email(email, "email", traceId);

    const exists = await users.findOne({ username });
    if (exists) {
      throw new HttpError(
        409,
        "UserAlreadyExists",
        "The requested username already exists."
      );
    }

    logger.debug({ traceId }, "Register user %s", username);
    const result = await register.insertOne({
      ...user,
      registered: new Date(),
    });

    if (result.result.ok === 1) {
      logger.debug(
        { traceId },
        "%s successfully registered. Sending E-Mail to %s",
        username,
        email
      );
      const emailSendInfo = await sendEmail(
        config.email.transport,
        '"Foto Labor Server" <noreply@chomim.de>',
        email,
        "[flab] Bestätigung Ihres Benutzerkontos",
        {
          origin: req.origin,
          registrationId: result.insertedId,
          username,
          email,
          name,
          firstname,
        },
        registrationTemplate
      );

      logger.debug(
        { traceId, emailSendInfo },
        "%s successfully registered. Sending E-Mail to %s",
        username,
        email
      );
      res.status(200).send({ ok: true });
    } else {
      logger.error({ error: result });
      throw new HttpError(
        500,
        "CannotRegisterUser",
        "The user couldn't be registered."
      );
    }
  };
}

export default {
  v1,
};
