var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
//var Wishlist = require('../models/wishlist');


// GET, 예약 목록
router.get('/', isSecure, isAuthenticated, function(req, res, next) {
    var startIndex = parseInt(req.query.start, 10);
    if (req.url.match(/\/\?start=\d/i)) {
        res.send({
            totalItems: 30,
            itemsPerPage: 10,
            startIndex: startIndex,
            paging: {
                prev: "http://server:port/wishlists?sort=0&start=" + (startIndex-10),
                next: "http://server:port/wishlists?sort=0&start=" + (startIndex+10)
            },
            results: [{
                userRsvNo: 1367,
                playName: "위키드",
                playDate: "2016-08-22",
                playTime: "18:00",
                placeName: "디큐브 아트센터",
                poster: "http://server:port/images/poster/filename.jpg"
            }]
        });
    }
});

// POST, 예약하기
router.post('/', isSecure, isAuthenticated, function(req, res, next) {
    var playId  = req.body.playId;
    var rsvSeat = req.body.rsvSeat;

    res.send({
        result : "예약 성공",
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
        poster: "http://server:port/images/poster/filename.jpg",
        rsvDate: "2016-08-22",
        rsvSeat: rsvSeat,
        price: 10000
    });
});

module.exports = router;