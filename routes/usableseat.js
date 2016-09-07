var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Usableseat = require('../models/usableseat');
var logger = require('../config/logger');

router.get('/:pid', isSecure, isAuthenticated, function(req, res, next) {
    var playId = req.params.pid;

    logger.log('debug', 'method: %s', req.method);
    logger.log('debug', 'protocol: %s', req.protocol);
    logger.log('debug', 'host: %s', req.headers['host']);
    logger.log('debug', 'originalUrl: %s', req.originalUrl);
    logger.log('debug', 'baseUrl: %s', req.baseUrl);
    logger.log('debug', 'url: %s', req.url);
    logger.log('debug', 'params: %j', req.params, {});
    logger.log('debug', '%s %s://%s%s', req.method, req.protocol, req.headers['host'], req.originalUrl);

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

