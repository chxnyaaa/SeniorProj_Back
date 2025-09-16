// utils/logger.js
import { createLogger, format, transports } from 'winston';
import moment from 'moment-timezone';

const { combine, printf, colorize } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const getLogFileName = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${year}${month}${day}`;
};

// Timestamp with Timezone
const timestampWithTimezone = format((info) => {
    info.timestamp = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
    return info;
});

const logger = createLogger({
    format: combine(
        colorize(),
        timestampWithTimezone(),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: `./logging/error/${getLogFileName()}.log`, level: 'error' }),
        new transports.File({ filename: `./logging/info/${getLogFileName()}.log` })
    ]
});

export default logger;
