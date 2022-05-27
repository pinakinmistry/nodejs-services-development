'use strict'

const express = require('express')
const router = express.Router()
const { bicycle } = require('../model')

router.get('/:id', (req, res, next) => {
  const { id } = req.params
  bicycle.read(id, (err, data) => {
    if (err) {
      if (err.message === 'not found') {
        next()
      } else next(err)
    } else {
      res.send(data)
    }
  })
})

module.exports = router