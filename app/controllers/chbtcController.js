var express     = require('express'),
  router        = express.Router(),
  mongoose      = require('mongoose'),
  CHBTC        = require('../../service/BTC/chbtcBtcService')

module.exports = function (app) {
  app.use('/chbtc', router);
};

var chbtcApi = new CHBTC()



router.get('/queryBtc', function (req, res, next) {
    chbtcApi.fetchPrice()
         .then(function(data){
            res.json(chbtcApi.ticker)
         })

});
router.get('/queryLtc', function (req, res, next) {
   
});
