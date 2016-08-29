var express = require('express');
var router = express.Router();
var Board = require('../models/board');

// GET, 공지사항, 이벤트 목록
router.get('/', function(req, res, next) {
    if (req.url.match(/\/\?start=\d/i)) {
        var startIndex = parseInt(req.query.start, 10);
        Board.listBoards(function(err, boardListInfo) {
            if (err) {
                return next(err);
            }
            res.send({
                totalItems: 30,
                itemsPerPage: 10,
                startIndex: startIndex,
                paging: {
                    prev: "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/boards?start=" + (startIndex-10),
                    next: "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/boards?start=" + (startIndex+10)
                    // prev: "http://localhost:8080/boards?start=" + (startIndex-10),
                    // next: "http://localhost:8080/boards?start=" + (startIndex+10)
                },
                results: boardListInfo
            });
        });
    }
});

// GET, 공지사항, 이벤트 목록
router.get('/:bid', function (req, res, next) {
    var boardNo = req.params.bid;
    Board.findBoard(boardNo, function (err, boardImageUrl) {
        if (err) {
            return next(err);
        }
        res.send({
            result: boardImageUrl
        });
    });
});

module.exports = router;

