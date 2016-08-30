var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Wishlist = require('../models/wishlist');
// todo: 위시 목록 로컬 테스트
// todo: 위시 목록 서버 테스트
// GET, 위시리스트 목록
router.get('/', isSecure, isAuthenticated, function(req, res, next) {
    Wishlist.listWish(function (err, wishlist) {
        if (err) {
            return next(err);
        }
        res.send({
            results: wishlist
        });
    });
});
// todo: 위시보기 로컬 테스트
// todo: 위시보기 서버 테스트
// POST, 위시리스트 추가
router.post('/', isSecure, isAuthenticated, function(req, res, next) {
    var userId = req.body.userId;
    var playId = req.body.playId;

    Wishlist.createWish(userId, playId, function (err, results) {
        if (err) {
            return next(err);
        }
        res.send({
            message: "위시리스트에 저장되었습니다!",
            thumbnail: results
        });
    });
});
// todo: 위시 삭제 로컬 테스트
// todo: 위시 삭제 서버 테스트
// DELETE, 위시리스트 삭제
router.delete('/:wid', isSecure, isAuthenticated, function(req, res, next) {
    var wishId = req.params.wid;

    Wishlist.deleteWish(wishId, function(err, result) {
        if (err) {
            return next(err);
        }
        res.send({
            message : "위시리스트 삭제 완료"
        });
    });
});

module.exports = router;
