var express = require('express');
var router = express.Router();
var path = require('path');

var app = express();
var server = require('http').Server(app).listen(2000);
var io = require('socket.io')(server);

app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

io.on('connection', function(socket){
  socket.on('message-from-client', function(message){
    io.emit('set-tile-from-server', message.tile, message.player);
  });
  socket.on('reset-from-client', function(reset){
    io.emit('reset-from-server', reset.clicked, reset.highlight, reset.html)
  });
  socket.on('update-scorebord-from-client', function(data){
    io.emit('update-scorebord-from-server', data)
  })
});

module.exports = router;
