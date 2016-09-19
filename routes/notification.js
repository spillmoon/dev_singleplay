var express =require('express');
var router = express.Router();
var fcm = require('node-gcm');
var User = require('../models/user');
var CronJob = require('cron').CronJob;
var isAuthenticated = require('./common').isAuthenticated;
var logger = require('../config/logger');
var timeZone = "Asia/Seoul";
var sendTime = "00 * 9-18 * * 1-5";

router.post('/', isAuthenticated, function(req, res, next) {
    var job = new CronJob(sendTime, function() {
        var sender = new fcm.Sender('AIzaSyDwz_s38S_LU-fNSOA3mqKpDDGxhWuJOIs');
        var regTokens = [];
        User.getRegistrationToken(userId, function (err, token) {
            if (err) {
                return next(err);
            }
            regTokens.push(token[0].registrationToken);
        });
        var message = new fcm.Message({
            data: {key1: 'msg1'}
        });
        sender.send(message, {registrationTokens: regTokens}, function (err, response) {
            if (err) console.error(err);
            else    console.log(response);
        });
    }, true, timeZone);

    // var fcm = new FCM('AIzaSyDwz_s38S_LU-fNSOA3mqKpDDGxhWuJOIs');
    // var job = new CronJob(sendTime, function() {
    //     var userId = req.user.id;
    //     var userToken = "";
    //     User.getRegistrationToken(userId, function(err, token) {
    //         if (err) {
    //             return next(err);
    //         }
    //         userToken = token[0].registrationToken;
    //     });
    //     var message = {
    //         registration_id: userToken,
    //         notification: "TEST is TEST"
    //     };
    //     fcm.send(message, function(err, messageId) {
    //         if (err) {
    //             logger.log('debug', 'FCM Send Err');
    //         }
    //         else {
    //             logger.log('debug', 'FCM Send messageId: %s', messageId);
    //         }
    //     });
    // }, true, timeZone);
});

module.exports = router;
