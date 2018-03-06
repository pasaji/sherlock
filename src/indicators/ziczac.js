const { Duplex } = require('stream') // TODO: Dublex

// NOTE: The ZigZag is not an indicator per se, but rather a means to filter out smaller price movements.
class ZicZacStream extends Duplex {
  constructor({ sensitivity = 2, highPropertyName = 'high', lowPropertyName = 'low', range, suffix = '' } = {}) {
    super({ objectMode: true })
    this.sensitivity = sensitivity
    this.lowPropertyName = lowPropertyName
    this.highPropertyName = highPropertyName

    this.suffix = suffix
    this.buffer = []
    this.highs = []
    this.lows = []
    this.changes = []
    this.lastType = null
    this.range = range

    this.highIndex = 0
    this.lowIndex = 0
  }

  check(last = false) {

    if (this.buffer.length < 2) {
      return
    }

    const index = this.buffer.length - 1

    if (this.lastType === 'low') {
      this.lowIndex = this.buffer[ this.lowIndex ][ this.lowPropertyName ] <= this.buffer[index][ this.lowPropertyName ] ? this.lowIndex : index
    } else if (this.lastType === 'high') {
      this.highIndex = this.buffer[ this.highIndex ][ this.highPropertyName ] >= this.buffer[ index ][ this.highPropertyName ] ? this.highIndex : index
    } else {
      this.highIndex = this.buffer[ this.highIndex ][ this.highPropertyName ] >= this.buffer[ index ][ this.highPropertyName ] ? this.highIndex : index
      this.lowIndex = this.buffer[ this.lowIndex ][ this.lowPropertyName ] <= this.buffer[index][ this.lowPropertyName ] ? this.lowIndex : index
    }

    const lo = this.buffer[ this.lowIndex ][ this.lowPropertyName ]
    const hi = this.buffer[ this.highIndex ][ this.highPropertyName ]
    const latestLo = this.buffer[ index ][ this.lowPropertyName ]
    const latestHi = this.buffer[ index ][ this.highPropertyName ]
    const gap = ( this.range ? this.range.max - this.range.min : lo ) * this.sensitivity / 100

    if ( this.highIndex < this.lowIndex && hi - gap > lo && (lo < latestHi - gap || last) ) {
      this.addHigh(this.highIndex)
    } else if ( this.highIndex > this.lowIndex && lo + gap < hi && (hi > latestLo + gap || last) ) {
      this.addLow(this.lowIndex)
    }
  }

  addHigh(index) {
    const lo = this.buffer[ this.lowIndex ][ this.lowPropertyName ]
    const hi = this.buffer[ this.highIndex ][ this.highPropertyName ]
    const change = hi - lo
    const period = this.lowIndex - this.highIndex

    this.changes.push(Math.abs(change))
    this.highs.push(hi)
    this.lastType = 'high'

    this.buffer[index]['ziczac' + this.suffix] = { type: 'high', change, period }
    this.highIndex = this.buffer.length - 1
    this.flush(this.lowIndex)
  }

  addLow(index) {
    const lo = this.buffer[ this.lowIndex ][ this.lowPropertyName ]
    const hi = this.buffer[ this.highIndex ][ this.highPropertyName ]
    const change = lo - hi
    const period = this.highIndex - this.lowIndex

    this.changes.push(Math.abs(change))
    this.lows.push(lo)
    this.lastType = 'low'

    this.buffer[index]['ziczac' + this.suffix] = { type: 'low', change, period }
    this.lowIndex = this.buffer.length - 1
    this.flush(this.highIndex)
  }

  flush(index) {
    const bufferLenght = this.buffer.length - index
    while (this.buffer.length > bufferLenght) {
      this.push(this.buffer.shift())
    }
    this.lowIndex = Math.max(this.lowIndex - index, 0)
    this.highIndex = Math.max(this.highIndex - index, 0)
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
    // last check
    this.check(true)
    this.flush(this.buffer.length)
    callback()
  }
}

module.exports = ZicZacStream
