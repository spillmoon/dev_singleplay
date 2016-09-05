var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Usableseat = require('../models/usableseat');


router.get('/:pid', isSecure,/* isAuthenticated,*/ function(req, res, next) {
    var playId = req.params.playId; // 동적 파라미터로 :rid 입력 -> rsvId

    // findRsv 함수 실행, ../models/reservation의 findRsv 함수 결과가 null->err, rsv->result로 넘어온다.
    Usableseat.seatInfo(playId, function(err, result) {
        if (err) {
            return next(err);
        }
        // 출력 결과
        res.send({
            code: 1, // 성공 코드
            result: result
        });
    })
});

module.exports = router;
