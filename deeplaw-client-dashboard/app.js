require('dotenv').config();
var fs = require('fs');
var http = require('http'),
    path = require('path'),
    methods = require('methods'),
    express = require('express'),
    session = require('express-session'),
    morgan  = require('morgan'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    cors = require('cors');
    // errorhandler = require('errorhandler');

require("./models/chat");
require("./models/user");
var isProduction = process.env.NODE_ENV === 'production';

// Create global app object
var app = express();

app.use(session({
  secret: 'keyboard cat',
  // resave: false,
  // saveUninitialized: true,
  // cookie: { secure: true }
}));
// Normal express config defaults
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
mongoose.connect('mongodb+srv://newtest:incredible@cluster0-atfmx.mongodb.net/test?retryWrites=true&w=majority')
// tell the app to parse HTTP body messages
// pass the passport middleware
app.use(passport.initialize());

// load passport strategies
const localSignupStrategy = require('./passport/local-signup');
const localLoginStrategy = require('./passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// pass the authenticaion checker middleware
const authCheckMiddleware = require('./middleware/auth-check');

app.use('/api', authCheckMiddleware);

global.__basedir = __dirname;

// require('./config/passport');
var routes = require('./routes/router');
app.use(routes);

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
var server = app.listen( process.env.PORT || 3000, function(){
  console.log('Listening on port ' + server.address().port);
});