var util = require('util');
var path = require('path');
var dbPool = require('../models/common').dbPool;
var async = require('async');
var mysql = require('mysql');
var url = require('url');
var fs = require('fs');

// 프로필 수정 빼고 에러 처리 해야 함.
// 로컬로그인에 사용 추후 삭제
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
// 로컬로그인에 사용 추후 삭제
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
    var sql = "select id, name, userEmail, facebookId from user where id = ?";

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql, [userId], function(err, results) {
            dbConn.release();
            if (err) {
                return callback("로그인 실패");
            }
            var user = {};
            user.id = results[0].id;
            user.name = results[0].name;
            user.email = results[0].userEmail;
            user.facebookId = results[0].facebookId;
            callback(null, user);
        });
    });
}
// 페이스북 로그인시 회원 테이블에서 아이디를 찾고 없으면 추가, 있으면 기존 id 사용
function findOrCreate(profile, callback) {
    var sql_findUser = "select id, name, userEmail, facebookId from user where facebookId = ?";

    var sql_createUser = "insert into user(name, userEmail, facebookId) values(?, ?, ?)";

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql_findUser, [profile.id], function(err, results) {
            if (err) {
                return callback("SQL FIND USER FAIL");
            }
            if (results.length !== 0) {
                dbConn.release();
                var user = {};
                user.id = results[0].id;
                user.name = results[0].name;
                user.email = results[0].userEmail;
                user.facebookId = results[0].facebookId;
                return callback(null, user);
            }
            dbConn.query(sql_createUser, [profile.displayName, profile.emails[0].value, profile.id], function(err, result) {
                dbConn.release();
                if (err) {
                    return callback("SQL CREATE USER FAIL");
                }
                var user = {};
                user.id = result.insertId;
                user.name = profile.displayName;
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
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql_coupon_list, [uid], function(err, results) {
            dbConn.release();
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
// 사용자 정보 가져오기
function getProfile(uid, callback) {
    var sql = "select id, name, userEmail, userPhone, userImage, mileage, " +
            "sum(case when couponNo then 1 else 0 end) 'couponCnt' " +
            "from user u left join coupon c on (u.id = c.user_id) " +
            "where id = ?";
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql, [uid], function(err, result) {
            if (err) {
                return callback("사용자 정보 가져오기 실패");
            }
            callback(null, result);
        });
    });
}
// 할인할 수 있는 정보들
function discountList(uid, callback) {
    var sql_coupon_list = "select couponNo, couponName, saveOff from coupon where user_id = ? and curdate() between periodStart and periodEnd";
    var sql_mileage = "select mileage from user where id = ?";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        var discounts = {};
        dbConn.beginTransaction(function(err) {
            if (err) {
                return callback("TRANSACTION FAIL");
            }
            async.parallel([getMileage, getCoupon], function(err, result) {
                if (err) {
                    return dbConn.rollback(function() {
                        dbConn.release();
                        callback("할인 목록 가져오기 실패");
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
                    callback(null);
                }
                else
                    callback(null);
            });
        }
    });
}

// 프로필 수정
function updateProfile(userInfo, callback) {
    var sql_update_profile = 'update user ' +
        "set name = ?, userEmail = ?, userPhone = ? " +
        "where id =?";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB 연결 실패");
        }
        dbConn.query(sql_update_profile, [userInfo.userName, userInfo.userEmail, userInfo.userPhone, userInfo.userId], function(err) {
            dbConn.release();
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
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql_reset, [userId], function(err, result) {
            if (err) {
                dbConn.release();
                return callback("RESET FAIL");
            }
            dbConn.query(sql_change, [userId], function(err, result) {
                dbConn.release();
                if (err) {
                    return callback("알림 설정 변경 실패");
                }
                callback(null);
            });
        });
    });
}

module.exports.findByEmail = findByEmail;
module.exports.verifyPassword = verifyPassword;
module.exports.findUser = findUser;
module.exports.findOrCreate = findOrCreate;
module.exports.couponList = couponList;
module.exports.getProfile = getProfile;
module.exports.discountList = discountList;
module.exports.updateProfile = updateProfile;
module.exports.updatePush = updatePush;

