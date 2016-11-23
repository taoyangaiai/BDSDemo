var express     = require('express'),
  router        = express.Router(),
  mongoose      = require('mongoose'),
  BTCC        = require('../../service/BTC/btccBtcService')

module.exports = function (app) {
  app.use('/btcc', router);
};

var btccApi = new BTCC()



router.get('/queryBtc', function (req, res, next) {
    btccApi.fetchPrice()
         .then(function(data){
            res.json(btccApi.ticker)
         })
});

router.get('/queryLtc', function (req, res, next) {
   
});
