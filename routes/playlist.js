var express = require('express');
var router = express.Router();
var Play = require('../models/playlist');

// GET, 항목별 정렬된 공연 목록
router.get('/', function (req, res, next) {
    var startIndex = parseInt(req.query.start, 10);
    var action = req.query.action || 0;

    if (action == 0) { // 항목별 검색
        var theme = req.query.theme || 0;
        var sort = req.query.sort || 0;
        if (theme == 0) { // 뮤지컬 목록
            Play.musicalList(sort, function(err, playlist) {
                if (err) {
                    return next(err);
                }
                res.send({
                    totalItems: 140,
                    itemsPerPage: 10,
                    startIndex: startIndex,
                    paging: {
                        prev: "http://server:port/playlists/?action=0&theme=0&sort=0&start=" + (startIndex-10),
                        next: "http://server:port/playlists/?action=0&theme=0&sort=0&start=" + (startIndex+10)
                    },
                    results: playlist
                });
            });
        } else if (theme == 1) { // 오페라 목록
            Play.operaList();
        } else { // 콘서트 목록
            Play.concertList();
        }
    }
    else if (req.query.action == 1) {
        res.send({
            totalItems: 40,
            itemsPerPage: 10,
            startIndex: startIndex,
            paging: {
                prev: "http://server:port/playlists/?action=1&location=서울시 서초구&start=" + (startIndex-10),
                next: "http://server:port/playlists/?action=1&location=서울시 서초구&start=" + (startIndex+10)
            },
            results: [
                {
                    playId: 1,
                    playName: "위키드",
                    theme: "뮤지컬",
                    placeName: "디큐브 아트센터",
                    playDay: "2016-08-22",
                    playTime: "19:00",
                    price: 80000,
                    salePrice: 68000,
                    starScore: 5,
                    poster: "http://server:port/images/poster/filename.jpg"
                }, {}, {}
            ]
        });
    }
    else if (req.query.action == 2) {
        res.send({
            totalItems: 40,
            itemsPerPage: 10,
            startIndex: startIndex,
            paging: {
                prev: "http://server:port/playlists/?action=2&keyword=위키드&start=" + (startIndex-10),
                next: "http://server:port/playlists/?action=2&keyword=위키드&start=" + (startIndex+10)
            },
            results: [
                {
                    playId: 1,
                    playName: "위키드",
                    theme: "뮤지컬",
                    placeName: "디큐브 아트센터",
                    playDay: "2016-08-22",
                    playTime: "19:00",
                    price: 80000,
                    salePrice: 68000,
                    starScore: 5,
                    poster: "http://server:port/images/poster/filename.jpg"
                }, {}, {}
            ]
        });
    }
});

// GET, 공연 상세 정보
router.get('/:pid', function (req, res, next) {
    var playId = req.params.pid;

    res.send({
        result: {
            playId: playId,
            playName: "위키드",
            theme: "뮤지컬",
            placeName: "충무아트센터 대극장",
            day: "2016-08-25",
            time: "17:00",
            poster: [
                "http://server:port/images/poster/filename.jpg",
                "http://server:port/images/poster/filename.jpg",
                "http://server:port/images/poster/filename.jpg"],
            cast: ["http://server:port/images/cast/filename.jpg",
                "http://server:port/images/cast/filename.jpg",
                "http://server:port/images/cast/filename.jpg"],
            seatCount: { "VIP": 4, "R": 1, "S": 4 },
            seatPrice: { "VIP": 15000, "R": 10000, "S": 7000 }
        }
    });
});

module.exports = router;