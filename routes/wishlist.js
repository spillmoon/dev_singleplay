var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
//var Wishlist = require('../models/wishlist');


// GET, 위시리스트 목록
router.get('/', isSecure, isAuthenticated, function(req, res, next) {
    if (req.url.match(/\?sort=\d+&start=\d+/i)) {
        var startIndex = parseInt(req.query.start, 10);
        res.send({
            totalItems: 50,
            itemsPerPage: 10,
            startIndex: startIndex,
            paging: {
                prev: "http://server:port/wishlists?sort=0&start="+(startIndex-10),
                next: "http://server:port/wishlists?sort=0&start="+(startIndex+10)
            },
            results: [{
                wishlistId: 13,
                playId: 1,
                playName: "위키드",
                theme: "뮤지컬",
                placeName: "디큐브 아트센터",
                playDay: "2016-08-22",
                playTime: "19:00",
                price: 80000,
                salePrice: 68000,
                starScore: 5,
                //poster: "http://server:port/images/poster/filename.jpg”
            }]
        });
    }
});

// POST, 위시리스트 추가
router.post('/', isSecure, isAuthenticated, function(req, res, next) {
    var playId = req.body.pid;

    res.send({
        results: {
            messege: "위시리스트 추가 완료",
            thumbs: [
                "http://server:port/images/thumbnails/thumbfile1.jpg",
                "http://server:port/images/thumbnails/thumbfile2.jpg",
                "http://server:port/images/thumbnails/thumbfile3.jpg"]
        }
    });
});

// DELETE, 위시리스트 삭제
router.delete('/:wid', isSecure, isAuthenticated, function(req, res, next) {
    var wishlistId = req.params.wid;

    res.send({
        result : "위시리스트 삭제 완료"
    });
});

module.exports = router;