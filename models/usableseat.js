// 필요한 모듈 로딩
var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');

function selectSeat(playId, callback) {
    var sql = "select p.theme, p.name, substring(p.playDay, 1, 10) playDay, substring(p.playTime, 1, 5) playTime, pl.address, pl.placeName, " +
        "p.placeImageName, u.seatClass, u.seatInfo, (p.VIPprice*(100-p.saveOff)/100) VIPprice, (p.Rprice*(100-p.saveOff)/100) Rprice, " +
        "(p.Sprice*(100-p.saveOff)/100) Sprice, u.usableNo " +
        "from play p join place pl on (pl.id = p.place_id) " +
        "join usableSeat u on (u.play_id = p.id) " +
        "where p.playDay = curdate() and p.id = ? and u.state = 0";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql, [playId], function (err, results) {
            dbConn.release();
            if (err) {
                return callback("빈자리 정보 제공 실패");
            }
            var info = {};
            if (results[0].theme == 0)
                info.theme = "뮤지컬";
            if (results[0].theme == 1)
                info.theme = "오페라";
            if (results[0].theme == 2)
                info.theme = "콘서트";
            info.playName = results[0].name;
            info.playDay = results[0].playDay;
            info.playTime = results[0].playTime;
            info.placeImage = url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/placeimg/', path.basename(results[0].placeImageName));
            info.placeAddress = results[0].address;
            info.placeName = results[0].placeName;
            info.seatInfo = [];
            if (results.length === 0) {
                callback(null, info);
            } else {
                var price = 0;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].seatClass == "VIP")
                        price = results[i].VIPprice;
                    if (results[i].seatClass == "R")
                        price = results[i].Rprice;
                    if (results[i].seatClass == "S")
                        price = results[i].Sprice;
                    info.seatInfo.push({
                        usableSeatNo: results[i].usableNo,
                        seatClass: results[i].seatClass,
                        seatInfo: results[i].seatInfo,
                        price: price
                    });
                }
                callback(null, info);
            }
        });
    });
}

module.exports.selectSeat = selectSeat;
