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
    var user = {};
    user.id = staticUser.id;
    // user.email = profile.emails[0].value;
    user.facebookid = profile.id;
    return callback(null, user);
}

module.exports.findByEmail = findByEmail;
module.exports.verifyPassword = verifyPassword;
module.exports.findUser = findUser;
module.exports.findOrCreate = findOrCreate;
