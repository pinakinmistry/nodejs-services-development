'use strict'

const express = require('express')
const { route } = require('.')
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

router.post('/', (req, res, next) => {
  const { data } = req.body
  const id = bicycle.uid()
  bicycle.create(id, data, (err) => {
    if (err) next(err)
    else res.status(201).send({id})
  })
})

router.post('/:id/update', (req, res, next) => {
  const {id} = req.params
  const {data} = req.body
  bicycle.update(id, data, (err) => {
    if (err) {
      if (err.message === 'not found') next()
      else next(err)
    } else res.status(204).send()

  })
})

router.put('/:id', (req, res, next) => {
  const {id} = req.params
  const {data} = req.body
  bicycle.update(id, data, (err) => {
    if (err) {
      if (err.message === 'not found') {
        bicycle.create(id, data, (err) => {
          if (err) next(err)
          else res.status(201).send({id})
        })
      } else next(err)
    } else res.status(204).send()
  })
})

router.delete('/:id', (req, res, next) => {
  const {id} = req.params
  bicycle.del(id, (err) => {
    if (err) {
      if (err.message === 'not found') next()
      else next(err)
    } else res.send()
  })
})

module.exports = router