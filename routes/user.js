var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var path = require('path');
var url = require('url');
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var User = require('../models/user');

// todo: PUSH 수정 구현 예정
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
        form.uploadDir = path.join(__dirname, '../uploads/images/profile'); // 파일이 업로드될 위치
        form.keepExtensions = true;
        form.multiples = false;
        form.parse(req, function(err, fields, files) {
            if (err) {
                return next(err);
            }
            var userInfo = {};
            userInfo.userId = fields.userId;
            userInfo.userName = fields.userName;
            userInfo.userEmail = fields.userEmail;
            userInfo.userPhone = fields.userPhone;
            userInfo.uploadImage = files.uploadImage;

            userInfo.userImage = path.basename(userInfo.uploadImage.path);

            console.log(path.join(__dirname, '../uploads/images/profile', userInfo.userImage));

            User.updateProfile(userInfo, function(err) {
                if (err) {
                    return next(err);
                }

                // var name = "";
                // if (userInfo.userImage)
                //    name = userInfo.userImage.name;
                res.send({
                    code: 1,
                    result: {
                        message: '프로필 변경 완료',
                        //profileImg: url.resolve("https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:443/profileimg/", userInfo.userImage),
                        profileImg: url.resolve("https://127.0.0.1:4433/profileimg/", userInfo.userImage),
                        userName: userInfo.userName,
                        userEmail: userInfo.userEmail,
                        userPhone: userInfo.userPhone
                    }
                });
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
            name: info[0].name,
            email: info[0].userEmail,
            phone: info[0].userPhone
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