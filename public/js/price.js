$(function(){
	setInterval(function(){
		query()
	}, 2000);
})

function query(){
	$.get('okcoin/queryBtc',function(_data){
		var data = FormatData(_data)
		InsertData('okcoinBtc',data)
	})
	$.get('huobi/queryBtc',function(_data){
		var data = FormatData(_data)
		InsertData('huobiBtc',data)
	})
	$.get('chbtc/queryBtc',function(_data){
		var data = FormatData(_data)
		InsertData('chbtcBtc',data)
	})
	$.get('btcc/queryBtc',function(_data){
		var data = FormatData(_data)
		InsertData('btccBtc',data)
	})
	$.get('okcoin/queryBtcDepth',function(_data){
		console.log(_data)
	})

	$.get('okcoin/getUserInfo',function(_data){
		if(_data.result){
			$('#userInfo').remove()
			$('.userInfoError').text('获取用户信息出错:'+_data.message)
		}else{
			$('#userInfo td:eq(1)').text('CNY:'+_data.funds.free.cny)
			$('#userInfo td:eq(2)').text('BTC:'+_data.funds.free.btc)
			$('#userInfo td:eq(3)').text('LTC:'+_data.funds.free.ltc)
			$('#userInfo td:eq(5)').text('CNY:'+_data.funds.freezed.cny)
			$('#userInfo td:eq(6)').text('BTC:'+_data.funds.freezed.btc)
			$('#userInfo td:eq(7)').text('LTC:'+_data.funds.freezed.ltc)
		}
	})

}

function FormatData(data){
	var newData = {}
	if(data){
		var keys = Object.keys(data)
		for(var i =0;i<keys.length;i++){
			var item = data[keys[i]]
			var key = keys[i]
			newData[key] = parseFloat(item).toFixed(2)
		}
		return newData
	}else{
		return ''
	}

}

function InsertData(marketName,data){
	if(data){
		var the = $('#'+marketName+' td:eq(2)')
		var _oldlast = the.text()
		if(_oldlast>data.last){
			$(the).removeClass('text-success')
			$(the).addClass('text-danger')
			data.last += '⬆️'
		}else{
			$(the).removeClass('text-danger')
			$(the).addClass('text-success')
			data.last += '⬇️'
		}
		$('#'+marketName+' td:eq(2)').text(data.last)
		$('#'+marketName+' td:eq(3)').text(data.sell)
		$('#'+marketName+' td:eq(4)').text(data.buy)
		$('#'+marketName+' td:eq(5)').text(data.vol)
	}

}