var express = require('express');
var router = express.Router();
const model = require('../model')

/* GET users listing. */
router.get('/:id', function(req, res, next) {
  const { id } = req.params
  model.boat.read(id, (err, result) => {
    if (err) {
      if (err.message === 'not found') next()
      else next(err)
    } else res.send(result)
  })
});

module.exports = router;
