var express = require('express');
var router = express.Router();
//var Wishlist = require('../models/wishlist');
//var isAuthenticated = require('./common').isAuthenticated;

// GET, 공지사항, 이벤트 목록
router.get('/', function(req, res, next) {
    if (req.url.match(/\/\?start=\d/i)) {
        var startIndex = parseInt(req.query.start, 10);
        res.send({
            totalItems: 30,
            itemsPerPage: 10,
            startIndex: startIndex,
            paging: {
                prev: "http://server:port/boards?start=" + (startIndex-10),
                next: "http://server:port/boards?start=" + (startIndex+10)
            },
            results: [{
                boardNo: 1,
                category: 0, //(0: 공지, 1: 이벤트)
                title: "업데이트 공지",
                author: "관리자",
                image: "http://server:pot/images/board/filename.jpg"
            }]
        });
    }
});

// GET, 공지사항, 이벤트 목록
router.get('/:bid', function (req, res, next) {
    var boardNo = req.params.bid;

    res.send({
        results: {
            image: "http://server:pot/images/board/filename.jpg"
        }
    });
});

module.exports = router;