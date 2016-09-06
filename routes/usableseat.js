var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Usableseat = require('../models/usableseat');

router.get('/:pid', isSecure, isAuthenticated, function(req, res, next) {
    var playId = req.params.pid;

    Usableseat.selectSeat(playId, function(err, info) {
        if (err) {
            return next(err);
        }
        // 출력 결과
        res.send({
            code: 1, // 성공 코드
            result: info
        });
    })
});

module.exports = router;
