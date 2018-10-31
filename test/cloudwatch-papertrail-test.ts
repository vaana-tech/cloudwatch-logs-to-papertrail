import expect from 'ceylon'
import { parseLogLevel } from '../cloudwatch-papertrail';

describe('cloudwatch-papertrail', () => {
  describe('parseLogLevel', () => {
    it('should return the log level lowercased if the message starts with a marker', () => {
      const logMessage = "2017-12-21T06:01:06.518Z\t553795a9-e614-11e7-b8be-319f71bb2584\terror: The database has exploded"
      expect(parseLogLevel(logMessage)).toEqual('error')
    })

    it("2017-12-21T06:01:06.518Z\t553795a9-e614-11e7-b8be-319f71bb2584\tshould return null if there is no log level marker", () => {
      expect(parseLogLevel('Successfully handled request')).toEqual(null)
    })
  })
})