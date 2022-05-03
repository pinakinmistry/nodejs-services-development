'use strict'

const express = require('express')
const app = express()
const createError = require('http-errors')

app.use('/', (req, res, next) => {
  if (req.method === 'POST') {
    next(createError(405))
    return
  }
  res.send('Valid route')
})

app.use((err, req, res, next) => {
  res.status(err.status)
  res.send(err.message)
})

module.exports = app