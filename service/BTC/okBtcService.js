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

OKBTC.prototype.queryDepth = function(){
	return new Promise(function(resolve,reject){
		var url = api.price.depth+'?symbol=btc_cny&size=5&merge=1'
		//symbol
		// btc_cny:比特币 ltc_cny :莱特币
		// size
		// value: 1-200
		// merge
		// value: 1 （合并深度）
		var options = {
			symbol:'btc_cny',
			size:10,
			merge:1
		}
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
	var message = {}
	try{
		return OKBtc.trade(opt)
	}catch(e){
		message = e
	}
	
}

module.exports = OKBTC