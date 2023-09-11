const koaCors = require("@koa/cors");
const bodyParser = require("koa-bodyparser");
const koaHelmet = require("koa-helmet");
const koaQs = require("koa-qs");
const { koaSwagger } = require("koa2-swagger-ui");
const emoji = require("node-emoji");
const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = require("../swagger.config");
const { getLogger } = require("./logging");
const ServiceError = require("./serviceError");

const NODE_ENV = process.env.NODE_ENV;
const EXPOSE_STACK = process.env.EXPOSE_STACK;
const CORS_ORIGINS = process.env.CORS_ORIGINS;
const CORS_MAX_AGE = process.env.CORS_MAX_AGE;
console.log(`configs ${NODE_ENV} ${EXPOSE_STACK}`);
const isDevelopment = NODE_ENV === "development";

/**
 * Install all required middlewares in the given app.
 *
 * @param {koa.Application} app - The Koa application.
 */
module.exports = function installMiddleware(app) {
  // Add support for nested query parameters
  koaQs(app);

  // Log when requests come in and go out
  app.use(async (ctx, next) => {
    if (ctx.url === "/api/health/ping") return next();

    getLogger().info(`${emoji.get("fast_forward")} ${ctx.method} ${ctx.url}`);

    const getStatusEmoji = () => {
      if (ctx.status >= 500) return emoji.get("skull");
      if (ctx.status >= 400) return emoji.get("x");
      if (ctx.status >= 300) return emoji.get("rocket");
      if (ctx.status >= 200) return emoji.get("white_check_mark");
      return emoji.get("rewind");
    };

    try {
      await next();

      getLogger().info(
        `${getStatusEmoji()} ${ctx.method} ${ctx.status} (${ctx.response.get(
          "X-Response-Time"
        )}) ${ctx.url}`
      );
    } catch (error) {
      getLogger().error(
        `${emoji.get("x")} ${ctx.method} ${ctx.status} ${ctx.url}`,
        {
          error,
        }
      );

      // Rethrow the error for further handling by Koa
      throw error;
    }
  });

  // Add the body parser
  app.use(bodyParser());

  // Add some security headers
  app.use(
    koaHelmet({
      // Not needed in development (destroys Swagger UI)
      contentSecurityPolicy: isDevelopment ? false : undefined,
    })
  );

  // Add CORS
  app.use(
    koaCors({
      origin: (ctx) => {
        if (CORS_ORIGINS.indexOf(ctx.request.header.origin) !== -1) {
          return ctx.request.header.origin;
        }
        // Not a valid domain at this point, let's return the first valid as we should return a string
        return CORS_ORIGINS[0];
      },
      allowHeaders: ["Accept", "Content-Type", "Authorization"],
      maxAge: CORS_MAX_AGE,
    })
  );

  // Add a handler for known errors
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      getLogger().error("Error occured while handling a request", {
        error,
      });

      let statusCode = error.status || 500;
      let errorBody = {
        code: error.code || "INTERNAL_SERVER_ERROR",
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

        if (error.isForbidden) {
          statusCode = 403;
        }
      }

      ctx.status = statusCode;
      ctx.body = errorBody;
    }
  });

  if (isDevelopment) {
    const spec = swaggerJsdoc(swaggerOptions);
    // Install Swagger docs
    app.use(
      koaSwagger({
        routePrefix: "/swagger",
        specPrefix: "/openapi.json",
        exposeSpec: true,
        swaggerOptions: {
          spec,
        },
      })
    );
  }

  // Handle 404 not found with uniform response
  app.use(async (ctx, next) => {
    await next();

    if (ctx.status === 404) {
      ctx.status = 404;
      ctx.body = {
        code: "NOT_FOUND",
        message: `Unknown resource: ${ctx.url}`,
      };
    }
  });
};
