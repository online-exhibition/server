/**
 * Creates a route handler
 * @param  {object} config The server configuration
 * @param  {object} logger The bunyan logger
 * @return {function} The route handler
 */
async function v1(config, logger) {
  return async (req, res) => {
    const { user } = req;
    res.status(200).send(user);
  };
}

export default {
  v1,
};
