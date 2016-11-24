var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose')

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
    res.render('index', {
      title: 'BDS'
    });
});
router.get('/price', function (req, res, next) {
    res.render('price', {
      title: '行情',
      pretty:true
    });
});
