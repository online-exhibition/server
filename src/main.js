import fs from 'fs';
import path from 'path';

import {createTransport} from 'nodemailer';

import express from 'express';
import morgan from 'morgan';
import bunyan from 'bunyan';
import bodyparser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import * as uuid from 'uuid';
import trimEnd from 'lodash/trimEnd';

import api from './api';

import {cors} from './middlewares/cors';
import {authentication} from './middlewares/authentication';

(async () => {
  const pkg = JSON.parse(
      (await fs.promises.readFile('./package.json')).toString(),
  );
  const config = Object.assign(pkg.config, pkg.development);
  const port = config.port || 8080;
  config.name = pkg.name + '@' + pkg.version;
  config.version = pkg.version;

  const logConfig = {
    name: config.name,
    level: config.logLevel || 'info',
    streams: [
      {
        stream: process.stderr,
      },
    ],
  };

  if (config.log) {
    const logFolder = path.resolve(path.dirname(config.log));
    if (!fs.existsSync(logFolder)) {
      fs.mkdirSync(logFolder, {recursive: true});
    }
    logConfig.streams.push({
      type: 'rotating-file',
      path: config.log,
      period: '1d',
      count: 8,
    });
  }
  const logger = bunyan.createLogger(logConfig);
  global.logger = logger;
  logger.log = logger.debug;

  const accessLogStream = fs.createWriteStream(
      config.accessLog || 'access.log',
      {flags: 'a'},
  );

  config.email = {
    transport: createTransport({
      host: 'smtp.strato.de',
      port: 465,
      auth: {user: 'noreply@chomim.de', pass: 'vL!NVXu7T@chomim'},
    }),
  };

  const server = express();

  server.set('etag', false);

  server.use(morgan('combined', {stream: accessLogStream}));
  server.use(compression());
  server.use(bodyparser.json({limit: '200kb'}));

  server.use(helmet.frameguard({action: 'deny'}));
  server.use(helmet.hidePoweredBy());
  server.use(helmet.xssFilter());
  server.use(helmet.noSniff());
  server.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ['\'self\''],
          scriptSrc: ['\'self\''],
          connectSrc: ['\'self\' localhost'],
        },
      }),
  );

  server.use((req, res, next) => {
    const start = Date.now();
    const traceId = req.get('X-Trace-Id') || uuid.v4();
    req.origin = req.protocol + '://' + req.get('HOST');
    req.urlPrefix =
      req.protocol +
      '://' +
      req.get('HOST') +
      trimEnd(req.get('X-Request-Uri'), '/');
    req.traceId = traceId;
    logger.debug({traceId}, 'Handling request ' + req.urlPrefix);
    res.set('X-Trace-Id', traceId);
    res.on('finish', () => {
      logger.debug(
          {
            traceId,
            runtime: Date.now() - start,
          },
          'Request handled',
      );
    });
    next();
  });

  server.use(cors(config, logger));
  server.use(authentication(config, logger));

  await api(server, config, logger);

  server.use((err, req, res, next) => {
    if (err instanceof Error) {
      logger.error({err, stack: err.stack});
      const statusCode = err.statusCode || err.status || 500;
      delete err.status;
      delete err.statusCode;
      delete err.inner;
      res.status(statusCode).json(err);
    }
  });

  server.listen(port, () => {
    logger.log('%s listening at port %s', logConfig.name, port);
  });
})();
