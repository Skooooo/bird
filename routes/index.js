var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('bird_list', { title: 'Bird List' });
});

router.get('/recent', function(req, res) {
  res.render('bird_recent', { title: 'Recent' });
});

router.get('/detail', function(req, res) {
  res.render('bird_details', { title: 'Details' });
});

router.use(express.static('public'))

module.exports = router;

