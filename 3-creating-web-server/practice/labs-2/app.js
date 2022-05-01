'use strict'

const express = require('express')
const app = express()

app.use('/', (req, res) => {
  res.send('Valid route')
})

module.exports = app