import { connectDatabase } from "../../database";

function parseToken(token) {
  const pos = token.indexOf(":");
  if (pos > -1) {
    return [token.substr(0, pos), token.substr(pos + 1)];
  }
  return [];
}

function parseAuthorization(authorization) {
  if (authorization && authorization.startsWith("Basic ")) {
    const decoded = new Buffer(
      authorization.split(" ")[1],
      "base64"
    ).toString();
    return parseToken(decoded);
  }
  return [];
}

/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  let database;
  let users;
  (async () => {
    database = await connectDatabase(config.database);
    users = database.collection("users");
  })();
  return async (req, res) => {
    const { traceId } = req;
    const [username, password] = parseAuthorization(req.get("Authorization"));
    const user = await users.findOne({ username, password });
    if (user) {
      logger.debug({ traceId }, "Logged in user %s", username);
      delete user._id;
      delete user.password;
      return res.status(200).send(user);
    }
    logger.debug({ traceId }, "Failed logging in user %s", username);
    res.status(403).send();
  };
}

export default {
  v1,
};
