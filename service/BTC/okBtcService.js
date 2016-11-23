var Promise 		= require('bluebird')
var request 		= Promise.promisify(require('request'))
var OKBtc 			= require('../../lib/util/OKBtc')

var prefix = 'https://www.okcoin.cn/api/v1/'
var api = {
		price:{
			btc : prefix+'ticker.do?symbol=btc_cny'
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




OKBTC.prototype.queryPrice = function(){
	return new Promise(function(resolve,reject){
		var url = api.price.btc
		request({method:'GET',url : url, json :true}).then(function(res){
			var _data = res.body
			if(_data){
				 resolve(_data)
			}else{
				throw new Error('get'+marketName+'\'s'+coin+' fails')
			}
		}).catch(function(err){
			reject(err)
		})
	})
}

OKBTC.prototype.getUserInfo = function(){
	return new Promise(function(resolve,reject){
		OKBtc.getUserInfo()
			 .then(function(data){
			 	resolve(data)
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