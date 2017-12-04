var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

/*Mongoose stuff*/
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://dev:password@ds115546.mlab.com:15546/tictactoe');


var index = require('./routes/index');
var login = require('./routes/login');
var register = require('./routes/register');

var app = express();
var server = require('http').Server(app).listen(2000);
var io = require('socket.io')(server);

/*Session for tracking logins*/
app.use(session({
    //properties that are part of express-session, not created by us
    secret: 'mysecret',
    resave: true,
    saveUninitialized: false
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/secure', index);
app.use('/login', login);
app.use('/register', register);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
