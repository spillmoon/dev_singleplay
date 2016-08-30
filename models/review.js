var mysql = require('mysql');
var dbPool = require('../models/common').dbPool;

function createReview(userId, playId, playName, starScore, callback) {
    var sql = 'insert into starScore(user_id, play_id, play_name, starScore) ' +
                "values (?, ?, ?, ?)";

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [userId, playId, playName, starScore], function(err) {
           if (err) {
               return callback(err);
           }
           callback(null);
        });
    });
}

module.exports.createReview = createReview;