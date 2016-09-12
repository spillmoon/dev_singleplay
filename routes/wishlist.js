var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Wishlist = require('../models/wishlist');
var logger = require('../config/logger');

// GET, 위시리스트 목록 조회
router.get('/', isSecure, isAuthenticated, function(req, res, next) {
    // user session id
    var userId = req.user.id;

    logger.log('debug', 'sessionId: %s', userId);
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'query: %j', req.query, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    Wishlist.listWish(userId, function (err, wishlist) {
        if (err) {
            return res.send({
                code: 0,
                error: "위시리스트 조회 실패"
            });
        }
        // 출력 결과
        res.send({
            code: 1, // 성공 코드
            results: wishlist
        });
    });
});

// POST, 위시리스트 추가
router.post('/', isSecure, isAuthenticated, function(req, res, next) {
    var userId = req.user.id; // 세션의 user.id -> userId
    var playId = req.body.playId; // body를 통해 공연ID를 매개변수로 받아온다.

    logger.log('debug', 'sessionId: %s', userId);
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'body: %j', req.body, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    // 매개변수를 받아 ../models/wishlist의 createWish 함수 실행
    Wishlist.createWish(userId, playId, function (err, thumbnail) {
        if (err) {
            return res.send({
                code: 0,
                error: "위시리스트 추가 실패"
            });
        }
        // 출력 결과
        res.send({
            code: 1, // 성공 코드
            results: thumbnail // 위시리스트 추가하면 기존에 위시리스트에 있던 공연 포스터 이미지 URL을 출력한다.
        });
    });
});

// DELETE, 위시리스트 삭제
router.delete('/:wid', isSecure, isAuthenticated, function(req, res, next) {
    var wishId = req.params.wid; // 매개변수를 동적 파라미터 :wid 입력 -> wishId(위시ID)

    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'params: %j', req.params, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    // 매개변수를 받아 ../models/wishlist의 deleteWish 함수 실행
    Wishlist.deleteWish(wishId, function(err) {
        if (err) {
            return res.send({
                code: 0,
                error: "위시리스트 삭제 실패"
            });
        }
        // 출력 결과
        res.send({
            code: 1, // 성공 코드
            message : "위시리스트 삭제 완료"
        });
    });
});

module.exports = router;

