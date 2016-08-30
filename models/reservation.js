var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');
// fixme: 로그인 연동
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
// fixme: 로그인 연동
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
                    // list : url.resolve('https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/posterimg/', path.basename(results[i].imageName))
                    list : url.resolve('https://127.0.0.1:4433/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, rsv);
        });
    });
}
// fixme: 로그인 연동
function findRsv(rsvId, callback) {
    var sql = 'select p.name, p.playDay, p.playTime, pl.placeName, r.seatClass, u.seatInfo, c.salePer, user.mileage, VIPprice, Rprice, Sprice, i.imageName, i.imagePath ' +
    'from reservation r join usableSeat u on (r.usableSeat_usableNo = u.usableNo) ' +
    'join image i on (i.play_name = r.play_name) ' +
    'join play p on (p.name = r.play_name) ' +
    'join place pl on (pl.id = p.place_id) ' +
    'join coupon c on (r.user_id = c.user_id) ' +
    'join user on (user.id = c.user_id) ' +
    'where r.id = ? ' +
    'group by r.id';

    dbPool.getConnection(function(err, dbConn) {
       if (err) {
           return callback(err);
       }
       dbConn.query(sql, [rsvId], function(err, result){
           if (err) {
               return callback(err);
           }
           var rsv = {};
           rsv.playName = result[0].name;
           rsv.playDay = result[0].playDay;
           rsv.playTime = result[0].playTime;
           rsv.placeName = result[0].placeName;
           rsv.seatClass = result[0].seatClass;
           rsv.seatInfo = result[0].seatInfo;
           if (rsv.seatClass = 'VIP') {
               rsv.settlement = ((result[0].VIPprice*(100-result[0].salePer)/100)-result[0].mileage)
           }
           if (rsv.seatClass = 'R') {
               rsv.settlement = ((result[0].Rprice*(100-result[0].salePer)/100)-result[0].mileage)
           }
           if (rsv.seatClass = 'S') {
               rsv.settlement = ((result[0].Sprice*(100-result[0].salePer)/100)-result[0].mileage)
           }
           rsv.poster = url.resolve('https://127.0.0.1:4433/posterimg/', path.basename(result[0].imageName));
           // rsv.poster = url.resolve('https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/posterimg/', path.basename(result.imageName));

           callback(null, rsv);
       });
    });
}

module.exports.createRsv = createRsv;
module.exports.listRsv = listRsv;
module.exports.findRsv = findRsv;
