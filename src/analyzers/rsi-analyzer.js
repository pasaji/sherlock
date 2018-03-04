const { Transform } = require('stream')

class RSIAnalyzer {
  constructor(options = {}) {

  }

  ohlcv() {
    const self = this
    const stream = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        self.analyze(chunk, callback)
      }
    })
    return stream
  }

  analyze(item, cb) {
    // console.log('analysing...');
    cb(null, item)
  }
}

module.exports = RSIAnalyzer
