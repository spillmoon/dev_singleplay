var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var path = require('path');
var url = require('url');
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var User = require('../models/user');


// PUSH 구현 예정
router.put('/me', isSecure,/* isAuthenticated,*/ function(req, res, next) {
    var action = req.query.action;
    var userId = 1; //req.user.id;
    if (action == "push") {
        var theme = req.body.theme;
        var day = req.body.day;
        var sql_theme = "";
        var sql_day = "";
        for(var i = 0; i < theme.length; i++) {
            if (theme[i] == '0')
                sql_theme += "musical = 1, ";
            if (theme[i] == '1')
                sql_theme += "opera = 1, ";
            if (theme[i] == '2')
                sql_theme += "concert = 1, ";
        }
        for(var i = 0; i < day.length; i++) {
            if (day[i] == '0')
                sql_day += "sun = 1, ";
            if (day[i] == '1')
                sql_day += "mon = 1, ";
            if (day[i] == '2')
                sql_day += "tue = 1, ";
            if (day[i] == '3')
                sql_day += "wed = 1, ";
            if (day[i] == '4')
                sql_day += "thu = 1, ";
            if (day[i] == '5')
                sql_day += "fri = 1, ";
            if (day[i] == '6')
                sql_day += "sat = 1, ";
        }
        sql_day = sql_day.substr(0, sql_day.length-2);
        console.log(sql_theme);
        console.log(sql_day);
        User.updatePush(userId, sql_theme, sql_day, function(err, result) {
            if (err) {
                return next(err);
            }
            res.send({
                code: 1,
                message: "알림 변경 성공"
            });
        });
    } else if (action == "profile") {
        var userInfo = {};
        userInfo.userName = req.body.userName;
        userInfo.userEmail = req.body.userEmail;
        userInfo.userPhone = req.body.userPhone;
        User.updateProfile(userInfo, function (err) {
            if (err) {
                return next(err);
            }
            res.send({
                code: 1,
                result: {
                    message: '프로필 변경 완료',
                    userName: userInfo.userName,
                    userEmail: userInfo.userEmail,
                    userPhone: userInfo.userPhone
                }
            });
        });
    }
});

router.get('/me', isSecure,/* isAuthenticated, */function(req, res, next) {
    User.getProfile(1/*req.user.id*/, function(err, info) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            result: {
                name: info[0].name,
                email: info[0].userEmail,
                phone: info[0].userPhone
            }
        });
    });
});

// 쿠폰 목록 조회, https, 로그인 해야 사용 가능
router.get('/me/coupons', isSecure, /*isAuthenticated,*/ function(req, res, next) {
    User.couponList(1/*req.user.id*/, function(err, coupons) { // 매개변수로 세션을 통해 request객체에 붙은 user의 id 사용
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            results: coupons
        });
    });
});

router.get('/me/discounts', isSecure, /*isAuthenticated,*/ function(req, res, next) {
    User.discountList(1/*req.user.id*/, function(err, discounts) { // 매개변수로 세션을 통해 request객체에 붙은 user의 id 사용
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            results: discounts
        });
    });
});

module.exports = router;
