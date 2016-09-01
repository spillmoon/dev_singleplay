var dbPool = require('../models/common').dbPool;

var staticUser = {};
staticUser.name = "한세정";
staticUser.id = 1;
staticUser.email = "test@naver.com";
staticUser.password = "123";

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
    var sql_coupon_list = "select couponNo, couponName, salePer, substring(periodStart, 1, 10) periodStart, substring(periodEnd, 1, 10) periodEnd " +
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
                    salePer: results[i].salePer,
                    periodStart: results[i].periodStart,
                    periodEnd: results[i].periodEnd
                });
            }
            callback(null, coupons);
        });
    });
}

module.exports.findByEmail = findByEmail;
module.exports.verifyPassword = verifyPassword;
module.exports.findUser = findUser;
module.exports.findOrCreate = findOrCreate;
module.exports.couponList = couponList;
