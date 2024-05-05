const koaCors = require('@koa/cors');
const config = require('config');
const bodyParser = require('koa-bodyparser');
const cacheControl = require('koa-cache-control');
const koaHelmet = require('koa-helmet');
const koaQs = require('koa-qs');
const { koaSwagger } = require('koa2-swagger-ui');
const emoji = require('node-emoji');
const swaggerJsdoc = require('swagger-jsdoc');

const { isDatabaseError } = require('./error/database');
const ServiceError = require('./error/serviceError');
const {
  getLogger,
  malicious: { maliciousCors, malicious404 },
} = require('./logging');
const { getUserFromContext } = require('./logging/helpers');
const { rateLimiter } = require('../data/rateLimiter');
const swaggerOptions = require('../swagger.config');

const NODE_ENV = config.get('env');
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

  // Log when requests come in and go out.
  app.use(async (ctx, next) => {
    getLogger().http(`${emoji.get('fast_forward')} ${ctx.method} ${ctx.url}`, {
      context: ctx,
    });

    const getStatusEmoji = () => {
      if (ctx.status >= 500) return emoji.get('skull');
      if (ctx.status >= 400) return emoji.get('x');
      if (ctx.status >= 300) return emoji.get('rocket');
      if (ctx.status >= 200) return emoji.get('white_check_mark');
      return emoji.get('rewind');
    };

    await next();

    getLogger().http(
      `${getStatusEmoji()} ${ctx.method} ${ctx.status} (${ctx.response.get('X-Response-Time')}) ${ctx.url}`,
      { context: ctx },
    );
  });

  // Add the body parser
  app.use(bodyParser());

  // Add some security headers
  app.use(
    koaHelmet({
      // Not needed in development (destroys Swagger UI)
      contentSecurityPolicy: isDevelopment ? false : undefined,
    }),
  );

  // Add CORS
  app.use(
    koaCors({
      origin: (ctx) => {
        if (CORS_ORIGINS.indexOf(ctx.request.header.origin) !== -1) {
          return ctx.request.header.origin;
        }
        // Not a valid domain at this point, let's return the first valid as we should return a string
        const {
          header: { referer, 'user-agent': userAgent },
          ip,
        } = ctx.request;
        getLogger().warn(
          `an illegal cross-origin request from ${ip} was referred from ${referer}`,
          {
            event: maliciousCors(ip, userAgent, referer),
            context: ctx,
          },
        );
        return CORS_ORIGINS[0];
      },
      allowHeaders: ['Accept', 'Content-Type', 'Authorization'],
      maxAge: CORS_MAX_AGE,
    }),
  );

  // Add rate limiter.
  app.use(
    rateLimiter({
      points: 512,
      duration: 1, // in seconds.
    }),
  );

  // Disable caching data with Cache-Control header.
  app.use(
    cacheControl({
      noCache: true,
    }),
  );

  // Add a handler for known errors
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      getLogger().error('Error occured while handling a request', {
        error,
        context: ctx,
      });

      let statusCode = error.status || 500;
      let errorBody = {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message,
        details: error.details || {},
        stack: NODE_ENV !== 'production' ? error.stack : undefined,
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

        if (error.isForbidden) {
          statusCode = 403;
        }

        if (error.isConflict) {
          statusCode = 409;
        }
      }

      ctx.status = statusCode;
      ctx.body = errorBody;
    }
  });

  // Handler for unexpected database errors.
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      if (!isDatabaseError(error)) {
        throw error;
      }
      // Database error about connection, timeout, concurrency, resource limit, permissions, etc.
      getLogger().error(
        'Unexpected database error occurred while handling request',
        { error, context: ctx },
      );

      const errorBody = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected database error occurred. Please try again later',
        stack: NODE_ENV !== 'production' ? error.stack : undefined,
      };

      ctx.status = 500;
      ctx.body = errorBody;
    }
  });

  if (isDevelopment) {
    const spec = swaggerJsdoc(swaggerOptions);
    // Install Swagger docs
    app.use(
      koaSwagger({
        routePrefix: '/swagger',
        specPrefix: '/openapi.json',
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
      ctx.status = 404;
      ctx.body = {
        code: 'NOT_FOUND',
        message: `Unknown resource: ${ctx.url}`,
      };

      const { userId, userString } = getUserFromContext(ctx);
      const {
        ip,
        header: { 'user-agent': userAgent },
      } = ctx.request;
      getLogger().warn(
        `${userString} tried to access unknown resource ${ctx.url}`,
        { event: malicious404(userId ?? ip, userAgent), context: ctx },
      );
    }
  });
};
