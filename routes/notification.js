var express =require('express');
var router = express.Router();
var fcm = require('node-gcm');
var CronJob = require('cron').CronJob;
var moment = require('moment-timezone');

router.post('/', function(req, res, next) {
    var ids = req.body.ids;

    var tokens = [];
    var message = new fcm.Message({
        data: {
            key1: "value1",
            key2: "value2"
        },
        notification: {
            title: "",
            icon: "",
            body: ""
        }
    });

    var sender = new fcm.Sender('AIzaSyCnge2ICG0G0rdjQ1_OUw-1ljFTuvrUwPk');

    sender.send(message, {registrationTokens: tokens}, function(err, response) {
        if (err) {
            return next(err);
        }
        res.send(response);
    });
});

module.exports = router;
