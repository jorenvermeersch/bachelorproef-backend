const config = require('config');
const { format: formatDate } = require('date-fns');
const winston = require('winston');
const { combine, timestamp, colorize, printf, json } = winston.format;

const HOST = config.get('host');
const PORT = config.get('port');

let context;

const setLoggingContext = (ctx) => {
  context = ctx;
};

/**
 * Winston format function that formats the timestamp in ISO 8601 format
 * with UTC offset to ensure maximum data portability.
 *
 * @returns {winston.Logform.Format} The format function
 */
const timestampWithUtcOffset = () => {
  return timestamp({
    format: () => formatDate(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
  });
};

/**
 * Winston format function that adds information of the Koa context to the log.
 * This includes the useragent, source IP, hostname, port, request URI and request method.
 *
 * @returns {winston.Logform.Format} The format function
 */
const koaContext = winston.format((info) => {
  if (!context) {
    return info;
  }

  const { method, url, header, ip } = context.request;

  // Event must be added manually.
  info.appid = 'hogent_budgetapp';
  info.useragent = header['user-agent'];
  info.sourceIp = ip;
  info.hostname = HOST;
  info.port = PORT;
  info.requestUri = url;
  info.requestMethod = method;

  return info;
});

const securityInfo = winston.format((info) => {
  const logInfo = info.error?.logInfo || undefined;

  if (!logInfo) {
    return info;
  }

  Object.entries(logInfo).forEach(([key, value]) => {
    info[key] = value;
  });

  delete info.error;

  return info;
});

const consoleFormat = () => {
  const formatMessage = ({
    level,
    message,
    timestamp,
    name = 'server',
    ...rest
  }) => {
    return `${timestamp} | ${name} | ${level} | ${message} | ${JSON.stringify(rest)}`;
  };

  const formatError = ({ error: { stack }, ...rest }) => {
    return `${formatMessage(rest)}\n\n${stack}\n`;
  };

  const format = (info) => {
    return info.error instanceof Error
      ? formatError(info)
      : formatMessage(info);
  };

  return combine(
    colorize(),
    timestampWithUtcOffset(),
    koaContext(),
    printf(format),
  );
};

const fileFormat = () => {
  return combine(
    timestampWithUtcOffset(),
    koaContext(),
    securityInfo(),
    json(),
  );
};

module.exports = {
  consoleFormat,
  fileFormat,
  setLoggingContext,
};
