var Promise 		= require('bluebird')
var request 		= Promise.promisify(require('request'))

var prefix = 'https://data.btcchina.com/data/'
var api = {
		price:{
			btc : prefix+'ticker?market=btccny'
		},
		trade:{

		}
}



function BTCCBTC(){
	this.fetchPrice()
}

BTCCBTC.prototype.fetchPrice = function(){
	var that = this
	if(that.ticker){
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




BTCCBTC.prototype.isValidPrice = function(data){
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
// {"ticker":{"high":"5199.00","low":"5115.00","buy":"5173.23","sell":"5174.30",
// "last":"5173.01","vol":"1231242.81460000","date":1479795839,"vwap":"5168.41",
// "prev_close":"5177.89","open":"5177.75"}}

//{{"date":"1479794366229","ticker":{"buy":"69.0","high":"70.0","last":"69.0",
//"low":"66.49","sell":"69.02","vol":"264079.314"}}

BTCCBTC.prototype.queryPrice = function(){
	return new Promise(function(resolve,reject){
		var url = api.price.btc
		request({method:'GET',url : url, json :true}).then(function(res){
			var _data = res.body
			var returnData = {
				ticker:{
				}
			}
			if(_data){
				returnData.date 		= _data.ticker.date
				returnData.ticker.buy 	= _data.ticker.buy
				returnData.ticker.high 	= _data.ticker.high
				returnData.ticker.last 	= _data.ticker.last
				returnData.ticker.low 	= _data.ticker.low
				returnData.ticker.sell 	= _data.ticker.sell
				returnData.ticker.vol 	= _data.ticker.vol
				resolve(returnData)
			}else{
				throw new Error('get'+marketName+'\'s'+coin+' fails')
			}
		}).catch(function(err){
			reject(err)
		})
	})
}

module.exports = BTCCBTC