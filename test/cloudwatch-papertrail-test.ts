import expect from 'ceylon'
import * as cloudwatchPapertrail from '../cloudwatch-papertrail'
import { parseLogLevel } from '../cloudwatch-papertrail';

describe('cloudwatch-papertrail', () => {
  describe('parseLogLevel', () => {
    it('should return the log level lowercased if the message starts with a marker', () => {
      expect(parseLogLevel('[ERROR] The database has exploded')).toEqual('error')
    })

    it('should return undefined if there is no log level marker', () => {
      expect(parseLogLevel('Successfully handled request')).toNotExist()
    })
  })
})