var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Review = require('../models/review');
var logger = require('../config/logger');

// POST, 리뷰 생성
router.post('/', isSecure, isAuthenticated, function (req, res, next) {
    // 매개변수 받을 변수 생성
    var userId = 1; //req.user.id; // 세션의 user.id를 담을 변수 생성
    var playId = req.body.playId; // body를 통해 공연ID 매개변수를 받아온다.
    var playName = req.body.playName; // body를 통해 공연명 매개변수를 받아온다.
    var starScore = req.body.starScore; // body를 통해 별점 매개변수를 받아온다.

    logger.log('debug', 'sessionId: %s', userId);
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'body: %j', req.body, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    // 매개변수를 받아 ../models/review의 createReview 함수 실행
    Review.createReview(userId, playId, playName, starScore, function (err) {
        if (err) {
            return res.send({
                code: 0,
                error: "평가 입력 실패"
            });
        }
        // 출력 결과
        res.send({
            code: 1, // 성공 코드
            message: "평가해주셔서 감사합니다."
        });
    });
});

module.exports = router;
