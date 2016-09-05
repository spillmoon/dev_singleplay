var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var path = require('path');
var url = require('url');
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var User = require('../models/user');

// todo: PUT, 프로필, PUSH 수정 구현 에정
router.put('/me', isSecure,/* isAuthenticated,*/ function(req, res, next) {
    var action = req.query.action;
    if (action == "push") {
        var pushInfo = {};
        pushInfo.days = [];
        pushInfo.theme = [];
        for(var i = 0; i < req.body.day.length; i++){
            pushInfo.days.push({
                day: req.body.day[i]
            });
        }
        for(var i = 0; i < req.body.theme.length; i++){
            pushInfo.theme.push({
                theme: req.body.theme[i]
            });
        }
        res.send({
            code: 1,
            message: "알림 변경 성공"
        });
    } else if (action == "profile") {
        var form = new formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, '../uploads/images/profile');
        form.keepExtensions = true;
        form.multiples = true;
        form.parse(req, function(err, fields, files) {
            if (err) {
                return next(err);
            }
            var userInfo = {};
            userInfo.userName = fields.userName;
            userInfo.userEmail = fields.userEmail;
            userInfo.userPhone = fields.userPhone;
            userInfo.userImage = files.userImage;
            var name = "";
            if (userInfo.userImage)
                name = userInfo.userImage.name;
            res.send({
                code: 1,
                result: {
                    profileImg: url.resolve("https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:443/profileimg/", name),
                    userName: userInfo.userName,
                    userEmail: userInfo.userEmail,
                    userPhone: userInfo.userPhone
                }
            });
        });
    }
});

router.get('/me', isSecure,/* isAuthenticated,*/ function(req, res, next) {
    User.getProfile(1/*req.user.id*/, function(err, info) {
        if (err) {
            return next(err);
        }
        res.send({
            name: info[0].name,
            email: info[0].userEmail,
            phone: info[0].userPhone
        });
    });
});

// 쿠폰 목록 조회, https, 로그인 해야 사용 가능
router.get('/me/coupons', isSecure,/* isAuthenticated,*/ function(req, res, next) {
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

module.exports = router;