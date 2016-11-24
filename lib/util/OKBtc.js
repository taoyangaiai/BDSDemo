var Promise 		= require('bluebird')
var request 		= Promise.promisify(require('request'))
var config 			= require('../../config/apiConfig')
var MD5 			= require('./okSignMD5')

exports.trade = function(opt){
	var str = 'amount='+opt.amount+'&api_key='+config.okcoin.api_key+'&price='+opt.price+'&symbol='+opt.symbol+'&type='+opt.type+'&secret_key='+config.okcoin.secret_key
	str = MD5.format(str)
	var options = {
		api_key:config.okcoin.api_key,
		symbol:opt.symbol,
		type:opt.type,
		price:opt.price,
		amount:opt.amount,
		sign:str
	}
	var url = 'https://www.okcoin.cn/api/v1/trade.do'
	return new Promise(function(resolve,reject){
		request({method:'POST',url:url,json:true,form:options}).then(function(res){
			var _data = res[1]
			if(!_data){
				_data = res.body
			}
			var error = {
				reply:''
			}
			var reply = ''
			if(_data.error_code){
				var _error = _data.error_code
				error.code = _error
				switch(_error){
					case 10010:
					error.reply = '余额不足'
					break;
					case 10001:
					error.reply = '用户请求过于频繁'
					break;
					case 10002:
					error.reply = '系统错误'
					break;
					case 10016:
					error.reply = '币数量不足'
					break;
					default:
					error.reply = '未知错误 错误代码:'+error
				}
				reject(error)
			}else if(_data.result){
					var order_id = _data.order_id
					resolve(order_id)
			}
		})
		
	})
}

//查看订单信息
exports.watch = function(opt){
	var str = 'api_key='+config.okcoin.api_key+'&order_id='+opt.order_id+'&symbol='+opt.symbol+'&secret_key='+config.okcoin.secret_key
	str = MD5.format(str)
	var options = {
		api_key:config.okcoin.api_key,
		symbol:opt.symbol,
		order_id:opt.order_id,
		sign:str
	}

	var url = 'https://www.okcoin.cn/api/v1/order_info.do'
	return new Promise(function(resolve,reject){
		request({method:'POST',url:url,json:true,form:options}).then(function(res){
			var _data = res[1]
			if(!_data){
				_data = res.body
			}
			console.log('watch data = '+JSON.stringify(_data))
			if(_data.result){
				resolve(_data.orders[0])
			}else{
				reject('查看订单信息失败')
			}
		})
		
	})
}

exports.getUserInfo = function(){
	var url = 'https://www.okcoin.cn/api/v1/userinfo.do'
	var str = 'api_key='+config.okcoin.api_key+'&secret_key='+config.okcoin.secret_key
	str = MD5.format(str)
	var options = {
		api_key:config.okcoin.api_key,
		sign:str
	}
	return new Promise(function(resolve,reject){
		request({method:'POST',url:url,json:true,form:options}).then(function(res){
			var _data = res.body
			if(_data.result){
				resolve(_data.info)
			}else{
				throw new Error('get user info fails')
			}
		}).catch(function(err){
			 reject(err)
		})

	})
}

