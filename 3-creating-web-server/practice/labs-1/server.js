'use strict'

const http = require('http')
const PORT = process.env.PORT || 3000
const data = require('./data')
const server = http.createServer(async (req, res) => {
  const value = await data()
  res.end(value)
})

server.listen(PORT)