var config = {
	merge:'0.01'
}
$(function(){
	$('#option1').click(function(){
		config.merge = '0.01'
	})
	$('#option2').click(function(){
		config.merge = '0.1'
	})
	$('#option3').click(function(){
		config.merge = '1'
	})

	
	setInterval(function(){
		query()
	}, 2000);


	$('#buyBtn').click(function(){
		$.get('okcoin/buyBtc',function(data){
			console.log(data)
			var _date = new Date(data.create_date)
			var date = _date.getFullYear()+'/'+(_date.getMonth()+1)+'/'+_date.getDate()+' '+_date.getHours()+':'+_date.getMinutes()+':'
			if(_date.getSeconds()<10){
				date+=('0'+_date.getSeconds())
			}else{
				date +=_date.getSeconds()
			}
			var type = data.type==='buy'?'买入':'卖出'
			var undeal = +data.amount-data.deal_amount
			var tr = '<tr><td>'+date+'</td>'
					+'<td>'+type+'</td>'
					+'<td>'+data.amount+'</td>'
					+'<td>'+data.price+'</td>'
					+'<td>'+data.deal_amount+'</td>'
					+'<td>'+data.avg_price+'</td>'
					+'<td>'+undeal+'</td>'
					+'<td><a href="/okcoin/cancel?order_id="'+data.order_id+'>撤销</a></td>'
					+'</tr>'
			$('#nodealTab').append(tr)
		})
	})
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
	$.get('okcoin/queryBtcDepth?'+'depth='+config.merge,function(_data){
		console.log(JSON.stringify(_data))
		insertDepthData(_data)
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

// {"asks":[[5291.99,0.374],[5291.95,2.715],[5291.94,0.181],[5291.9,0.309],[5291.87,0.006]],
// "bids":[[5291.81,0.2],[5291.79,0.083],[5291.74,0.01],[5291.72,0.81],[5291.71,2]]}

function insertDepthData(data){
	var data = formatArrayData(data)
	if(data){
		$('#sell-5 td:eq(1)').text(data.asks[0][0])
		$('#sell-5 td:eq(2)').text(data.asks[0][1])
		$('#sell-4 td:eq(1)').text(data.asks[1][0])
		$('#sell-4 td:eq(2)').text(data.asks[1][1])
		$('#sell-3 td:eq(1)').text(data.asks[2][0])
		$('#sell-3 td:eq(2)').text(data.asks[2][1])
		$('#sell-2 td:eq(1)').text(data.asks[3][0])
		$('#sell-2 td:eq(2)').text(data.asks[3][1])
		$('#sell-1 td:eq(1)').text(data.asks[4][0])
		$('#sell-1 td:eq(2)').text(data.asks[4][1])
		$('#buy-5 td:eq(1)').text(data.bids[4][0])
		$('#buy-5 td:eq(2)').text(data.bids[4][1])
		$('#buy-4 td:eq(1)').text(data.bids[3][0])
		$('#buy-4 td:eq(2)').text(data.bids[3][1])
		$('#buy-3 td:eq(1)').text(data.bids[2][0])
		$('#buy-3 td:eq(2)').text(data.bids[2][1])
		$('#buy-2 td:eq(1)').text(data.bids[1][0])
		$('#buy-2 td:eq(2)').text(data.bids[1][1])
		$('#buy-1 td:eq(1)').text(data.bids[0][0])
		$('#buy-1 td:eq(2)').text(data.bids[0][1])
	}
}
function formatArrayData(data){
	if(Array.isArray(data.asks)){
		var asks = data.asks;
		for(var i = 0;i<asks.length;i++){
			var item = asks[i]
			var value = item[0]
			asks[i][0] = parseFloat(value).toFixed(2)
		}
		var bids = data.bids;
		for(var i = 0;i<bids.length;i++){
			var item = bids[i]
			var value = item[0]
			bids[i][0] = parseFloat(value).toFixed(2)
		}
	}
	return data
}