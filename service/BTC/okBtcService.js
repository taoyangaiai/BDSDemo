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
	var date = (+data.date+0.5)*1000
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

//查看历史记录
//https://www.okcoin.cn/api/v1/
// api_key
// 用户申请的apiKey
// symbol
// btc_cny: 比特币 ltc_cny: 莱特币
// status
// 查询状态 0：未完成的订单 1：已经完成的订单 （最近七天的数据）
// current_page
// 当前页数
// page_length
// 每页数据条数，最多不超过200
// sign
// 请求参数的签名
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

//https://www.okcoin.cn/api/v1/cancel_order.do
// api_key
// 用户申请的apiKey
// symbol
// btc_cny: 比特币 ltc_cny: 莱特币
// order_id
// 订单ID(多个订单ID中间以","分隔,一次最多允许撤消3个订单)
// sign
// 请求参数的签名

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

function newAuto(ok){
	if(ok.goNext){
		ok.queryPrice()
		  .then(function(data){
		  	var one = data.ticker
		  	return Promise.resolve(one)
		  })
		  .then(function(data){
		  	var two = ok.queryPrice().ticker
		  	var data = {one:data,two:two}
		  	return Promise.resolve(two)
		  })
	}
}



function auto(ok){
	if(ok.goNext){
	//1 获取两次最新差价
	//2 open order
	//3 this.open_order 
	//4 open another order
	//5 this.close_order
	//6 done
	//delete this.open_order this.close_order
	// {
	// 	"date":"1410431279",
	// 	"ticker":{ 
	// 		"buy":"33.15",
	// 		"high":"34.15",
	// 		"last":"33.15",
	// 		"low":"32.05",
	// 		"sell":"33.16",
	// 		"vol":"10532696.39199642"
	// 	}
	// } 
	var price_one = ok.ticker.sell
	Promise.delay(1000).then(function(){
		var price_two = ok.ticker.sell
		var options = {
		      symbol:'btc_cny',
		      type:'buy',
		      amount:'0.01'
		    }
		if(price_one === price_two){
			console.log('query again------------')
			return auto(ok)
		}else if(price_one < price_two){
			console.log('涨了-----------')
			options.type = 'buy'
			options.price = ok.ticker.sell
			return goUp(ok,options)
		}else if(price_one > price_two){
			console.log('跌了-------------')
			options.type = 'sell'
			options.price = ok.ticker.buy
			return goDown(ok,options)
		}
	})
	
	}


}



//升了
function goUp(ok,options){
    ok.buy(options)
      .then(function(orderId){
      	if(orderId){
      		console.log('goUp 买入下单成功 price='+options.price)
      		//买入成功，判断状态
      		//var options = {
			// 	api_key:config.okcoin.api_key,
			// 	symbol:opt.symbol,
			// 	order_id:opt.order_id,
			// 	sign:str
			// }
			var opt = {
				price:options.price,
				symbol:'btc_cny',
				order_id:orderId
			}
			return watchGoUpBuy(ok,opt)
      	}else{
      		console.log('goup 买入失败，重新下单')
      		setTimeout(function(){
      			goUp(ok,options)	
      		},200)
      	}
      })
}

function watchGoUpBuy(ok,opt){
	ok.watch(opt)
		.then(function(data){
			var status = data.status
			if(status ===2){
				console.log('goup 买入成功，开始下卖单')
				//这会下卖单
				goUpSell(ok,opt.price)
			}else{
				setTimeout(function(){
					ok.cancelOrder(opt.order_id)
					  .then(function(data){
					  	if(data.result){
					  		console.log('goup 撤销买单成功')
						  	var _opt = {
						      symbol:'btc_cny',
						      type:'buy',
						      price:ok.ticker.sell,
						      amount:'0.01'
						    }
							console.log('goup 重新下买单')
						  	goUp(ok,_opt)
					  	}else{
					  		goUpSell(ok,opt.price)
					  	}
					  })
				},3000)

			}
		})
}

function goUpSell(ok,buyPrice){
				console.log('goup 开始下卖单')
				var options = {
			      symbol:'btc_cny',
			      type:'sell',
			      price:+buyPrice+0.01,
			      amount:'0.01'
			    }
			    ok.sell(options)
			      .then(function(_data){
			      	if(_data){
			      		var inner_opt = {
			      			symbol:'btc_cny',
							order_id:_data
			      		}
			      		goUpSellWatch(ok,inner_opt,options)
			      	}else{
			      		console.log('goup 进入例外错误啦！！！！！')
			      		options.price = +ok.ticker.buy-5
			      		ok.sell(options)
			      			.then(function(data){
			      				return Promise.resolve()
			      			})
			      	}
			      })
}

function goUpSellWatch(ok,inner_opt,options){
	ok.watch(inner_opt)
		.then(function(watch_data){
			if(watch_data.status ===2){
				console.log('goup 卖单成功 完成交易')
				auto(ok)
			}else{
				var sell_two = ok.asks[0][0]
				console.log('goup 卖二===='+sell_two)
				console.log('goup 卖单价格==='+watch_data.price)
				//判断挂单价是否大于最新的卖二价
				if(watch_data.price>sell_two && watch_data.status === 0){
					//撤单止损
					ok.cancelOrder(inner_opt.order_id)
					  .then(function(data){
					  	//console.log('goup 撤单data ==='+JSON.stringify(data))
					  	if(data.result){
					  		console.log('goup 撤单成功,止损开始----涨了')
					  		options.price = +ok.ticker.buy-5
					  		setTimeout(function(){
						  		ok.sell(options)
						  		  .then(function(data){
						  		  	console.log('goup 完成交易---涨了')
						  		  	auto(ok)
						  		  })
					  		},3500)
					  	}else{
					  		auto(ok)
					  	}
					  })
				}else{
					console.log('继续查看卖单状态')
					goUpSellWatch(ok,inner_opt,options)
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
			var opt = {
				price:options.price,
				symbol:'btc_cny',
				order_id:orderId
			}
			return watchGoDownSell(ok,opt)
      	}else{
      		console.log('卖出失败，重新下单')
      		setTimeout(function(){
      			goDown(ok,options)	
      		},200)
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
				goDownBuy(ok,opt.price)
			}else{
				setTimeout(function(){
					ok.cancelOrder(opt.order_id)
					  .then(function(data){
					  	if(data.result){
					  		console.log('godown 撤销卖单成功')
						  	var _opt = {
						      symbol:'btc_cny',
						      type:'sell',
						      price:ok.ticker.buy,
						      amount:'0.01'
						    }
							console.log('godown 重新下卖单')
						  	goDown(ok,_opt)
					  	}else{
					  		goDownBuy(ok,opt.price)
					  	}
					  })
				},3000)

			}
		})
}

function goDownBuy(ok,sellPrice){
				console.log('godown 开始下买单')
				var options = {
			      symbol:'btc_cny',
			      type:'buy',
			      price:+sellPrice-0.01,
			      amount:'0.01'
			    }
			    ok.buy(options)
			      .then(function(_data){
			      	if(_data){
			      		var inner_opt = {
			      			symbol:'btc_cny',
							order_id:_data
			      		}
			      		goDownBuyWatch(ok,inner_opt,options)
			      	}else{
			      		console.log('进入例外错误啦！！！！！')
			      		options.price = +ok.ticker.sell+5
			      		ok.buy(options)
			      			.then(function(data){
			      				return Promise.resolve()
			      			})
			      	}
			      })
}

function goDownBuyWatch(ok,inner_opt,options){
	ok.watch(inner_opt)
		.then(function(watch_data){
			if(watch_data.status ===2){
				console.log('godown 买入成功 完成交易')
				auto(ok)
			}else{
				var buy_two = ok.bids[4][0]
				console.log('go down 买二===='+buy_two)
				console.log('go down 买入下单价格==='+watch_data.price)
				//判断挂单价是否大于最新的卖二价
				if(watch_data.price<buy_two && watch_data.status === 0){
					//撤单止损
					ok.cancelOrder(inner_opt.order_id)
					  .then(function(data){
					  	console.log('go down 撤单data ==='+JSON.stringify(data))
					  	if(data.result){
					  		console.log('go down 撤单成功,止损开始---跌了')
					  		options.price = +ok.ticker.sell+5
					  		setTimeout(function(){
						  		ok.buy(options)
						  		  .then(function(data){
						  		  	console.log('go down 完成交易--跌了')
						  		  	auto(ok)
						  		  })
					  		},3500)
					  	}else{
					  		auto(ok)
					  	}
					  })
				}else{
					console.log('继续查看买单状态')
					goDownBuyWatch(ok,inner_opt,options)
				}
			}
		})
}


module.exports = OKBTC