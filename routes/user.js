var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var path = require('path');
var url = require('url');
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var User = require('../models/user');
var logger = require('../config/logger');


router.put('/me', isSecure, /*isAuthenticated,*/ function(req, res, next) {
    var action = req.query.action;
    var userId = 1; //req.user.id;

    logger.log('debug', 'sessionId: %s', userId);
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'body: %j', req.body, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);
    // PUSH 설정 변경
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
                return res.send({
                    code: 0,
                    error: "알림 설정 변경 실패"
                });
            }
            res.send({
                code: 1,
                message: "알림 변경 성공"
            });
        });
    } else if (action == "profile") { // 프로필 변경
        var userInfo = {};
        userInfo.userName = req.body.userName;
        userInfo.userEmail = req.body.userEmail;
        userInfo.userPhone = req.body.userPhone;
        User.updateProfile(userInfo, function (err) {
            if (err) {
                return res.send({
                    code: 0,
                    error: "프로필 변경 실패"
                });
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
// 회원정보(이름, 이메일, 전화번호) 가져오기
router.get('/me', isSecure, /*isAuthenticated,*/ function(req, res, next) {
    var userId = 1; //req.user.id;

    logger.log('debug', 'sessionId: %s', userId);
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'query: %j', req.query, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    User.getProfile(userId, function(err, info) {
        if (err) {
            return res.send({
                code: 0,
                error: "회원정보 가져오기 실패"
            });
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
    var userId = 1; //req.user.id;

    logger.log('debug', 'sessionId: %s', userId);
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'query: %j', req.query, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    User.couponList(userId, function(err, coupons) { // 매개변수로 세션을 통해 request객체에 붙은 user의 id 사용
        if (err) {
            return res.send({
                code: 0,
                error: "쿠폰함 조회 실패"
            });
        }
        res.send({
            code: 1,
            results: coupons
        });
    });
});
// 할인 목록
router.get('/me/discounts', isSecure, /*isAuthenticated,*/ function(req, res, next) {
    var userId = 1; //req.user.id;

    logger.log('debug', 'sessionId: %s', userId);
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'query: %j', req.query, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    User.discountList(userId, function(err, discounts) { // 매개변수로 세션을 통해 request객체에 붙은 user의 id 사용
        if (err) {
            return res.send({
                code: 0,
                error: "할인 목록 가져오기 실패"
            });
        }
        res.send({
            code: 1,
            results: discounts
        });
    });
});

module.exports = router;
