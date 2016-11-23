var Promise 		= require('bluebird')
var request 		= Promise.promisify(require('request'))
var OKBtc 			= require('../../lib/util/OKBtc')

var prefix = 'https://www.okcoin.cn/api/v1/'
var api = {
		price:{
			btc : prefix+'ticker.do?symbol=btc_cny',
			depth:prefix+'depth.do'
		},
		trade:{

		},
		user:{
			info:'/userinfo.do'
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
			 		console.log('service data = '+data)
			 		resolve(data)
			 	}
			 }).catch(function(err){
			 	reject(err)
			 })
	})
	
}

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

module.exports = OKBTC