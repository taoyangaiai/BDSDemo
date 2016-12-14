var Promise 		= require('bluebird')
var request 		= Promise.promisify(require('request'))
var OKBtc 			= require('../../lib/util/OKBtc')
var MD5 			= require('../../lib/util/okSignMD5')
var apiConfig 		= require('../../config/apiConfig')

var prefix = 'https://www.okcoin.cn/api/v1/'
var api = {
		price:{
			btc : prefix+'ticker.do?symbol=btc_cny',
			depth:prefix+'depth.do'
		},
		trade:{
			buy:prefix+'',
			cancel:prefix+'cancel_order.do'
		},
		user:{
			info:prefix+'userinfo.do'
		},
		history:{
			btc:prefix+'order_history.do'
		}

}

function OKBTC(){
	this.amount = 0.1
	this.totalNum = 0
	this.failsNum = 0
	this.kunsun = 0
	this.profit = 0
	this.timeout = 15000
	this.flow_profit = 0.01
	this.fetchPrice()
}

OKBTC.prototype.fetchPrice = function(){
	var that = this
		if(that.date && that.ticker){
			if(that.isValidPrice(this)){
				return Promise.resolve(this)
			}
		}
		return new Promise(function(resolve,reject){
			that.queryPrice()
				.then(function(data){
					that.date = data.date
					that.ticker = data.ticker
					resolve(data)
				})
			
		})
}

//验证当前价格
OKBTC.prototype.isValidPrice = function(data){
	if(!data || !data.date ||!data.ticker){
		return false
	}
	var date = (+data.date+0.4)*1000
	var now = new Date().getTime()
	if(now<date){
		return true
	}else{
		return false
	}
}

//查询最新价格
OKBTC.prototype.queryPrice = function(){
	return new Promise(function(resolve,reject){
		var url = api.price.btc
		request({method:'GET',url : url, json :true}).then(function(res){
			var _data = res.body
			if(_data){
				console.log(_data.ticker.last)
				resolve(_data)
			}else{
				throw new Error('get okcoin btc price fails')
			}
		}).catch(function(err){
			reject(err)
		})
	})
}
//获取用户信息
OKBTC.prototype.getUserInfo = function(){
	return new Promise(function(resolve,reject){
			OKBtc.getUserInfo()
				 .then(function(data){
				 	resolve(data)
				 }).catch(function(err){
				 	reject(err)
				 })
	})
	
}
//查询深度
OKBTC.prototype.queryDepth = function(depth){
	var that = this
	return new Promise(function(resolve,reject){
		var url = api.price.depth+'?symbol=btc_cny&size=5&merge='+depth
	
		request({method:'GET',url:url,json:true}).then(function(res){
			var _data = res.body
			if(_data){
				//console.log('depth='+depth+'depth_data = '+JSON.stringify(_data))
				that.asks = _data.asks
				that.bids = _data.bids
				resolve(_data)
			}else{
				throw new Error('get okcoin btc depth fails')
			}
		}).catch(function(err){
			reject(err)
		})
	})
}


OKBTC.prototype.buy = function(opt){
	return new Promise(function(resolve,reject){
		OKBtc.trade(opt)
			 .then(function(data){
			 	if(data){
			 		resolve(data)
			 	}
			 }).catch(function(err){
			 	reject(err)
			 })
	})
	
}

OKBTC.prototype.sell = function(opt){
	return new Promise(function(resolve,reject){
		OKBtc.trade(opt)
			 .then(function(data){
			 	if(data){
			 		resolve(data)
			 	}
			 }).catch(function(err){
			 	reject(err)
			 })
	})
	
}
//查询单个订单详情
OKBTC.prototype.watch = function(opt){
	return new Promise(function(resolve,reject){
		OKBtc.watch(opt)
			 .then(function(data){
			 	if(data){
			 		resolve(data)
			 	}
			 }).catch(function(err){
			 	reject(err)
			 })
	})
}

OKBTC.prototype.fetchOrderHistory = function(opt){
	var str = 'api_key='+apiConfig.okcoin.api_key+'&current_page='+opt.current_page+'&page_length=200&status='
			+opt.status+'&symbol=btc_cny&secret_key='+apiConfig.okcoin.secret_key
	str = MD5.format(str)
	var options = {
		api_key:apiConfig.okcoin.api_key,
		symbol:'btc_cny',
		status:opt.status,
		current_page:opt.current_page,
		page_length:'200',
		sign:str
	}
	return new Promise(function(resolve,reject){
		var url = api.history.btc
		request({method:'POST',url:url,form:options,json:true}).then(function(res){
			var data = res[1]
			if(!data){
				data = res.body
			}
			if(data){
				resolve(data)
			}else{
				throw new Error('fetch history fails')
			}
		}).catch(function(err){
			reject(err)
		})
	})
}

//撤销订单
OKBTC.prototype.cancelOrder = function(order_id){
	var str = 'api_key='+apiConfig.okcoin.api_key+'&order_id='+order_id
			+'&symbol=btc_cny&secret_key='+apiConfig.okcoin.secret_key
	str = MD5.format(str)

	var options = {
		api_key:apiConfig.okcoin.api_key,
		symbol:'btc_cny',
		order_id:order_id,
		sign:str
	}
	return new Promise(function(resolve,reject){
		var url = api.trade.cancel
		request({method:'POST',url:url,json:true,form:options}).then(function(res){
			var data = res[1]
			if(!data){
				data= res.body
			}
			if(data){
				resolve(data)
			}else{
				throw new Error('cancel order fails')
			}
		}).catch(function(err){
			reject(err)
		})
	})
}

OKBTC.prototype.autoProfitOn = function(){
	console.log('turn on ')
	this.goNext = true
	var that = this
	try{
		auto(that)	
	}catch(e){
		console.log('e='+e)
	}
	
}

OKBTC.prototype.autoProfitOff = function(){
	console.log('turn off')
	this.goNext =false
}

function showLog(ok){
		console.log('总交易次数='+ok.totalNum)
		console.log('总止损次数='+ok.failsNum)
		console.log('止损率='+(ok.failsNum/ok.totalNum))
		console.log('profit='+ok.profit)
		console.log('亏损='+ok.kunsun)
}

function getSupportPrice(ok){
	var sell_list = ok.asks
	var buy_list  = ok.bids
	var sell_total = 0
	var sell_support = 8000
	for(var i =sell_list.length-1;i>0;i--){
		sell_total += sell_list[i][1]
		if(sell_total>=50){
			sell_support = sell_list[i][0]
			break
		}
	}
	var buy_total = 0
	var buy_support = 1000
	for(var i =sell_list.length-1;i>0;i--){
		buy_total += buy_list[i][1]
		if(buy_total>=50){
			buy_support = buy_list[i][0]
			break
		}
	}
	ok.sell_support = sell_support
	ok.buy_support = buy_support
}

function auto(ok){
	if(ok.goNext){
		//var price_one = ok.bids[0][0]
		Promise.delay(1).then(function(){
			var price_two = ok.bids[0][0]
			return Promise.resolve(price_two)
			//var discus = Math.abs(price_two-price_one)
			//console.log('盘口差价='+discus)
			
		}).delay(600).then(function(price_two){
			var price_three = ok.bids[0][0]
			// console.log('one='+price_one)
			// console.log('two='+price_two)
			// console.log('three='+price_three)
			var options = {
			      symbol:'btc_cny',
			      type:'buy',
			      amount:ok.amount
			    }
			//if(price_one < price_two && price_three>price_two){
			if(price_three>price_two){
				ok.totalNum+=1
				showLog(ok)
				getSupportPrice(ok)
				console.log('涨了')
				options.type = 'buy'
				options.price = ok.ticker.sell
				options.trade_type = 'up'
				return goUp(ok,options)
				//return auto(ok)
			}else if(price_two > price_three){
				ok.totalNum+=1
				showLog(ok)
				console.log('跌了')
				options.type = 'sell'
				options.price = ok.ticker.buy
				options.trade_type = 'down'
				return goUp(ok,options)
				//return auto(ok)
			}else{
				//console.log('query again')
				return auto(ok)
			}
		})

	}


}

//升了
function goUp(ok,options){
	var type = options.trade_type
	if(type === 'up'){
  		console.log('goUp 买入下单成功 price='+options.price)
	    ok.buy(options)
	      .then(function(orderId){
				options.order_id = orderId
				ok.startTime = new Date().getTime()
				return watchGoUpBuy(ok,options)
		    })
	}else{
  		console.log('goDown 卖出下单成功 price='+options.price)
		ok.sell(options)
		.then(function(orderId){
				options.order_id = orderId
				ok.startTime = new Date().getTime()
				return watchGoUpBuy(ok,options)
		    })
	}
}

function watchGoUpBuy(ok,opt){
	var type = opt.trade_type
	ok.watch(opt)
		.then(function(data_one){
			var status = data_one.status
			if(status ===2){
				goUpSell(ok,opt)
			}else{
				setTimeout(function(){
					ok.cancelOrder(opt.order_id)
					  .then(function(data_two){
					  	if(data_two.result){
					  		//撤销成功，查看订单详情，获取有无交易数量
					  		ok.watch(opt)
					  		  .then(function(data_three){
					  		  	var deal_amount = data_three.deal_amount
					  		  	opt.amount -= deal_amount
					  		  	if(opt.amount < 0.01){
					  		  		return goUpSell(ok,opt)
					  		  	}
						  		console.log('撤单成功,重新下单')
						  		if(type === 'up'){
							    	opt.price = ok.ticker.sell
						  		}else{
						  			opt.price = ok.ticker.buy
						  		}
						  		goUp(ok,opt)	
					  		  })
					  	}else{
					  		goUpSell(ok,opt)
					  	}
					  })
				},1000)

			}
		})
}

function goUpSell(ok,opt){
	var type = opt.trade_type
    opt.amount = ok.amount
	if(type === 'up'){
	    opt.type = 'sell'
	    opt.price = +opt.price+ok.flow_profit
    	ok.sell(opt)
		  .then(function(_data){
		  		opt.order_id = _data
	  			goUpSellWatch(ok,opt)
		  		
		    })
	}else{
		opt.type = 'buy'
		opt.price = +opt.price-ok.flow_profit
		ok.sell(opt)
		  .then(function(_data){
		  		opt.order_id = _data
  				goDownBuyWatch(ok,opt)
		    })
	}
}

function goUpSellWatch(ok,opt){
	ok.watch(opt)
		.then(function(watch_data){
			if(watch_data.status ===2){
				var now = new Date().getTime()
				console.log('goup 卖单成功，盈利完成交易*************用时='+(+now-ok.startTime)+'ms')
				ok.profit += ok.flow_profit
				auto(ok)
			}else{
				var last = ok.ticker.last
				// console.log('goup 卖二===='+sell_two)
				// console.log('卖单深度价格='+JSON.stringify(ok.asks))
				// console.log('goup 卖单下单价格==='+watch_data.price)
				//判断挂单价是否大于最新的卖二价
				var now = new Date().getTime()
				//console.log('last='+last+'  支撑位='+ok.buy_support)
				if((last<ok.buy_support || now-ok.startTime>ok.timeout )){
					//撤单止损
					if(now-ok.startTime>ok.timeout){
						console.log('订单超时---')
					}
					if(last<ok.buy_support){
						console.log('超出支撑位--')
					}
					ok.cancelOrder(opt.order_id)
					  .then(function(cancel_data){
					  	if(cancel_data.result){
					  		console.log('goup 撤单成功,止损开始----涨了')
					  		//查看成交数量
					  		ok.watch(opt)
					  		  .then(function(data_one){
					  		  	var deal_amount = data_one.deal_amount
					  		  	opt.amount = ok.amount-deal_amount
						  		opt.price = +ok.ticker.buy-5
						  		opt.type = 'sell'
						  		if(opt.amount < 0.01){
						  			return auto(ok)
						  		}
						  		setTimeout(function(){
							  		ok.sell(opt)
							  		  .then(function(sell_data){
							  		  	ok.failsNum+=1
							  		  	now = new Date().getTime()
							  		  	console.log('goup 止损完成交易---涨了***************用时='+(+now-ok.startTime)+'ms')
							  		  	opt.order_id = sell_data
							  		  	ok.watch(opt)
							  		  	  .then(function(zhisun_watch_data){
							  		  	  	if(zhisun_watch_data.status ===2){
								  		  	  	var deal_price = +zhisun_watch_data.avg_price
								  		  	  	var buy_price = +watch_data.price-ok.flow_profit
								  		  	  	console.log('deal_price='+deal_price)
								  		  	  	console.log('buy_price='+buy_price)
								  		  	  	console.log('当前亏损='+(buy_price-deal_price))
								  		  	  	ok.kunsun += (buy_price-deal_price)
							  		  	  	}
							  		  		auto(ok)
							  		  	  })         
							  		  })
						  		},3500)
					  		  })
					  	}else{
					  		auto(ok)
					  	}
					  })
				}else{
					console.log('继续查看卖单状态，当前价格='+ok.ticker.last)
					setTimeout(function(){
						goUpSellWatch(ok,opt)
					},1500)
				}
			}
		})
}


//降了
function goDown(ok,options){
    ok.sell(options)
      .then(function(orderId){
      	if(orderId){
      		console.log('godwon 卖出下单成功 price='+options.price)
      		//买入成功，判断状态
      		//var options = {
			// 	api_key:config.okcoin.api_key,
			// 	symbol:opt.symbol,
			// 	order_id:opt.order_id,
			// 	sign:str
			// }
			ok.startTime = new Date().getTime()
			options.order_id = orderId
			return watchGoDownSell(ok,options)
      	}else{
      		console.log('卖出失败，重新下单')
      		setTimeout(function(){
      			goDown(ok,options)	
      		},2000)
      	}
      })
}

function watchGoDownSell(ok,opt){
	ok.watch(opt)
		.then(function(data){
			var status = data.status
			if(status ===2){
				console.log('godown卖出成功，开始下买单')
				//这会下卖单
				goDownBuy(ok,opt)
			}else{
				setTimeout(function(){
					ok.cancelOrder(opt.order_id)
					  .then(function(data){
					  	if(data.result){
					  		console.log('godown 撤销卖单成功,重新下卖单')
						    opt.type = 'sell'
						    opt.price = ok.ticker.buy
							setTimeout(function(){
						  		goDown(ok,opt)
							},500)
					  	}else{
					  		goDownBuy(ok,opt)
					  	}
					  })
				},1000)

			}
		})
}

function goDownBuy(ok,opt){
	console.log('godown 开始下买单')
    opt.price = +opt.price-ok.flow_profit
    opt.type = 'buy'
    ok.buy(opt)
      .then(function(_data){
  		opt.order_id = _data
  		goDownBuyWatch(ok,opt)
      })
}

function goDownBuyWatch(ok,opt){
	ok.watch(opt)
		.then(function(watch_data){
			if(watch_data.status ===2){
				var now = new Date().getTime()
				console.log('godown 买入成功，盈利完成交易***********用时='+(+now-ok.startTime)+'ms')
				ok.profit += ok.flow_profit
				auto(ok)
			}else{
				var last = ok.ticker.last
				// console.log('go down 买二===='+last)
				// console.log('买单深度='+JSON.stringify(ok.bids))
				// console.log('go down 买入下单价格==='+watch_data.price)
				//判断挂单价是否大于最新的卖二价\
				var now = new Date().getTime()
				//console.log('last='+last+'  支撑位='+ok.sell_support)
				if((last>ok.sell_support || now-ok.startTime>ok.timeout) && watch_data.status === 0){
					//撤单止损
					if(now-ok.startTime>ok.timeout){
						console.log('订单超时---')
					}
					if(last>ok.sell_support){
						console.log('超出支撑位--')
					}
					ok.cancelOrder(opt.order_id)
					  .then(function(cancel_data){
					  	if(cancel_data.result){
					  		console.log('go down 撤单成功,止损开始---跌了')
					  		ok.watch(opt)
					  		  .then(function(data_one){
					  		  	var deal_amount = data_one.deal_amount
					  		  	opt.amount = ok.amount-deal_amount
					  		  	if(opt.amount < 0.01){
					  		  		return auto(ok)
					  		  	}
						  		opt.price = +ok.ticker.sell+5
						  		opt.type = 'buy'
						  		setTimeout(function(){
							  		ok.buy(opt)
							  		  .then(function(buy_data){
							  		  	ok.failsNum+=1
							  		  	now = new Date().getTime()
							  		  	console.log('go down 止损完成交易--跌了**********用时='+(+now-ok.startTime)+'ms')
							  		  	opt.order_id = buy_data
							  		  	ok.watch(opt)
							  		  	  .then(function(zhisun_watch_data){
							  		  	  	var deal_price = +zhisun_watch_data.avg_price
							  		  	  	var sell_price = +watch_data.price+ok.flow_profit
							  		  	  	console.log('当前亏损='+(deal_price-sell_price))
							  		  	  	ok.kunsun += (deal_price-sell_price)
							  		  		auto(ok)
							  		  	  })
							  		  })
						  		},3500)
					  		  })
					  	}else{
					  		auto(ok)
					  	}
					  })
				}else{
					console.log('继续查看买单状态='+ok.ticker.last)
					setTimeout(function(){
						goDownBuyWatch(ok,opt)
					},1500)
				}
			}
		})
}


module.exports = OKBTC