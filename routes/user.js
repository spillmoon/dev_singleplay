var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var path = require('path');
var url = require('url');
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var User = require('../models/user');

// todo: PUT, 프로필, PUSH 수정
router.put('/me', isSecure, isAuthenticated, function(req, res, next) {
    var action = req.body.action;
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
    } else {
        var form = new formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, '../uploads/images/profile');
        form.keepExtensions = true;
        form.multiples = true;
        form.parse(req, function(err, fields, files) {
            if (err) {
                return next(err);
            }
            var userInfo = {};
            userInfo.name = fields.name;
            userInfo.email = fields.email;
            userInfo.phone = fields.phone;
            userInfo.image = files.image;
            var name = "";
            if (userInfo.image)
                name = userInfo.image.name;
            res.send({
                code: 1,
                profileImg: url.resolve("http://127.0.0.1:3000", "/profile/"+ name),
                userName: userInfo.name,
                userEmail: userInfo.email,
                userPhone: userInfo.phone
            });
        });
    }
});

// todo: 쿠폰 목록 조회
router.get('/me/coupons', isSecure, isAuthenticated, function(req, res, next) {
    User.couponList(req.user.id, function(err, coupons) {
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