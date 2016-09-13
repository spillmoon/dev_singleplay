var util = require('util');
var path = require('path');
var dbPool = require('../models/common').dbPool;
var async = require('async');
var mysql = require('mysql');
var url = require('url');
var fs = require('fs');

// 페이스북 로그인시 회원 테이블에서 아이디를 찾고 없으면 추가, 있으면 기존 id 사용
function findOrCreate(profile, callback) {
    var sql_findUser = "select id, name, userEmail, userPhone, facebookId from user where facebookId = ?";
    var sql_createUser = "insert into user(name, facebookId) values(?, ?)";
    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql_findUser, [profile.id], function(err, results) {
            if (err) {
                dbConn.release();
                dbPool.logStatus();
                return callback("SQL FIND USER FAIL");
            }
            if (results.length !== 0) {
                dbConn.release();
                dbPool.logStatus();
                var user = {};
                user.id = results[0].id;
                user.name = results[0].name;
                user.facebookId = results[0].facebookId;
                return callback(null, user);
            }
            dbConn.query(sql_createUser, [profile.displayName, profile.id], function(err, result) {
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    return callback("SQL CREATE USER FAIL");
                }
                var user = {};
                user.id = result.insertId;
                user.name = profile.displayName;
                user.facebookId = profile.id;
                callback(null, user);
            });
        });
    });
}

// deserializeUser에서 사용, id를 가지고 user를 복원
function findUser(userId, callback) {
    var sql = "select id, name from user where id = ?";
    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql, [userId], function(err, results) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback("로그인 실패");
            }
            var user = {};
            user.id = results[0].id;
            user.name = results[0].name;
            callback(null, user);
        });
    });
}

// 사용자 정보 가져오기
function getProfile(uid, callback) {
    var sql = "select id, name, userEmail, userPhone, mileage, musical, opera, concert, " +
        "mon, tue, wed, thu, fri, sat, sun, sum(case when couponNo then 1 else 0 end) 'coupons' " +
        "from user u left join coupon c on (u.id = c.user_id) " +
        "where id = ?";
    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql, [uid], function(err, result) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback("사용자 정보 가져오기 실패");
            }
            var user = {};
            user.id = result[0].id;
            user.name = result[0].userName;
            user.email = result[0].userEmail;
            user.phone = result[0].userPhone;
            user.copons = result[0].coupons;
            user.mileage = result[0].mileage;
            user.day = [];
            user.theme = [];
            user.day.push((result[0].mon === 1) ? 1 : 0);
            user.day.push((result[0].tue === 1) ? 1 : 0);
            user.day.push((result[0].wed === 1) ? 1 : 0);
            user.day.push((result[0].thu === 1) ? 1 : 0);
            user.day.push((result[0].fri === 1) ? 1 : 0);
            user.day.push((result[0].sat === 1) ? 1 : 0);
            user.day.push((result[0].sun === 1) ? 1 : 0);
            user.theme.push((result[0].musical === 1) ? 1 : 0);
            user.theme.push((result[0].opera === 1) ? 1 : 0);
            user.theme.push((result[0].concert === 1) ? 1 : 0);
            callback(null, user);
        });
    });
}

// 프로필 수정
function updateProfile(userInfo, callback) {
    var sql_update_profile = "update user set userEmail = ?, userPhone = ? where id = ?";
    dbPool.logStatus();
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql_update_profile, [userInfo.userEmail, userInfo.userPhone, userInfo.userId], function(err) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback("프로필 변경 실패");
            }
            callback(null);
        });
    });
}

function updatePush(userId, sql_theme, sql_day, callback) {
    var sql_reset = "update user set musical = 0, opera = 0, concert = 0, mon = 0, tue = 0, wed = 0, thu = 0, fri = 0, sat = 0, sun = 0 where id = ?";
    var sql_change = "update user set " + sql_theme + sql_day + " where id = ?";
    console.log(sql_change);
    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql_reset, [userId], function(err, result) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback("RESET FAIL");
            }
            dbConn.query(sql_change, [userId], function(err, result) {
                if (err) {
                    return callback("알림 설정 변경 실패");
                }
                callback(null);
            });
        });
    });
}

// 할인할 수 있는 정보들
function discountList(uid, callback) {
    var sql_coupon_list = "select couponNo, couponName, saveOff from coupon where user_id = ? and curdate() between periodStart and periodEnd";
    var sql_mileage = "select mileage from user where id = ?";
    dbPool.logStatus();
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        var discounts = {};
        dbConn.beginTransaction(function(err) {
            if (err) {
                dbConn.release();
                dbPool.logStatus();
                return callback("TRANSACTION FAIL");
            }
            async.parallel([getMileage, getCoupon], function(err, result) {
                if (err) {
                    return dbConn.rollback(function() {
                        dbConn.release();
                        dbPool.logStatus();
                        callback("할인 목록 가져오기 실패");
                    });
                }
                dbConn.commit(function() {
                    dbConn.release();
                    dbPool.logStatus();
                    callback(null, discounts);
                });
            });
        });

        function getMileage(callback) {
            dbConn.query(sql_mileage, [uid], function(err, result) {
                if (err) {
                    return callback("SQL MILEAGE FAIL");
                }
                discounts.mileage = result[0].mileage || 0;
                callback(null);
            });
        }

        function getCoupon(callback) {
            dbConn.query(sql_coupon_list, [uid], function(err, results) {
                if (err) {
                    return callback("SQL COUPON FAIL");
                }
                discounts.coupons = [];
                if (results.length !== 0) {
                    for(var i = 0; i < results.length; i++) {
                        discounts.coupons.push({
                            couponNo: results[i].couponNo,
                            couponName: results[i].couponName,
                            saveOff: results[i].saveOff,
                        });
                    }
                }
                callback(null);
            });
        }
    });
}

// 쿠폰함 조회 구현하기
function couponList(uid, callback) {
    var sql_coupon_list = "select couponNo, couponName, saveOff, substring(periodStart, 1, 10) periodStart, substring(periodEnd, 1, 10) periodEnd " +
        "from coupon " +
        "where user_id = ?";
    dbPool.logStatus();
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql_coupon_list, [uid], function(err, results) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback("쿠폰함 조회 실패");
            }
            var coupons = [];
            for(var i = 0; i < results.length; i++) {
                coupons.push({
                    couponNo: results[i].couponNo,
                    couponName: results[i].couponName,
                    saveOff: results[i].saveOff,
                    periodStart: results[i].periodStart,
                    periodEnd: results[i].periodEnd
                });
            }
            callback(null, coupons);
        });
    });
}

module.exports.findUser = findUser;
module.exports.findOrCreate = findOrCreate;
module.exports.couponList = couponList;
module.exports.getProfile = getProfile;
module.exports.discountList = discountList;
module.exports.updateProfile = updateProfile;
module.exports.updatePush = updatePush;

