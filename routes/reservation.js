var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Reservation = require('../models/reservation');
var logger = require('../config/logger');

// GET, 예약 내역 조회
router.get('/', isSecure, isAuthenticated, function (req, res, next) {
    logger.log('debug', '********** Here is reservation get **************');
    logger.log('debug', 'sessionId: %s', userId);
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'query: %j', req.query, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    // ../models/reservation의 listRsv 함수 실행
    var userId = req.user.id || 0;
    Reservation.listRsv(userId, function (err, results) {
        if (err) {
            return res.send({
                code: 0,
                error: "예약 내역 조회 실패"
            });
        }
        // 출력 결과
        res.send({
            code: 1, // 출력 결과
            results: results
        });
    });
});

// POST, 예약 내역 추가
router.post('/', isSecure, isAuthenticated, function(req, res, next) {
    logger.log('debug', '********** Here is reservation post **************');
    logger.log('debug', 'sessionId: %s', req.user.id);
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'body: %j', req.body, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    // 매개변수 받을 변수 선언
    var userId = req.user.id || 0; // 세션에 있는 user.id 정보 -> userId
    var playId = req.body.playId; // body를 통해 공연ID을 받아온다.
    var playName = req.body.playName; // body를 통해 공연명을 받아온다.
    var usableSeatNo = req.body.usableSeatNo; // body를 통해 빈좌석번호를 받아온다.
    var seatClass = req.body.seatClass; // body를 통해 좌석등급을 받아온다.
    var booker = req.body.booker;
    var bookerPhone = req.body.bookerPhone;
    var bookerEmail = req.body.bookerEmail;
    var useMileage = req.body.useMileage;
    var useCoupon = req.body.useCoupon;
    var settlement = req.body.settlement;
    // 매개변수를 받아 ../models/reservation의 createRsv 함수 실행
    Reservation.createRsv(userId, playId, playName, usableSeatNo, seatClass, booker, bookerPhone, bookerEmail, useMileage, useCoupon, settlement, function (err, rid) {
        if (err) {
            return res.send({
                code: 0,
                error: "예약 실패"
            });
        }
        Reservation.findRsv(rid, function(err, result) {
            if (err) {
                return res.send({
                    code: 0,
                    error: "예약 내역 출력 실패"
                });
            }
            // 출력 결과
            res.send({
                code: 1, // 성공 코드
                result: result
            });
        });
    });
});

// GET, 예약 내역 상세보기
router.get('/:rid', isSecure, isAuthenticated, function(req, res, next) {
    logger.log('debug', '********** Here is reservation detail get **************');
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'params: %j', req.params, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    var rsvId = req.params.rid; // 동적 파라미터로 :rid 입력 -> rsvId
    // findRsv 함수 실행, ../models/reservation의 findRsv 함수 결과가 null->err, rsv->result로 넘어온다.
    Reservation.findRsv(rsvId, function(err, result) {
        if (err) {
            return res.send({
                code: 0,
                error: "예약 상세 조회 실패"
            });
        }
        // 출력 결과
        res.send({
            code: 1, // 성공 코드
            result: result
        });
    });
});

router.delete('/:rid', isSecure, isAuthenticated, function(req, res, next) {
    logger.log('debug', '********** Here is reservation delete **************');
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'params: %j', req.params, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    var rsvId = req.params.rid;
    Reservation.deleteRsv(rsvId, function(err, result) {
        if (err) {
            return res.send({
                code: 0,
                error: "예약 취소 실패"
            });
        }
        res.send({
            code: 1,
            message: "예약 취소 성공"
        });
    });
});

module.exports = router;
