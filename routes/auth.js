var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');
var User = require('../models/user');
var logger = require('../config/logger');

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findUser(id, function (err, user) {
        if (err) {
            return done(err);
        }
        done(null, user);
    });
});

passport.use(new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET
}, function (accessToken, refreshToken, profile, done) {
    logger.log('debug', 'accessToken: %s', accessToken);
    logger.log('debug', 'profile: %j', profile, {});
    User.findOrCreate(profile, function (err, user) {
        if (err) {
            return done(err);
        }
        return done(null, user);
    });
}));

// passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, function (email, password, done) {
//     User.findByEmail(email, function (err, user) {
//         if (err) {
//             return done(err);
//         }
//         if (!user) {
//             return done(null, false);
//         }
//         User.verifyPassword(password, user.password, function (err, result) {
//             if (err) {
//                 return done(err);
//             }
//             if (!result) {
//                 return done(null, false);
//             }
//             delete user.password;
//             done(null, user);
//         })
//     });
// }));
//
// passport.use(new FacebookStrategy({
//         clientID: process.env.FACEBOOK_APP_ID,
//         clientSecret: process.env.FACEBOOK_APP_SECRET,
//         callbackURL: process.env.FACEBOOK_CALLBACK_URL,
//         profileFields: ['id', 'displayName', 'name', 'gender', 'profileUrl', 'photos', 'emails']
//     },
//     function (accessToken, refreshToken, profile, done) {
//         console.log(accessToken);
//         User.findOrCreate(profile, function (err, user) {
//             if (err) {
//                 return done(err);
//             }
//             return done(null, user);
//         });
//     }));

router.post('/local/login', function (req, res, next) {
    passport.authenticate('local', function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send({
                message: 'Login failed!!!'
            });
        }
        req.login(user, function (err) {
            if (err) {
                return next(err);
            }
            next();
        });
    })(req, res, next);
}, function (req, res, next) {
    // var user = {};
    // user.email = req.user.email;
    // user.name = req.user.name;
    res.send({
        message: 'local login'
        //user: user
    });
});

router.get('/logout', function (req, res, next) {
    req.logout();
    res.send({
        code: 1,
        message: '로그아웃 성공'
    });
});

router.get('/facebook', passport.authenticate('facebook', { scope : ['email']}));

router.get('/facebook/callback', passport.authenticate('facebook'), function (req, res, next) {
    res.send({message: 'facebook callback'});
});

router.post('/facebook/token', passport.authenticate('facebook-token', { scope : ['email']}), function (req, res, next) {
    var userId = req.user.id;
    if (req.user) {
        User.getProfile(userId, function (err, info) {
            if (err) {
                return res.send({
                    code: 0,
                    error: "로그인 실패"
                });
            }
            res.send({
                code: 1,
                result: {
                    name: info[0].name,
                    couponCnt: info[0].couponCnt,
                    mileage: info[0].mileage
                }
            });
        });
    }
});

module.exports = router;
