import * as AwsLambda from 'aws-lambda'
import * as zlib from 'zlib'
import * as winston from 'winston'
import 'winston-papertrail'

function unarchiveLogData(payload: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    zlib.gunzip(payload, function (err, result) {
      if (err) {
        return reject(err);
      } else {
        return resolve(result)
      }
    })
  }).then(rawData => {
    return JSON.parse(rawData.toString('utf8'));
  })
}

interface CloudwatchLogGroupsEvent {
  awslogs: {
    data: string
  }
}

interface LogMessage {
  id: string
  timestamp: number
  message: string
}

interface LogData {
  owner: string
  logGroup: string
  logStream: string
  subscriptionFilters: string[],
  messageType: string
  logEvents: LogMessage[]
}

function getEnvVarOrFail(varName: string): string {
  const value = process.env[varName]
  if (!value) {
    throw new Error(`Required environment variable ${varName} is undefined`)
  }
  return value
}

// Should match for example: "[error] The database has exploded"
const logLevelRegex = /^\[(\w+)\]/

export function parseLogLevel(tsvMessage: string): string | undefined {
  // The message is a tab separated value string of three columns:
  // date string (ISO8601), request ID, log message
  const messageColumns = tsvMessage.split("\t")
  if (messageColumns.length != 3) {
    console.warn('Got message with unexpected number of TSV columns:', tsvMessage)
    return undefined
  }
  const message = messageColumns[2]
  const match = logLevelRegex.exec(message)
  if (match) {
    return match[1].toLowerCase()
  } else {
    return undefined
  }
}

export const handler: AwsLambda.Handler = (event: CloudwatchLogGroupsEvent, context, callback) => {
  const payload = new Buffer(event.awslogs.data, 'base64');
  const host = getEnvVarOrFail('PAPERTRAIL_HOST')
  const port = getEnvVarOrFail('PAPERTRAIL_PORT')
  const shouldParseLogLevels = getEnvVarOrFail('PARSE_LOG_LEVELS') === "true"

  unarchiveLogData(payload)
    .then((logData: LogData) => {
      console.log("Got log data")
      console.log(logData)

      const papertrailTransport = new winston.transports.Papertrail({
        host,
        port,
        program: logData.logGroup,
        hostname: logData.logStream,
        flushOnClose: true,
      })

      const logger = new (winston.Logger)({
        transports: [papertrailTransport]
      });

      logData.logEvents.forEach(function (event) {
        const logLevel = shouldParseLogLevels
          ? parseLogLevel(event.message) || 'info'
          : 'info'
        logger.log(logLevel, event.message);
      });

      logger.close()
      return callback!(null);
    });
};