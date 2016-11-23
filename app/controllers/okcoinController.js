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
      okapi.getUserInfo()
           .then(function(data){
            res.json(data)
           }).catch(function(err){
              res.json(formatError(err))
           })
});



router.get('/queryBtc', function (req, res, next) {
    okapi.fetchPrice()
         .then(function(data){
            res.json(okapi.ticker)
         })

});

router.get('/queryBtcDepth', function (req, res, next) {
    var depth = req.query.depth
    okapi.queryDepth(depth)
         .then(function(data){
            res.json(data)
         }).catch(function(err){
            res.json(formatError(err))
         })

});




router.get('/buyBtc', function (req, res, next) {
    var options = {
      symbol:'btc_cny',
      type:'buy',
      price:'10',
      amount:'0.01'
    }
    okapi.buy(options)
         .then(function(order_id){
            options.order_id = order_id
            return okapi.watch(options)
         })
         .then(function(data){
            console.log('order_info=='+data)
            res.json(data)
         })

});





router.get('/queryLtc', function (req, res, next) {
    okcoin.queryPrice('okcoin','ltc')
          .then(function(data){
                res.json(data.ticker)
          })
});


function formatError(err){
  var error = {
    result :'1',
    message:err.message
  }
  return error
}