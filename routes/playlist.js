var express = require('express');
var router = express.Router();
var Play = require('../models/playlist');
// 공연 목록 로컬 테스트
// 공연 목록 서버 테스트
// GET, 항목별 정렬된 공연 목록
router.get('/', function (req, res, next) {
    var action = req.query.action;

    if (action == 0) { // 항목별 검색
        var theme = req.query.theme;
        var sort = req.query.sort || 0;
        if (theme == undefined) {
            Play.allList(sort, function(err, playlist) {
                if (err) {
                    return next(err);
                }
                res.send({
                    code:1,
                    results: playlist
                });
            });
        }
        if (theme == 0) { // 뮤지컬 목록
            Play.musicalList(sort, function(err, playlist) {
                if (err) {
                    return next(err);
                }
                res.send({
                    code: 1,
                    results: playlist
                });
            });
        } else if (theme == 1) { // 오페라 목록
            Play.operaList(sort, function(err, playlist) {
                if (err) {
                    return next(err);
                }
                res.send({
                    code: 1,
                    results: playlist
                });
            });
        } else { // 콘서트 목록
            Play.concertList(sort, function(err, playlist) {
                if (err) {
                    return next(err);
                }
                res.send({
                    code: 1,
                    results: playlist
                });
            });
        }
    }
    else if (req.query.action == 1) {
        var location = req.query.location;
        Play.searchLocation(location, function(err, playlist) {
            if (err) {
                return next(err);
            }
            res.send({
                code: 1,
                results: playlist
            });
        });
    }
    else if (req.query.action == 2) {
        var keyword = req.query.keyword;
        Play.searchKeyword(keyword, function(err, playlist) {
            if (err) {
                return next(err);
            }
            res.send({
                code: 1,
                results: playlist
            });
        });
    }
});
// 공연 상세 로컬 테스트
// 공연 상세 서버 테스트
// GET, 공연 상세 정보
router.get('/:pid', function (req, res, next) {
    var playId = req.params.pid;

    Play.findPlay(playId, function(err, play) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            results: play
        });
    });
});

module.exports = router;