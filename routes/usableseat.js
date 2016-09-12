var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Usableseat = require('../models/usableseat');
var logger = require('../config/logger');
// 공연의 빈자리 정보 가져오기
router.get('/:pid', isSecure, function(req, res, next) {
    logger.log('debug', '********** Here is usableseat get **************');
    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'params: %j', req.params, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

    var playId = req.params.pid;
    Usableseat.selectSeat(playId, function(err, info) {
        if (err) {
            return res.send({
                code: 0,
                error: "빈자리 정보 제공 실패"
            });
        }
        // 출력 결과
        res.send({
            code: 1, // 성공 코드
            result: info
        });
    })
});

module.exports = router;

