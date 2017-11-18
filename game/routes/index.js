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
    io.emit('message-from-server', message)
  })
});

module.exports = router;
