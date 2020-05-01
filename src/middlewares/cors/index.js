import find from 'lodash/find';
import endsWith from 'lodash/endsWith';

const ONE_MINUTE_SECONDS = 60;
const ONE_HOUR_SECONDS = 60 * ONE_MINUTE_SECONDS;

const ALLOWED_HEADERS = [
  'X-Trace-Id',
  'X-Version',
  'Authorization',
  'Content-Type',
  'Content-Length',
  'Cache-Control',
];
const ALLOWED_HEADERS_STRING = ALLOWED_HEADERS.join(',');

/**
 * Creates a comparator function that checks if a foreign orign ends with basic
 * origin.
 * @param {string} origin The basic orogin.
 * @return {function} The comparator function which check if the given argument
 *   ends with the basic origin.
 */
function originComparator(origin) {
  return (foreign) => {
    return endsWith(origin, foreign);
  };
}

/**
 * Creates a CORS middleware processor.
 * @param {object} config The server configuration.
 * @param {object} logger The bunyan logger.
 * @return {function} The CORS middleware processor.
 */
export function cors(config, logger) {
  return (req, res, next) => {
    const tenant = req.tenant;
    const origin = req.get('Origin');
    const {traceId} = req;
    if (origin) {
      logger.debug({traceId, origin});
      const allowedOrigins = [config.host, ...tenant.cors.whitelist];
      logger.debug({traceId, allowedOrigins});
      if (find(allowedOrigins, originComparator(origin)) !== null) {
        logger.debug({traceId, msg: 'Allow access.'});
        res.set({
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': ALLOWED_HEADERS_STRING,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': (2 * ONE_HOUR_SECONDS).toString(),
        });
        if (req.method === 'OPTIONS') {
          res.send();
          return next();
        }
      } else {
        logger.warn({traceId, msg: 'Deny access.'});
      }
    }
    next();
  };
}
