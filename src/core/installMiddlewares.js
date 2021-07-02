const config = require('config');
const koaCors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const koaHelmet = require('koa-helmet');
const koaQs = require('koa-qs');
const responseTime = require('koa-response-time');
const { v4: uuid } = require('uuid');
const emoji = require('node-emoji');
const { serializeError } = require('serialize-error');
const swaggerJsdoc = require('swagger-jsdoc');
const { koaSwagger } = require('koa2-swagger-ui');

const swaggerOptions = require('../swagger.config');
const { getChildLogger } = require('./logging');
const ServiceError = require('./serviceError');

const NODE_ENV = config.get('env');
const EXPOSE_STACK = config.get('exposeStack');
const CORS_ORIGINS = config.get('cors.origins');
const CORS_MAX_AGE = config.get('cors.maxAge');
const isDevelopment = NODE_ENV === 'development';

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
    contentSecurityPolicy: isDevelopment ? false : undefined,
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

  // Add a handler for known errors
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      const { logger } = ctx;
      logger.error('Error occured while handling a request', {
        error: serializeError(error),
      });

      let statusCode = error.status || 500;
      let errorBody = {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message,
        details: error.details || {},
        stack: EXPOSE_STACK ? error.stack : undefined,
      };

      if (error instanceof ServiceError) {
        if (error.isNotFound) {
          statusCode = 404;
        }

        if (error.isValidationFailed) {
          statusCode = 400;
        }

        if (error.isUnauthorized) {
          statusCode = 401;
        }
      }

      ctx.sendResponse(statusCode, errorBody);
    }
  });

  if (isDevelopment) {
    const spec = swaggerJsdoc(swaggerOptions);
    // Install Swagger docs
    app.use(
      koaSwagger({
        routePrefix: '/swagger',
        specPrefix: '/swagger/spec',
        exposeSpec: true,
        swaggerOptions: {
          spec,
        },
      }),
    );
  }

  // Handle 404 not found with uniform response
  app.use(async (ctx, next) => {
    await next();

    if (ctx.status === 404) {
      ctx.sendResponse(404, {
        code: 'NOT_FOUND',
        message: `Unknown resource: ${ctx.url}`,
      });
    }
  });
};
