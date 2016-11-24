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
	var date = (+data.date+2.5)*1000
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
	return new Promise(function(resolve,reject){
		var url = api.price.depth+'?symbol=btc_cny&size=5&merge='+depth
	
		request({method:'GET',url:url,json:true}).then(function(res){
			var _data = res.body
			if(_data){
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


module.exports = OKBTC