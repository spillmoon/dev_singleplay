var express = require('express');
var router = express.Router();
var Play = require('../models/playlist');

// GET, 항목별 정렬된 공연 목록
router.get('/', function (req, res, next) {
    var action = req.query.action;

    if (action == 0) { // 항목별 검색
        var theme = req.query.theme; // undefined: 전체, 0: 뮤지컬, 1: 오페라, 2:콘서트
        var sort = req.query.sort || 0; // 0: 별점, 1:최신, 2: 할인
        if (theme == undefined) { // 장르 구분없는 공연 목록
            Play.allList(sort, function(err, playlist) {
                if (err) {
                    return next(err);
                }
                res.send({
                    code:1,
                    results: playlist
                });
            });
        } else if (theme == 0) { // 뮤지컬 목록
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
    else if (req.query.action == 1) { // 지역 검색
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
    else if (req.query.action == 2) { // 키워드 검색
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