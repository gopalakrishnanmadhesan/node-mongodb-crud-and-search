const express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    dotenv = require('dotenv'),
    session = require('express-session'),
    FileStore = require('session-file-store')(session);
    expressValidator = require('express-validator'),
    router = express.Router(),
    index = require('./routes/index'),
    employment = require('./routes/employment'),
    project = require('./routes/project'),
    auth = require('./routes/auth');

dotenv.config({ path: path.join(__dirname, '.env') });

require('express-group-routes');
var app = express();
app.locals.moment = require('moment');
app.use(expressValidator({
    customValidators: {
        dd_mm_yyyy: (value) => {
            return (new RegExp(/\b\d{2}-\d{2}-\d{4}\b/)).test(value);
        }
    }
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  store: new FileStore({logFn: function(){}}),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000, // 1 hour in milliseconds
  }
}));

app.get("/", (req, res, next) => {
  res.redirect("/dashboard/");
});

app.get("/login", (req, res, next) => {
  res.redirect("/dashboard/");
});

app.use('/auth', auth);
app.use('/dashboard', index);
app.use('/employment', employment);
app.use('/project', project);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  // render the error page
  res.status(err.status || 500);
  /*res.render('error', {
    message: err.message,
    error: err
  });*/
  return;
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  return;
});

// logging unhandled promise rejection
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

module.exports = app;
