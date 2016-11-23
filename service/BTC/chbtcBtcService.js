var Promise 		= require('bluebird')
var request 		= Promise.promisify(require('request'))

var prefix = 'http://api.chbtc.com/data/v1/'
var api = {
		price:{
			btc : prefix+'ticker?currency=btc_cny'
		},
		trade:{

		}
}

function CHBTCBTC(){
	this.fetchPrice()
}

CHBTCBTC.prototype.fetchPrice = function(){
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




CHBTCBTC.prototype.isValidPrice = function(data){
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




CHBTCBTC.prototype.queryPrice = function(){
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

module.exports = CHBTCBTC