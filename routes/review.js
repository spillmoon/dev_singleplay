var express = require('express');
var router = express.Router();
var isSecure = require('./common').isSecure;
var isAuthenticated = require('./common').isAuthenticated;
var Review = require('../models/review');

// POST, 별점 주기
router.post('/', isSecure, isAuthenticated, function (req, res, next) {
    var userId = req.user.id;
    var playId = req.body.playId;
    var playName = req.body.playName;
    var starScore = req.body.starScore;

    Review.createReview(userId, playId, playName, starScore, function (err) {
        if (err) {
            return next(err);
        }
        res.send({
            code: 1,
            message: "평가해주셔서 감사합니다."
        });
    });

});

module.exports = router;