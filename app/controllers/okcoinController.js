var express     = require('express'),
  router        = express.Router(),
  mongoose      = require('mongoose'),
  OKCOIN        = require('../../service/BTC/okBtcService')

module.exports = function (app) {
  app.use('/okcoin', router);
};

var okapi = new OKCOIN()

router.get('/', function (req, res, next) {
   res.render('price',{
        title:'行情',
        pretty:true
   })
});

router.get('/getUserInfo', function (req, res, next) {
   try{
      okapi.getUserInfo()
           .then(function(data){
            console.log('data='+JSON.stringify(data))
            res.json(data)
           })
    }catch(e){
      var err = {
        result:false,
        message:e
      }
      res.json(err)
    }
});



router.get('/queryBtc', function (req, res, next) {
    okapi.fetchPrice()
         .then(function(data){
            res.json(okapi.ticker)
         })

});

router.get('/buyBtc', function (req, res, next) {
    var options = {
      symbol:'btc_cny',
      type:'buy',
      price:'680',
      amount:'0.01'
    }
    okapi.buy()

});





router.get('/queryLtc', function (req, res, next) {
    okcoin.queryPrice('okcoin','ltc')
          .then(function(data){
                res.json(data.ticker)
          })
});
