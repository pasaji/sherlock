const express = require('express')
const Sherlock = require('./src/sherlock')

const sherlock = new Sherlock({ keychain: { poloniex: {} } })

sherlock.analyse({ exchange: 'poloniex', market: 'BTC/USDT' })

const app = express()
app.use(express.static('public'))
// app.get('/state', (req, res) => res.json(lambo.getState()))
app.get('/', (req, res) => res.sendFile('index.html'))
app.listen(3000, () => console.log('Example app listening on port 3000!'))
