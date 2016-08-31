var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Wishlist = require('../models/wishlist');

// GET, 위시리스트 목록,
router.get('/', isSecure, isAuthenticated, function(req, res, next) {
    Wishlist.listWish(function (err, wishlist) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            results: wishlist
        });
    });
});

// POST, 위시리스트 추가
router.post('/', isSecure, isAuthenticated, function(req, res, next) {
    var userId = req.session.user.id;
    var playId = req.body.playId;

    Wishlist.createWish(userId, playId, function (err, thumbnail) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            results: thumbnail
        });
    });
});

// DELETE, 위시리스트 삭제, 페이징 삭제함!
router.delete('/:wid', isSecure, isAuthenticated, function(req, res, next) {
    var wishId = req.params.wid;

    Wishlist.deleteWish(wishId, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message : "위시리스트 삭제 완료"
        });
    });
});

module.exports = router;
