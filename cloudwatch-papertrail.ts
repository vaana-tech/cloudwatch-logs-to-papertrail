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

interface IHash {
  [details: string] : string;
}

function getEnvVarOrFail(varName: string): string {
  const value = process.env[varName]
  if (!value) {
    throw new Error(`Required environment variable ${varName} is undefined`)
  }
  return value
}

function getEnvVarOrDefault(varName: string, defValue: string): string {
  const value = process.env[varName]
  if (!value) {
    return defValue
  }
  return value
}

// Default (winston) log format
//
// Should match winston simple log format for example: "error: The database has exploded"
// For more information see https://github.com/winstonjs/winston
// The pattern represents the following:
// A sequence of non-tab chars at the start of input followed by a tab
// Another sequence of non-tabs followed by a tab
// Capture a group of alphanumeric chars leading up to a ':'
const logLevelWinstonRegex = "^[^\t]+\t[^\t]+\t(\\w+):"
// default log level mapping (winston => syslog)
// maps from winston
//   silly: 6
//   debug: 5,
//   verbose: 4,
//   http: 3,
//   info: 2,
//   warn: 1,
//   error: 0,
//
// to syslog
//   debug: 7,
//   info: 6,
//   notice: 5,
//   warning: 4,
//   warn: 4,
//   error: 3,
//   err: 3,
//   crit: 2,
//   alert: 1,
//   emerg: 0,

const logLevelWinstonMapping = `{ "silly": "info",
                                  "debug": "notice",
                                  "verbose": "info",
                                  "http": "info",
                                  "info": "info",
                                  "warn": "warn",
                                  "error": "error" }`

const logLevelRegex = new RegExp(getEnvVarOrDefault('LOG_LEVEL_REGEX',logLevelWinstonRegex))
const logLevelMapping : IHash = JSON.parse(getEnvVarOrDefault('LOG_LEVEL_MAPPING',logLevelWinstonMapping))

export function parseLogLevel(tsvMessage: string): string | null {
  const match = logLevelRegex.exec(tsvMessage)

  if(match) {
    return logLevelMapping[match[1].toString()]
  }
  return null
}

export const handler: AwsLambda.Handler = (event: CloudwatchLogGroupsEvent, context, callback) => {
  const host = getEnvVarOrFail('PAPERTRAIL_HOST')
  const port = getEnvVarOrFail('PAPERTRAIL_PORT')
  const shouldParseLogLevels = getEnvVarOrFail('PARSE_LOG_LEVELS') === "true"
  const payload = new Buffer(event.awslogs.data, 'base64');

  unarchiveLogData(payload)
    .then((logData: LogData) => {
      console.log("Got log data")
      console.log(logData)

      const papertrailTransport = new winston.transports.Papertrail({
        host,
        port,
        program: logData.logStream,
        hostname: logData.logGroup,
        flushOnClose: true,
        colorize: true,
      })


      const logger = new (winston.Logger)({
        transports: [papertrailTransport],
        levels: {
          debug: 7,
          info: 6,
          notice: 5,
          warning: 4,
          warn: 4,
          error: 3,
          err: 3,
          crit: 2,
          alert: 1,
          emerg: 0,
        }
      });

      logData.logEvents.forEach(function (event) {
        const logLevel = shouldParseLogLevels
          ? parseLogLevel(event.message) || 'info'
          : 'info'
        logger.log(logLevel, event.message);
      });

      logger.close()
      return callback!(null);
    })
    .catch(callback!)
};