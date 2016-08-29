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
                        // prev: "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex-10),
                        // next: "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex+10)
                        prev: "http://127.0.0.1:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex-10),
                        next: "http://127.0.0.1:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex+10)
                    },
                    results: playlist
                });
            });
        } else if (theme == 1) { // 오페라 목록
            Play.operaList(sort, function(err, playlist) {
                if (err) {
                    return next(err);
                }
                res.send({
                    totalItems: 140,
                    itemsPerPage: 10,
                    startIndex: startIndex,
                    paging: {
                        // prev: "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex-10),
                        // next: "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex+10)
                        prev: "http://127.0.0.1:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex-10),
                        next: "http://127.0.0.1:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex+10)
                    },
                    results: playlist
                });
            });
        } else { // 콘서트 목록
            Play.concertList(sort, function(err, playlist) {
                if (err) {
                    return next(err);
                }
                res.send({
                    totalItems: 140,
                    itemsPerPage: 10,
                    startIndex: startIndex,
                    paging: {
                        // prev: "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex-10),
                        // next: "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex+10)
                        prev: "http://127.0.0.1:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex-10),
                        next: "http://127.0.0.1:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex+10)
                    },
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
                totalItems: 140,
                itemsPerPage: 10,
                startIndex: startIndex,
                paging: {
                    // prev: "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/playlists/?action=" + action + "&location=" + location + "&start=" + (startIndex-10),
                    // next: "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/playlists/?action=" + action + "&location=" + location + "&start=" + (startIndex+10)
                    prev: "http://127.0.0.1:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex-10),
                    next: "http://127.0.0.1:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex+10)
                },
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
                totalItems: 140,
                itemsPerPage: 10,
                startIndex: startIndex,
                paging: {
                    // prev: "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/playlists/?action=" + action + "&keyword=" + keyword + "&start=" + (startIndex-10),
                    // next: "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/playlists/?action=" + action + "&keyword=" + keyword + "&start=" + (startIndex+10)
                    prev: "http://127.0.0.1:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex-10),
                    next: "http://127.0.0.1:8080/playlists/?action=" + action + "&theme=" + theme + "&sort=" + sort + "&start=" + (startIndex+10)
                },
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
            results: play
        });
    });
});

module.exports = router;