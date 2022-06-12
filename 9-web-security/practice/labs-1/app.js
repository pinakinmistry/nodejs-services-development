'use strict'
const express = require('express')
const app = express()
const router = express.Router()
const { PORT = 3000 } = process.env

router.get('/', (req, res) => {
  setTimeout(() => {
    if (Array.isArray(req.query.un)) {
      res.send((req.query.un.join(' ').toUpperCase()))
    } else {
      res.send((req.query.un || '').toUpperCase())
    }
  }, 1000)
})

app.use(router)

app.listen(PORT, () => {
  console.log(`Express server listening on ${PORT}`)
})