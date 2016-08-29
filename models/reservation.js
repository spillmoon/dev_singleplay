//insert into reservation(user_id, play_id, play_name, rsvDate, usableSeat_usableNo, seatClass)
//values (1, 28, '키다리아저씨', str_to_date('2016-08-28', '%Y-%m-%d'), 3, 'S');

var mysql = require('mysql');
var dbPool = require('../models/common').dbPool;

function createRsv(user_id, play_id, play_name, rsvDate, usableSeatNo, seatClass, callback) {
    var sql = 'insert into reservation(user_id, play_id, play_name, rsvDate, usableSeat_usableNo, seatClass) ' +
        "values (?, ?, ?, str_to_date(?, '%Y-%m-%d'), ?, ?)";

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [user_id, play_id, play_name, rsvDate, usableSeatNo, seatClass], function(err){
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
}

module.exports.createRsv = createRsv;