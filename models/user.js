var dbPool = require('../models/common').dbPool;
var async = require('async');

function findByEmail(email, callback) {
    var sql = 'SELECT id, userEmail, password FROM user WHERE userEmail = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [email], function(err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            if (results.length === 0) {
                return callback(null, null);
            }
            callback(null, results[0]);
        })
    });
}

function verifyPassword(password, hashPassword, callback) {
    var sql = 'SELECT SHA2(?, 256) password';
    dbPool.getConnection(function(err, dbConn){
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [password], function(err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            if (results[0].password !== hashPassword) {
                return callback(null, false)
            }
            callback(null, true);
        });
    });
}
// deserializeUser에서 사용, id를 가지고 user를 복원
function findUser(userId, callback) {
    var sql = 'SELECT id, userEmail FROM user WHERE id = ?';
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [userId], function(err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var user = {};
            user.id = results[0].id;
            user.email = results[0].email;
            callback(null, user);
        });
    });
}
// 페이스북 로그인시 회원 테이블에서 아이디를 찾고 없으면 추가, 있으면 기존 id 사용
function findOrCreate(profile, callback) {
    var sql_findUser = "select id, userEmail, facebookId from user where facebookId = ?";
    var sql_createUser = "insert into user(userEmail, facebookId) values (?, ?)";

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_findUser, [profile.id], function(err, results) {
            if (err) {
                return callback(err);
            }
            if (results.length !== 0) {
                dbConn.release();
                var user = {};
                user.id = results[0].id;
                user.email = results[0].userEmail;
                user.facebookId = results[0].facebookId;
                return callback(null, user);
            }
            dbConn.query(sql_createUser, [profile.emails[0].value, profile.id], function(err, result) {
                dbConn.release();
                if (err) {
                    return callback(err);
                }
                var user = {};
                user.id = result.insertId;
                user.email = profile.emails[0].value;
                user.facebookId = profile.id;
                callback(null, user);
            });
        });
    });
}
// 쿠폰함 조회 구현하기
function couponList(uid, callback) {
    var sql_coupon_list = "select couponNo, couponName, saveOff, substring(periodStart, 1, 10) periodStart, substring(periodEnd, 1, 10) periodEnd " +
                            "from coupon " +
                            "where user_id = ?";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_coupon_list, [uid], function(err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
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

function getProfile(uid, callback) {
    var sql = "select id, name, userEmail, userPhone, userImage, mileage, " +
            "sum(case when couponNo then 1 else 0 end) 'couponCnt' " +
            "from user u left join coupon c on (u.id = c.user_id) " +
            "where id = ?";
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [uid], function(err, result) {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    });
}

function discountList(uid, callback) {
    var sql_coupon_list = "select couponNo, couponName, saveOff from coupon where user_id = ? and curdate() between periodStart and periodEnd";
    var sql_mileage = "select mileage from user where id = ?";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        var discounts = {};
        dbConn.beginTransaction(function(err) {
            if (err) {
                return callback(err);
            }
            async.parallel([getMileage, getCoupon], function(err, result) {
                if (err) {
                    return dbConn.rollback(function() {
                        dbConn.release();
                        callback(err);
                    });
                }
                dbConn.commit(function() {
                    dbConn.release();
                    callback(null, discounts);
                });
            });
        });

        function getMileage(callback) {
            dbConn.query(sql_mileage, [uid], function(err, result) {
                if (err) {
                    return callback(err);
                }
                discounts.mileage = result[0].mileage;
                callback(null);
            });
        }

        function getCoupon(callback) {
            dbConn.query(sql_coupon_list, [uid], function(err, results) {
                if (err) {
                    return callback(err);
                }
                discounts.coupons = [];
                for(var i = 0; i < results.length; i++) {
                    discounts.coupons.push({
                        couponNo: results[i].couponNo,
                        couponName: results[i].couponName,
                        saveOff: results[i].saveOff,
                    });
                }
                callback(null);
            });
        }
    });
}

module.exports.findByEmail = findByEmail;
module.exports.verifyPassword = verifyPassword;
module.exports.findUser = findUser;
module.exports.findOrCreate = findOrCreate;
module.exports.couponList = couponList;
module.exports.getProfile = getProfile;
module.exports.discountList = discountList;
