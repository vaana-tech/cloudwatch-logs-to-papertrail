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

// Should match winston simple log format for example: "error: The database has exploded"
// For more information see https://github.com/winstonjs/winston
// The pattern represents the following:
// A sequence of non-tab chars at the start of input followed by a tab
// Another sequence of non-tabs followed by a tab
// Capture a group of alphanumeric chars leading up to a ':'
const logLevelRegex = /^[^\t]+\t[^\t]+\t(\w+):/
// default Rails Sematic Logger format
// <space><firs letter of level><space>
const logLevelRegexRails = /\s([DIWEF])\s\[/

export function parseLogLevel(tsvMessage: string): string | null {
  // Messages logged manually are tab separated value strings of three columns:
  // date string (ISO8601), request ID, log message
  const match = logLevelRegex.exec(tsvMessage)
  return match && match[1].toLowerCase()
}

export function parseLogLevelRails(tsvMessage: string): string | null {
  // Messages logged manually are tab separated value strings of three columns:
  // date string (ISO8601), request ID, log message
  const match = logLevelRegexRails.exec(tsvMessage)

  // see https://github.com/winstonjs/winston#logging-levels
  // somehow 'error' is winstons highest level? :-(
  const mapping : IHash = {"D": 'debug','I': 'info', 'W': 'warn', 'E': 'error', 'F': 'error' };

  if(match) {
    return mapping[match[1].toString()]
  }
  return null
}

function parseTypedLogLevel(type: string, tsvMessage: string): string | null {
  if(type == 'RAILS') {
    return parseLogLevelRails(tsvMessage)
  }
  return parseLogLevel(tsvMessage)
}

export const handler: AwsLambda.Handler = (event: CloudwatchLogGroupsEvent, context, callback) => {
  const host = getEnvVarOrFail('PAPERTRAIL_HOST')
  const port = getEnvVarOrFail('PAPERTRAIL_PORT')
  const shouldParseLogLevels = getEnvVarOrFail('PARSE_LOG_LEVELS') === "true"
  const logLevelFormat = getEnvVarOrDefault('LOG_FORMAT','WINSTON')
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
        transports: [papertrailTransport]
      });

      logData.logEvents.forEach(function (event) {
        const logLevel = shouldParseLogLevels
          ? parseTypedLogLevel(logLevelFormat, event.message) || 'info'
          : 'info'
        logger.log(logLevel, event.message);
      });

      logger.close()
      return callback!(null);
    })
    .catch(callback!)
};