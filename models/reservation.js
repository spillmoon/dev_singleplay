var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');

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

function listRsv(callback) {
    var sql_select_rsvlist = 'SELECT p.name, place.placeName, p.playDay, p.playTime, p.VIPprice, p.salePer, p.starScoreAvg, i.imageName ' +
    'FROM play p join reservation r on (p.id = r.play_id) ' +
    'join place on (place.id = p.place_id) ' +
    'join image i on (p.name = i.play_name) ' +
    'group by p.name';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_select_rsvlist, function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var rsv = {};
            rsv.list = [];
            for (var i=0; i<results.length; i++) {
                rsv.list.push({
                    playName : results[i].name,
                    starScoreAvg : results[i].starScoreAvg,
                    placeName : results[i].placeName,
                    playDay : results[i].playDay,
                    playTime : results[i].playTime,
                    price : results[i].VIPprice,
                    salePrice : results[i].VIPprice * ((100-results[i].salePer)/100),
                    list : url.resolve('https://localhost:4433/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, rsv);
        });
    });
}

// function findRsv(rsvId, callback) {
//     var sql = 'select p.name, p.playDay, p.playTime, pl.placeName, r.seatClass, u.seatInfo, ((?price*(100-c.salePer)/100)-user.mileage) settlement, r.id, i.imageName, i.imagePath ' +
//     'from reservation r join usableSeat u on (r.usableSeat_usableNo = u.usableNo) ' +
//     'join image i on (i.play_name = r.play_name) ' +
//     'join play p on (p.name = r.play_name) ' +
//     'join place pl on (pl.id = p.place_id) ' +
//     'join coupon c on (r.user_id = c.user_id) ' +
//     'join user on (user.id = c.user_id) ' +
//     'group by id';
//
//     dbPool.getConnection(function(err, dbConn) {
//        if (err) {
//            return callback(err);
//        }
//        dbConn.query(sql, [rsvId], function(err, result){
//            if (err) {
//                return callback(err);
//            }
//
//            callback(null, result);
//        });
//     });
// }

module.exports.createRsv = createRsv;
module.exports.listRsv = listRsv;
//module.exports.findRsv = findRsv;