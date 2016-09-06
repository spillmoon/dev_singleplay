var express = require('express');
var router = express.Router();
var Board = require('../models/board');

// GET, 공지사항, 이벤트 목록 조회
router.get('/', function (req, res, next) {
    // listBoards 함수 실행, ../models/board의 listBoards 함수 결과가 null->err, board->boardListInfo로 넘어온다.
    Board.listBoards(function (err, boardListInfo) {
        if (err) {
            return next(err);
        }
        // 출력 결과
        res.send({
            code: 1, // 성공 코드
            results: boardListInfo
        });
    });
});

// GET, 공지사항, 이벤트 목록들 중 하나의 게시글 상세 보기
router.get('/:bid', function (req, res, next) {
    var boardNo = req.params.bid; // 매개변수: 게시물번호, 동적 파라미터로 :bid 입력 -> boardNo

    // findBoard 함수 실행, ../models/board의 findBoard 함수 결과가 null->err, board->boardImageUrl로 넘어온다.
    Board.findBoard(boardNo, function (err, boardImageUrl) {
        if (err) {
            return next(err);
        }
        // 출력 결과
        res.send({
            code: 1, // 성공 코드
            result: {
                image: boardImageUrl
            }
        });
    });
});

module.exports = router;
