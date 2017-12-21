import * as winston from "winston"

interface PapertrailTransportOptions {
    host: string
    port: number
    disableTls: boolean
    level: keyof winston.NpmConfigSetColors
    levels: winston.NpmConfigSetColors
    hostname: string
    program: string
    facility: string
    logFormat: string
    colorize: boolean
    inlineMeta: boolean
    handleExceptions: boolean
    flushOnClose: boolean
    depth: number
    attemptsBeforeDecay: number
    maximumAttempts: number
    connectionDelay: number
    maxDelayBetweenReconnection: number
    maxBufferSize: number
}

interface PapertrailTransportInstance extends winston.TransportInstance {
    new(options?: PapertrailTransportOptions): PapertrailTransportInstance
}

declare module "winston" {
    interface Transports {
        Papertrail: PapertrailTransportInstance
    }
}