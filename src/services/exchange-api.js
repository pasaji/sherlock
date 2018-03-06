const ccxt = require('ccxt')
const { Readable } = require('stream')
const { WEEK, DAY, now } = require('../utils/time-utils')

class ExchangeAPI {
  constructor({ keychain = {} }) {
    this.keychain = keychain
    this.exchanges = {}
  }

  ohlcv({ exchange, market }) {
    if (!this.exchanges.hasOwnProperty(exchange)) {
      this.exchanges[ exchange ] = new ccxt[ exchange ]({ 'timeout': 30000 })
    }
    const rs = new Readable({
      objectMode: true,
      read(size) {}
    })
    const e = this.exchanges[ exchange ]
    const timeframe = e.timeframes['15m'] * 1000
    e.fetchOHLCV(market, '15m', now() - WEEK, 99999).then((result) => {
      result.forEach((item) => {
        rs.push({ date: item[0], open: item[1], high: item[2], low: item[3], close: item[4], volume: item[5], timeframe })
      })
      rs.push(null) // end of stream
    }, (err) => {
      throw err
    });
    return rs
  }
}

module.exports = ExchangeAPI
