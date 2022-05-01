'use strict'

const http = require('http')
const PORT = process.env.PORT || 3000
const url = require('url')
const { STATUS_CODES } = http
const data = require('./data')

const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url)
  if (pathname !== '/') {
    res.statusCode = 404
    res.end(STATUS_CODES[res.statusCode])
  }
  const value = await data()
  res.end(value)
})

server.listen(PORT)