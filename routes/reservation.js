var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Reservation = require('../models/reservation');


// GET, 예약 목록
router.get('/', isSecure, isAuthenticated, function(req, res, next) {
    if (req.url.match(/\?start=\d+/i)) {
        var startIndex = parseInt(req.query.start, 10);

        Reservation.listRsv(function (err, results) {
            if (err) {
                return next(err);
            }
            res.send({
                totalItems: 50,
                itemsPerPage: 10,
                startIndex: startIndex,
                paging: {
                    prev: "https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/wishlists?start=" + (startIndex - 10),
                    next: "https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/wishlists?start=" + (startIndex + 10)
                    // prev: "https://localhost:4433/wishlists?start=" + (startIndex - 10),
                    // next: "https://localhost:4433/wishlists?start=" + (startIndex + 10)
                },
                results: results
            });
        });
    }
});

// POST, 예약하기
router.post('/', isSecure, isAuthenticated, function(req, res, next) {
    //user_id, play_id, play_name, rsvDate, usableNo, seatClass
    var user_id = req.body.user_id;
    var play_id = req.body.play_id;
    var play_name = req.body.play_name;
    var rsvDate = req.body.rsvDate;
    var usableSeatNo = req.body.usableSeatNo;
    var seatClass = req.body.seatClass;

    Reservation.createRsv(user_id, play_id, play_name, rsvDate, usableSeatNo, seatClass, function(err) {
       if (err) {
           return next(err);
       }
        res.send({
            result : "예약 성공",
        });
    });
});

// GET, 예약 상세 정보
router.get('/:rid', isSecure, isAuthenticated, function(req, res, next) {
    var rsvId = req.params.rid;
    var rsvSeat = [];
    rsvSeat = ["S-A9", "S-A10"];

    res.send({
        RsvNo: rsvId,
        playName: "위키드",
        playDate: "2016-08-22",
        playTime: "18:00",
        placeName: "디큐브 아트센터",
        poster: "https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/images/poster/filename.jpg",
        // poster: "https://localhost:4433/images/poster/filename.jpg",
        rsvDate: "2016-08-22",
        rsvSeat: rsvSeat,
        price: 10000
    });
});

module.exports = router;
