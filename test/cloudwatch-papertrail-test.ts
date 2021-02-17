import expect from 'ceylon'
import { parseLogLevel, parseLogLevelRails } from '../cloudwatch-papertrail';

describe('cloudwatch-papertrail', () => {
  describe('parseLogLevel', () => {
    it('should return the log level lowercased if the message starts with a marker', () => {
      const logMessage = "2017-12-21T06:01:06.518Z\t553795a9-e614-11e7-b8be-319f71bb2584\terror: The database has exploded"
      expect(parseLogLevel(logMessage)).toEqual('error')
    })

    it("should return null if there is no log level marker", () => {
      expect(parseLogLevel('Successfully handled request')).toEqual(null)
    })
  })
  describe('parseLogLevelRails', () => {
    it('should return the log level debug if the message is D', () => {
      const logMessage = "2021-02-17 16:42:46.692468 D [558:puma threadpool 004] Rack -- Started -- { :method => \"GET\", :path => \"/\", :ip => \"172.19.0.1\" }"
      expect(parseLogLevelRails(logMessage)).toEqual('debug')
    })

    it('should return the log level info if the message is I', () => {
      const logMessage = "2021-02-17 16:42:46.692468 I [558:puma threadpool 004] Rack -- Started -- { :method => \"GET\", :path => \"/\", :ip => \"172.19.0.1\" }"
      expect(parseLogLevelRails(logMessage)).toEqual('info')
    })

    it('should return the log level warning if the message is W', () => {
      const logMessage = "2021-02-17 16:42:46.692468 W [558:puma threadpool 004] Rack -- Started -- { :method => \"GET\", :path => \"/\", :ip => \"172.19.0.1\" }"
      expect(parseLogLevelRails(logMessage)).toEqual('warning')
    })

    it('should return the log level error if the message is E', () => {
      const logMessage = "2021-02-17 16:42:46.692468 E [558:puma threadpool 004] Rack -- Started -- { :method => \"GET\", :path => \"/\", :ip => \"172.19.0.1\" }"
      expect(parseLogLevelRails(logMessage)).toEqual('error')
    })

    it('should return the log level fatal if the message is F', () => {
      const logMessage = "2021-02-17 16:42:46.692468 F [558:puma threadpool 004] Rack -- Started -- { :method => \"GET\", :path => \"/\", :ip => \"172.19.0.1\" }"
      expect(parseLogLevelRails(logMessage)).toEqual('fatal')
    })

    it("should return null if there is no log level marker", () => {
      expect(parseLogLevelRails('Successfully handled request')).toEqual(null)
    })
  })

})