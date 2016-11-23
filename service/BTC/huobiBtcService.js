var Promise 		= require('bluebird')
var request 		= Promise.promisify(require('request'))

var prefix = 'http://api.huobi.com/'
var api = {
		price:{
			btc : prefix+'staticmarket/ticker_btc_json.js'
		},
		trade:{

		}
}

function HUOBIBTC(){
	this.fetchPrice()
}

HUOBIBTC.prototype.fetchPrice = function(){
	var that = this
	if(that.time && that.ticker){
		if(that.isValidPrice(this)){
			return Promise.resolve(this)
		}
	}
	return new Promise(function(resolve,reject){
		that.queryPrice()
			.then(function(data){
				that.time = data.time
				that.ticker = data.ticker
				resolve(data)
			})
		
	})
}




HUOBIBTC.prototype.isValidPrice = function(data){
	if(!data || !data.time ||!data.ticker){
		return false
	}
	var date = (+data.time+2.5)*1000
	var now = new Date().getTime()
	if(now<date){
		return true
	}else{
		return false
	}
}




HUOBIBTC.prototype.queryPrice = function(){
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

module.exports = HUOBIBTC