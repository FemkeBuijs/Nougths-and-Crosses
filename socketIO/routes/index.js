var express = require('express');
var router = express.Router();
var path = require('path');

var app = express();
var server = require('http').createServer(app).listen(2000);
var io = require('socket.io')(server);

io.on('connection', function(socket){
  socket.on('message-from-client', function(message){
    io.emit('message-from-server', message.player, message.tile, message.pattern);
  });
  socket.on('reset-from-client', function(reset){
    io.emit('reset-from-server', reset.clicked, reset.highlight, reset.html)
  });
  socket.on('update-scorebord-from-client', function(data){
    io.emit('update-scorebord-from-server', data)
  })
});

module.exports = router;
