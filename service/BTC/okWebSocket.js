var socket = require('socket.io-client')('wss://real.okcoin.cn:10440/websocket/okcoinapi');

socket.on('connect', function(){
	console.log('connected')
});
socket.on('event', function(data){});

socket.on('disconnect', function(){
	console.log('disconnect')
});

socket.emit('ping')