var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');

function listRsv(callback) {
    var sql_select_rsvlist = 'SELECT r.id, p.name, place.placeName, substring(p.playDay, 1, 10) playDay, substring(p.playTime, 1, 5) playTime, ' +
        'p.VIPprice, p.Rprice, p.Sprice, p.salePer, p.starScoreAvg, i.imageName ' +
        'FROM play p join reservation r on (p.id = r.play_id) ' +
        'join place on (place.id = p.place_id) ' +
        'join image i on (p.name = i.play_name) ' +
        'group by r.id';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_select_rsvlist, function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var rsv = [];
            var tmprsv = {}; // 조건에 맞는 price와 salePrice를 담을 임시 객체

            for (var i=0; i<results.length; i++) {
                if (results[i].VIPprice === null) {
                    tmprsv.price = results[i].Rprice;
                    tmprsv.salePrice = results[i].Rprice * ((100-results[i].salePer)/100);
                } else {
                    tmprsv.price = results[i].VIPprice;
                    tmprsv.salePrice = results[i].VIPprice * ((100-results[i].salePer)/100);
                }
                rsv.push({
                    playName: results[i].name,
                    starScoreAvg: results[i].starScoreAvg,
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    salePer: results[i].salePer,
                    originalPrice: tmprsv.price,
                    salePrice: tmprsv.salePrice,
                    poster: url.resolve('https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('https://127.0.0.1:4433/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, rsv);
        });
    });
}

function createRsv(userId, playId, playName, usableSeatNo, seatClass, callback) {
    var sql = 'insert into reservation(user_id, play_id, play_name, usableSeat_usableNo, seatClass) ' +
        "values (?, ?, ?, ?, ?)";
    console.log('ggg '+userId);
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [userId, playId, playName, usableSeatNo, seatClass], function(err){
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
}

function findRsv(rsvId, callback) {
    // 'select r.rsvDate, user.id uid, p.id pid, p.name, substring(p.playDay, 1, 10) playDay, substring(p.playTime, 1, 5) playTime, '
    var sql = 'select r.id, r.user_id uid, r.play_id , r.play_name, substring(p.playDay, 1, 10) playDay, substring(p.playTime, 1, 5) playTime, ' +
        "pl.placeName, r.seatClass, u.seatInfo, VIPprice, Rprice, Sprice, i.imageName, concat(date_format(r.rsvDate, '%Y-%m%d'), '-', r.id, r.user_id, r.play_id) rsvNo " +
        'from reservation r join usableSeat u on (r.usableSeat_usableNo = u.usableNo) ' +
        'join play p on (p.id = r.play_id) ' +
        'join place pl on (p.place_id = pl.id) ' +
        'join image i on (i.play_name = r.play_name) ' +
        'where r.id = ? and imageType = 0';

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [rsvId], function(err, result){
            if (err) {
                return callback(err);
            }
            var rsv = {};
            rsv.rsvNo = result[0].rsvNo;
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
            rsv.poster = url.resolve('https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/posterimg/', path.basename(result[0].imageName));
            // rsv.poster = url.resolve('https://127.0.0.1:4433/posterimg/', path.basename(result[0].imageName));
            callback(null, rsv);
        });
    });
}

module.exports.createRsv = createRsv;
module.exports.listRsv = listRsv;
module.exports.findRsv = findRsv;
