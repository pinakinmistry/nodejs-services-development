var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('me', { title: 'This is my service using express-generator@4 and handlebars' });
});

module.exports = router;
