var express = require('express');
var router = express.Router();
var Board = require('../models/board');

// GET, 공지사항, 이벤트 목록
router.get('/', function(req, res, next) {
    if (req.url.match(/\/\?start=\d/i)) {
        var startIndex = parseInt(req.query.start, 10);
        Board.listBoards(function(err, results) {
            if (err) {
                return next(err);
            }
            res.send({
                totalItems: 30,
                itemsPerPage: 10,
                startIndex: startIndex,
                paging: {
                    prev: "http://localhost:8080/boards?start=" + (startIndex-10),
                    next: "http://localhost:8080/boards?start=" + (startIndex+10)
                },
                results: results
            });
        });
    }
});

// GET, 공지사항, 이벤트 목록
router.get('/:bid', function (req, res, next) {
    var boardNo = req.params.bid;

    Board.findBoard(boardNo, function (err, board) {
        if (err) {
            return next(err);
        }
        res.send({
            result: board
        });

    });
});

module.exports = router;

