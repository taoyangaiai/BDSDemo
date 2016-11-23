var express     = require('express'),
  router        = express.Router(),
  mongoose      = require('mongoose'),
  HuoBi        = require('../../service/BTC/huobiBtcService')

module.exports = function (app) {
  app.use('/huobi', router);
};

var huobiApi = new HuoBi()



router.get('/queryBtc', function (req, res, next) {
    huobiApi.fetchPrice()
         .then(function(data){
            res.json(huobiApi.ticker)
         })

});
router.get('/queryLtc', function (req, res, next) {
   
});
