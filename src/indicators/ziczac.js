const { Duplex } = require('stream') // TODO: Dublex

// NOTE: The ZigZag is not an indicator per se, but rather a means to filter out smaller price movements.
class ZicZacStream extends Duplex {
  constructor({ sensitivity = 2, highPropertyName = 'high', lowPropertyName = 'low', suffix = '' } = {}) {
    super({ objectMode: true })
    this.sensitivity = sensitivity
    this.lowPropertyName = lowPropertyName
    this.highPropertyName = highPropertyName

    this.suffix = suffix
    this.buffer = []
    this.highs = []
    this.lows = []
    this.frequencies = []
    this.changes = []

    this.highIndex = 0
    this.lowIndex = 0
  }

  check() {

    if (this.buffer.length < 2) {
      return
    }

    const index = this.buffer.length - 1
    this.highIndex = this.buffer[ this.highIndex ][ this.highPropertyName ] >= this.buffer[ index ][ this.highPropertyName ] ? this.highIndex : index
    this.lowIndex = this.buffer[ this.lowIndex ][ this.lowPropertyName ] <= this.buffer[index][ this.lowPropertyName ] ? this.lowIndex : index

    const lo = this.buffer[ this.lowIndex ][ this.lowPropertyName ]
    const hi = this.buffer[ this.highIndex ][ this.highPropertyName ]
    const latestLo = this.buffer[ index ][ this.lowPropertyName ]
    const latestHi = this.buffer[ index ][ this.highPropertyName ]
    const gap = lo * this.sensitivity / 100

    if (hi - gap > lo && lo < latestHi - gap && this.highIndex < this.lowIndex) {
      // console.log('H', {hi, lo, latestHi, latestLo, gap, index})
      this.addHigh(this.highIndex)

    } else if (lo + gap < hi && hi > latestLo + gap && this.highIndex > this.lowIndex) {
      // console.log('L', {hi, lo, latestHi, latestLo, gap, index})
      this.addLow(this.lowIndex)
    }
  }

  addHigh(index) {
    const lo = this.buffer[ this.lowIndex ][ this.lowPropertyName ]
    const hi = this.buffer[ this.highIndex ][ this.highPropertyName ]
    const change = hi - lo
    const frequency = (this.lowIndex - this.highIndex) * 2

    this.changes.push(Math.abs(change))
    this.highs.push(hi)
    this.frequencies.push( frequency )

    this.buffer[index]['ziczac' + this.suffix] = { type: 'high', change, avgChange: this.getAvg(this.changes, 20), frequency: this.getAvg(this.frequencies, 20) }
    this.highIndex = this.buffer.length - 1
    this.flush(this.lowIndex)
  }

  addLow(index) {
    const lo = this.buffer[ this.lowIndex ][ this.lowPropertyName ]
    const hi = this.buffer[ this.highIndex ][ this.highPropertyName ]
    const change = lo - hi
    const frequency = (this.highIndex - this.lowIndex) * 2

    this.changes.push(Math.abs(change))
    this.lows.push(lo)
    this.frequencies.push( frequency )

    this.buffer[index]['ziczac' + this.suffix] = { type: 'low', change, avgChange: this.getAvg(this.changes, 50), frequency: this.getAvg(this.frequencies, 50) }
    this.lowIndex = this.buffer.length - 1
    this.flush(this.highIndex)
  }

  flush(index) {
    const bufferLenght = this.buffer.length - index
    while (this.buffer.length > bufferLenght) {
      this.push(this.buffer.shift())
    }
    this.lowIndex = this.lowIndex - index
    this.highIndex = this.highIndex - index
  }

  getAvg(values, maxPeriod) {
    maxPeriod = Math.min(values.length, maxPeriod)
    const firstIndex = values.length - maxPeriod
    let sum = 0
    for (var i = values.length - 1; i >= firstIndex; i--) {
      sum = sum + values[i];
    }
    return sum / maxPeriod
  }

  _write(chunk, encoding, callback) {
    this.buffer.push(chunk)
    this.check()
    callback()
  }

  _read(size) {
    // nothing here
  }

  _final(callback) {
    // TODO: add last item

    this.flush(this.buffer.length)
    callback()
  }
}

module.exports = ZicZacStream
