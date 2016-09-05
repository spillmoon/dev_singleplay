var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Reservation = require('../models/reservation');


// GET, 예약 내역 조회
router.get('/', isSecure, isAuthenticated, function (req, res, next) {
    // ../models/reservation의 listRsv 함수 실행
    Reservation.listRsv(req.user.id, function (err, results) {
        if (err) {
            return next(err);
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
    // 매개변수 받을 변수 선언
    var userId = req.user.id; // 세션에 있는 user.id 정보 -> userId
    var playId = req.body.playId; // body를 통해 공연ID을 받아온다.
    var playName = req.body.playName; // body를 통해 공연명을 받아온다.
    var usableSeatNo = req.body.usableSeatNo; // body를 통해 빈좌석번호를 받아온다.
    var seatClass = req.body.seatClass; // body를 통해 좌석등급을 받아온다.

    // 매개변수를 받아 ../models/reservation의 createRsv 함수 실행
    Reservation.createRsv(userId, playId, playName, usableSeatNo, seatClass, function (err) {
        if (err) {
            return next(err);
        }
        // 출력 결과
        res.send({
            code: 1, // 성공 코드
            message: "예약 성공"
        });
    });
});

// GET, 예약 내역 상세보기
router.get('/:rid', isSecure, isAuthenticated, function(req, res, next) {
    var rsvId = req.params.rid; // 동적 파라미터로 :rid 입력 -> rsvId

    // findRsv 함수 실행, ../models/reservation의 findRsv 함수 결과가 null->err, rsv->result로 넘어온다.
    Reservation.findRsv(rsvId, function(err, result) {
        if (err) {
            return next(err);
        }
        // 출력 결과
        res.send({
            code: 1, // 성공 코드
            result: result
        });
    });
});

router.delete('/:rid', isSecure, isAuthenticated, function(req, res, next) {
    var rsvId = req.params.rid;

    Reservation.deleteRsv(rsvId, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message: "예약 취소 성공"
        });
    });
});

module.exports = router;
