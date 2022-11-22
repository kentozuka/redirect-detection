import winston from 'winston'
import { join } from 'path'

const format = winston.format

const logFile = (fn: string) => join(process.cwd(), 'log', `${fn}.log`)

export const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: logFile('combined')
    }),
    new winston.transports.File({
      filename: logFile('error'),
      level: 'error'
    })
  ]
})
