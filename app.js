var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var acctMgmtSvc = require('./routes/AccountManagementService');
var search = require('./routes/SearchAndRecommendation');
var menuReview = require('./routes/MenuAndReviewManagement');
var notification = require('./routes/Notification');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use(express.static(path.join(__dirname, 'public/stylesheets')));

app.use('/', index);
app.use('/users', users);
app.use('/', acctMgmtSvc);
app.use('/', search);
app.use('/', menuReview);
app.use('/', notification);

// catch 404 and forward to error handler
app.use(function(req, res, next) {

  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(err.message);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.log(err);
    // render the error page
  res.status(err.status || 500);
  res.json({
    "message":err.message,
      "status":err.status,
      "stack":err.stack
  });
});

module.exports = app;
