var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Reservation = require('../models/reservation');


// GET, 예약 목록, 페이징 이건 제가 지웠습니다!
router.get('/', isSecure, isAuthenticated, function (req, res, next) {
    Reservation.listRsv(function (err, results) {
        if (err) {
            return next(err);
        }
        res.send({
            results: results
        });
    });
});

// POST, 예약하기
router.post('/', isSecure, isAuthenticated, function(req, res, next) {
    var userId = req.user.id;
    var playId = req.body.playId;
    var playName = req.body.playName;
    var usableSeatNo = req.body.usableSeatNo;
    var seatClass = req.body.seatClass;

    Reservation.createRsv(userId, playId, playName, usableSeatNo, seatClass, function(err) {
       if (err) {
           return next(err);
       }
        res.send({
            code: 1,
            message: "예약 성공"
        });
    });
});

// GET, 예약 상세 정보
router.get('/:rid', isSecure, isAuthenticated, function(req, res, next) {
    var rsvId = req.params.rid;

    Reservation.findRsv(rsvId, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            result: result
        });
    })
});

module.exports = router;
