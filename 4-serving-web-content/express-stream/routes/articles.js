var express = require('express');
var router = express.Router();
const hnStream = require('hn-latest-stream')
const finished = require('stream').finished

/* GET users listing. */
router.get('/', function(req, res, next) {
  const { amount = 250, type = 'html' } = req.query
  const stream = hnStream(amount, type)

  stream.pipe(res, { end: false })

  finished(stream, err => {
    if (err) {
      next(err)
      return
    }
    res.end()
  })
});

module.exports = router;