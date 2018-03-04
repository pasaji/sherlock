const { Writable } = require('stream')
const { DAY } = require('./utils/time-utils')
const { RSI, SMA, EMA, BB, ADX, MACD, ZicZac } = require('./indicators')
const ExchangeAPI = require('./services/exchange-api')
const RSIAnalyzer = require('./analyzers/rsi-analyzer')

class Sherlock {
  constructor({ keychain } = {}) {
    this.keychain = keychain
    this.api = new ExchangeAPI({ keychain: this.keychain })
  }
  analyse({ exchange, market }) {

    // indicators
    const rsi = new RSI()
    const zicZac = new ZicZac({ sensitivity: 3 })
    // const rsiZicZac = new ZicZac({ sensitivity: 10,  })

    // analyzers
    const rsiAnalyzer = new RSIAnalyzer()

    this.api.ohlcv({ exchange, market })
      .pipe(rsi)
      .pipe(zicZac)
      .pipe(rsiAnalyzer.ohlcv())
      .pipe(this.report())
      .on('finish', () => console.log('Done!'))
  }

  report() {
    const stream = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        if (chunk.ziczac) {
          // console.log('reporting...\n', chunk)
           const dealsPerDay = ((DAY / chunk.timeframe) / chunk.ziczac.frequency)
           const maxProfit = dealsPerDay * chunk.ziczac.avgChange
           console.log('MAX PROFIT / DAY:' + (Math.floor(1000 * maxProfit / chunk.close ) / 10) + '% , Deals Per Day:' + (Math.round(dealsPerDay*10)/10))
        }
        callback()
      }
    })
    return stream
  }
}

module.exports = Sherlock
