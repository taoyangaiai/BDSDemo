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

//查看深度
router.get('/queryBtcDepth', function (req, res, next) {
    var depth = req.query.depth || 0.01
    okapi.queryDepth(depth)
         .then(function(data){
            res.json(data)
         }).catch(function(err){
            res.json(formatError(err))
         })

});

//买入
router.post('/buyBtc', function (req, res, next) {
    var options = {
      symbol:'btc_cny',
      type:'buy',
      price:req.body.price,
      amount:req.body.amount
    }
    var back_data = {}
    okapi.buy(options)
         .then(function(order_id){
          if(order_id){
            back_data.result=true
            back_data.order_id = order_id
            res.json(back_data)
          }            
         }).catch(function(err){
            back_data.result = false
            back_data.message = err
            res.json(back_data)
         })
});

//卖出
router.post('/sellBtc', function (req, res, next) {
    var options = {
      symbol:'btc_cny',
      type:'sell',
      price:req.body.price,
      amount:req.body.amount
    }
    var back_data = {}
    okapi.buy(options)
         .then(function(order_id){
          if(order_id){
            back_data.result=true
            back_data.order_id = order_id
            res.json(back_data)
          }            
         }).catch(function(err){
            back_data.result = false
            back_data.message = err
            res.json(back_data)
         })
});

//获取历史记录
router.get('/fetchOrderHistory',function(req,res,next){
  var status = req.query.status
  var current_page = req.query.current_page || 1
  // status 0-未完成 1-已完成
  var options = {
    status:status,
    current_page:current_page
  }
  okapi.fetchOrderHistory(options)
       .then(function(data){
        //console.log('controller get data:'+JSON.stringify(data))
        res.json(data)
       }).catch(function(err){
        res.json(formatError(err))
       })
})


//撤单
router.get('/cancel',function(req,res,next){
  var order_id = req.query.order_id
  okapi.cancelOrder(order_id)
       .then(function(data){
        res.end()
       }).catch(function(err){
        console.log(err)
       })
})

router.get('/autoProfitOn',function(req,res,next){
    // var taskNum = req.query.taskNum || 2
    // for(var i = 0;i<taskNum;i++){
    //   task.push(new OKCOIN())
    // }
    // task.forEach(function(item){
    //   item.autoProfitOn()
    // })
    okapi.autoProfitOn()
    res.end()
})

router.get('/autoProfitOff',function(req,res,next){
    // task.forEach(function(item){
    //   item.autoProfitOff()
    // })
    okapi.autoProfitOff()
    res.end()
})



function formatError(err){
  var error = {
    result :'1',
    message:err.message
  }
  return error
}