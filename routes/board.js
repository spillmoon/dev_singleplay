var express = require('express');
var router = express.Router();
var Board = require('../models/board');

// GET, 공지사항, 이벤트 목록
router.get('/', function (req, res, next) {
    Board.listBoards(function (err, boardListInfo) {
        if (err) {
            return next(err);
        }
        res.send({
            results: boardListInfo
        });
    });
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