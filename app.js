var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var redis = require('redis');
var redisClient = redis.createClient();
var RedisStore = require('connect-redis')(session);

var auth = require('./routes/auth');
var playlist = require('./routes/playlist');
var reservation = require('./routes/reservation');
var wishlist = require('./routes/wishlist');
var board = require('./routes/board');
var review = require('./routes/review');
var user = require('./routes/user');
var notification = require('./routes/notification');
var usableseat = require('./routes/usableseat');

var FCM = require('node-gcm');
var User = require('./models/user');
var CronJob = require('cron').CronJob;
var logger2 = require('./config/logger');
var async = require('async');
var timeZone = "Asia/Seoul";
var sendTime1 = "00 00 9-18 * * 0-6";
var sendTime2 = "00 00 9-18 * * 0-6";

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET)); // req에 cookies를 달아서 보냄
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: new RedisStore({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    client: redisClient
  }),
  resave: true, // 변경된 게 없으면 세션을 저장하지 말아라.
  saveUninitialized: true, // 저장된 게 없으면 세션을 생성하지 말아라.
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 30
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/boardimg', express.static(path.join(__dirname, 'uploads/images/board'))); // '/boards' url의 경우 오른쪽의 경로로 연결하겠다.
app.use('/castimg', express.static(path.join(__dirname, 'uploads/images/cast'))); // 마운트포인트 매핑
app.use('/placeimg', express.static(path.join(__dirname, 'uploads/images/place'))); // '/boards' url의 경우 오른쪽의 경로로 연결하겠다.
app.use('/posterimg', express.static(path.join(__dirname, 'uploads/images/poster'))); // 마운트포인트 매핑
app.use('/profileimg', express.static(path.join(__dirname, 'uploads/images/profile'))); // 마운트포인트 매핑

app.use('/auth', auth);
app.use('/playlists', playlist);
app.use('/reservations', reservation);
app.use('/wishlists', wishlist);
app.use('/boards', board);
app.use('/reviews', review);
app.use('/users', user);
app.use('/notifications', notification); //(url, 모듈명)
app.use('/usableseats', usableseat);

// 요일, 테마 알림
var job1 = new CronJob(sendTime1, function() {
    logger2.log('debug', '***************** this is FCM CronJob');
    var date = new Date();
    var week = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    User.getRegistrationToken(week[date.getDay()], function(err, tokens) {
        if (err) {
            logger2.log('debug', 'get registrationToken Fail');
        }
        async.each(tokens, function(item, callback) {
            var message = new FCM.Message({
                delayWhileIdle: false,
                notification: {
                    title: "Single Play Notification",
                    body: "오늘 공연이 있어요"
                },
            });
            var fcm = new FCM.Sender('AIzaSyDwz_s38S_LU-fNSOA3mqKpDDGxhWuJOIs');
            var regToken = [];
            regToken.push(item.registrationToken);
            fcm.send(message, { registrationTokens: regToken}, function (err, response) {
                if (err)
                    logger2.log('debug', 'FCM Send Error ', err);
                else
                    logger2.log('debug', 'FCM Send Success ', response);
            });
        }, function(err) {
            logger2.log('debug', 'FCM async Error');
        });
    });
}, true, timeZone);
// 위시리스트 알림
var job2 = new CronJob(sendTime2, function() {
    logger2.log('debug', '***************** this is FCM CronJob');
    User.getWishToken(function(err, tokens) {
        if (err) {
            logger2.log('debug', 'get registrationToken Fail');
        }
        async.each(tokens, function(item, callback) {
            var message = new FCM.Message({
                delayWhileIdle: false,
                notification: {
                    title: "Single Play Notification",
                    body: "위시리스트가 곧 시작해요"
                },
            });
            var fcm = new FCM.Sender('AIzaSyDwz_s38S_LU-fNSOA3mqKpDDGxhWuJOIs');
            var regToken = [];
            regToken.push(item.registrationToken);
            fcm.send(message, { registrationTokens: regToken}, function (err, response) {
                if (err)
                    logger2.log('debug', 'FCM Send Error ', err);
                else
                    logger2.log('debug', 'FCM Send Success ', response);
            });
        }, function(err) {
            logger2.log('debug', 'FCM async Error');
        });
    });
}, true, timeZone);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {}
  });
});

module.exports = app;
