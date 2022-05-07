var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const { greeting = 'Hello' } = req.query
  res.render('hello', { greeting })
});

module.exports = router;
