import winston from 'winston';

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const level = (): string => (process.env['NODE_ENV'] === 'production' ? 'warn' : 'debug');

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level: lvl, message }) =>
        `${String(timestamp)} [${String(lvl)}] ${String(message)}`),
    ),
  }),
];

export const logger = winston.createLogger({ level: level(), levels, format, transports });
