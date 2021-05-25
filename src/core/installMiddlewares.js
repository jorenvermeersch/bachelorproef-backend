const config = require('config');
const koaCors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const koaHelmet = require('koa-helmet');
const koaQs = require('koa-qs');
const responseTime = require('koa-response-time');
const { v4: uuid } = require('uuid');
const emoji = require('node-emoji');
const { serializeError } = require('serialize-error');
const { getChildLogger } = require('./logging');

const NODE_ENV = config.get('env');
const CORS_ORIGINS = config.get('cors.origins');
const CORS_MAX_AGE = config.get('cors.maxAge');

/**
 * Install all required middlewares in the given app.
 *
 * @param {koa.Application} app - The Koa application.
 */
module.exports = function installMiddleware(app) {
  // Add support for nested query parameters
  koaQs(app);

  // Create a Request ID if not provided
  app.use((ctx, next) => {
    const header = 'x-request-id';
    if (!ctx.headers[header]) {
      // Let's generate an id and set the header + keep it in context state
      const id = uuid();
      ctx.headers[header] = id;
      ctx.state.requestId = id;
    }
    return next();
  });

  // Attach the request logger
  app.use((ctx, next) => {
    const logger = getChildLogger(`request(${ctx.state.requestId})`);
    ctx.logger = logger;
    return next();
  });

  // Log when requests come in and go out
  app.use(async (ctx, next) => {
    if (ctx.url === '/api/health/ping') return next();

    ctx.logger.info(`${emoji.get('fast_forward')} ${ctx.method} ${ctx.url}`);

    const getStatusEmoji = () => {
      if (ctx.status >= 500) return emoji.get('skull');
      if (ctx.status >= 400) return emoji.get('x');
      if (ctx.status >= 300) return emoji.get('rocket');
      if (ctx.status >= 200) return emoji.get('white_check_mark');
      return emoji.get('rewind');
    };

    try {
      await next();

      ctx.logger.info(
        `${getStatusEmoji()} ${ctx.method} ${ctx.status} (${ctx.response.get('X-Response-Time')}) ${ctx.url}`,
      );
    } catch (error) {
      ctx.logger.error(`${emoji.get('x')} ${ctx.method} ${ctx.status} ${ctx.url}`, {
        error: serializeError(error),
      });

      // Rethrow the error for further handling by Koa
      throw error;
    }
  });


  // Add the response time
  app.use(responseTime());

  // Add the body parser
  app.use(bodyParser());

  // Add some security headers
  app.use(koaHelmet({
    // Not needed in development (destroys GraphQL Playground)
    contentSecurityPolicy: NODE_ENV === 'development' ? false : undefined,
  }));

  // Add CORS
  app.use(koaCors({
    origin: (ctx) => {
      if (CORS_ORIGINS.indexOf(ctx.request.header.origin) !== -1) {
        return ctx.request.header.origin;
      }
      // Not a valid domain at this point, let's return the first valid as we should return a string
      return CORS_ORIGINS[0];
    },
    allowHeaders: [
      'Accept',
      'Content-Type',
      'Authorization',
    ],
    maxAge: CORS_MAX_AGE,
  }));

  // Add response utility function to context
  app.use((ctx, next) => {
    ctx.sendResponse = (status, body = {}) => {
      ctx.status = status;
      ctx.body = body;
    };
    // Don't wait for other middlewares, return here
    return next();
  });
};
