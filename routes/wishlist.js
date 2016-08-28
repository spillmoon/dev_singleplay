var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Wishlist = require('../models/wishlist');


// GET, 위시리스트 목록
router.get('/', isSecure, /*isAuthenticated,*/ function(req, res, next) {
    if (req.url.match(/\?start=\d+/i)) {
        var startIndex = parseInt(req.query.start, 10);
        Wishlist.listWish(function (err, results) {
            if (err) {
                return next(err);
            }
            res.send({
                totalItems: 50,
                itemsPerPage: 10,
                startIndex: startIndex,
                paging: {
                    prev: "http://server:port/wishlists?sort=0&start=" + (startIndex - 10),
                    next: "http://server:port/wishlists?sort=0&start=" + (startIndex + 10)
                },
                results: results
            });
        });
    }
});

// POST, 위시리스트 추가
router.post('/', isSecure, /*isAuthenticated,*/ function(req, res, next) {
    var userId = req.body.userId;
    var playId = req.body.playId;

    Wishlist.createWish(userId, playId, function (err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            messege: "위시리스트에 저장되었습니다!",
            results : result
        });
    });
});

// DELETE, 위시리스트 삭제
router.delete('/:wid', isSecure, /*isAuthenticated,*/ function(req, res, next) {
    var wishId = req.params.wid;

    Wishlist.deleteWish(wishId, function(err, result) {
        res.send({
            result : "위시리스트 삭제 완료"
        });
    });
});

module.exports = router;