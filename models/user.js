var util = require('util');
var path = require('path');
var dbPool = require('../models/common').dbPool;
var async = require('async');
var mysql = require('mysql');
var url = require('url');
var fs = require('fs');

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

        function getCoupon(callback) {
            dbConn.query(sql_coupon_list, [uid], function(err, results) {
                dbConn.release();
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
        function getMileage(callback) {
            dbConn.query(sql_mileage, [uid], function(err, result) {
                dbConn.release();
                if (err) {
                    return callback(err);
                }
                discounts.mileage = result[0].mileage;
                callback(null);
            });
        }

    });
}

function updateProfile(userInfo, callback) {
    var sql_select_profile = 'select userImage, name, userPhone, userEmail ' +
        'from user ' +
        'where id=?';
    var sql_update_profile = 'update user ' +
        "set name = ?, userEmail = ?, userImage = ?, userPhone = ? " +
        "where id =?";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function (err) { // 두 개의 행동이 하나의 작업
            if (err) {
                return callback(err); // createWish의 callback에 err를 넘겨줌
            }
            async.series([deleteRealFile, updateProfile], function (err, result) { // insertWish, selectThumbnail 함수를 순차실행
                if (err) {
                    return dbConn.rollback(function () { // 에러가 나면 db 롤백! (주의! autocommit 모드 해제!)
                        dbConn.release(); // db연결 끊음
                        callback(err); // callback에 err를 넘겨주고
                    });
                }
                dbConn.commit(function () { // 에러가 아니면 commit
                    dbConn.release(); // db연결 끊음
                    callback(null, result); // 두번째 함수의 result가 router의 createWish 함수에 전달 됨.
                });
            });
        });

        function deleteRealFile(callback) {
            dbConn.query(sql_select_profile, [userInfo.userId], function (err, result){
                if (err) {
                    return callback(err);
                }
                var image = path.join(__dirname, '../uploads/images/profile', userInfo.userImage);
                fs.unlink(image, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    console.log('success delete real profile image');
                    callback(null);
                });
            });
        }

        function updateProfile(callback) {
            dbConn.query(sql_update_profile, [userInfo.userName, userInfo.userEmail, userInfo.userImage, userInfo.userPhone, userInfo.userId], function(err) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
    });
}

function updatePush() {}

module.exports.findByEmail = findByEmail;
module.exports.verifyPassword = verifyPassword;
module.exports.findUser = findUser;
module.exports.findOrCreate = findOrCreate;
module.exports.couponList = couponList;
module.exports.getProfile = getProfile;
module.exports.discountList = discountList;
module.exports.updateProfile = updateProfile;
module.exports.updatePush = updatePush;
