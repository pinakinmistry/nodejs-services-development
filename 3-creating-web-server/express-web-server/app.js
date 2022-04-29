'use strict'

const express = require('express')
const app = express()
const createError = require('http-errors')
const rootRoute = require('./routes/index')
const helloRoute = require('./routes/hello')

app.use('/', rootRoute)
app.use('/hello', helloRoute)

app.use((req, res, next) => {
  if (req.method !== 'GET') {
    next(createError(405))
  }
  next(createError(404))
})

app.use((err, req, res, next) => {
  res.status(err.status || 500)
  res.send(err.message)
})

module.exports = app