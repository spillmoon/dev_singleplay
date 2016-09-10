var express = require('express');
var router = express.Router();
var Play = require('../models/playlist');
var logger = require('../config/logger');

// GET, 항목별 정렬된 공연 목록
router.get('/', function (req, res, next) {
    var action = req.query.action;

    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'query: %j', req.query, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    if (action == 0) { // 항목별 검색
        var theme = req.query.theme; // undefined: 전체, 0: 뮤지컬, 1: 오페라, 2:콘서트
        var sort = req.query.sort || 0; // 0: 별점, 1:최신, 2: 할인
        if (theme == 0) { // 장르 구분없는 공연 목록
            Play.allList(sort, function(err, playlist) {
                if (err) {
                    return res.send({
                        code: 0,
                        error: "공연 목록 조회 실패"
                    });
                }
                res.send({
                    code:1,
                    results: playlist
                });
            });
        } else if (theme == 1) { // 뮤지컬 목록
            Play.musicalList(sort, function(err, playlist) {
                if (err) {
                    return res.send({
                        code: 0,
                        error: "공연 목록 조회 실패"
                    });
                }
                res.send({
                    code: 1,
                    results: playlist
                });
            });
        } else if (theme == 2) { // 오페라 목록
            Play.operaList(sort, function(err, playlist) {
                if (err) {
                    return res.send({
                        code: 0,
                        error: "공연 목록 조회 실패"
                    });
                }
                res.send({
                    code: 1,
                    results: playlist
                });
            });
        } else if (theme == 3) { // 콘서트 목록
            Play.concertList(sort, function(err, playlist) {
                if (err) {
                    return res.send({
                        code: 0,
                        error: "공연 목록 조회 실패"
                    });
                }
                res.send({
                    code: 1,
                    results: playlist
                });
            });
        }
    }
    else if (action == 1) { // 지역 검색
        var location = req.query.location;
        Play.searchLocation(location, function(err, playlist) {
            if (err) {
                return res.send({
                    code: 0,
                    error: "지역 검색 실패"
                });
            }
            res.send({
                code: 1,
                results: playlist
            });
        });
    }
    else if (action == 2) { // 키워드 검색
        var keyword = req.query.keyword;
        Play.searchKeyword(keyword, function(err, playlist) {
            if (err) {
                return res.send({
                    code: 0,
                    error: "키워드 검색 실패"
                });
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
    var userId = (req.user) ? 1 /*req.user.id*/ : 0;

    logger.log('debug', 'sessionId: %s', userId);
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'params: %j', req.params, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    Play.findPlay(playId, userId, function(err, play) {
        if (err) {
            return res.send({
                code: 0,
                error: "공연 상세 조회 실패"
            });
        }
        res.send({
            code: 1,
            result: play
        });
    });
});

module.exports = router;
