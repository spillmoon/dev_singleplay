// 필요한 모듈 로딩
var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');

function selectSeat(playId, callback) {
    var sql = "select p.theme, p.name, substring(p.playDay, 1, 10) playDay, substring(p.playTime, 1, 5) playTime, pl.address, pl.placeName, p.placeImageName, u.seatClass, u.seatInfo, (p.VIPprice*(100-p.saveOff)/100) VIPprice, (p.Rprice*(100-p.saveOff)/100) Rprice, (p.Sprice*(100-p.saveOff)/100) Sprice " +
              "from play p join place pl on (pl.id = p.place_id) " +
              "join usableSeat u on (u.play_id = p.id) " +
              "where p.playDay=curdate() and p.id=? and u.state=0";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [playId], function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var info = {};
            info.seatInfo=[];
            for (var i = 0; i < results.length; i++) {
                if (results[i].theme == 0)
                    info.theme = "뮤지컬";
                if (results[i].theme == 1)
                    info.theme = "오페라";
                if (results[i].theme == 2)
                    info.theme = "콘서트";
                info.playName = results[i].name;
                info.playDay = results[i].playDay;
                info.playTime = results[i].playTime;
                info.placeImage = url.resolve('https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/placeimg/', path.basename(results[i].placeImageName));
                info.placeAddress = results[i].address;
                info.placeName = results[i].placeName;
                info.seatInfo.push({
                    seatClass : results[i].seatClass,
                    seatInfo : results[i].seatInfo
                });
                info.VIPprice = results[i].VIPprice;
                info.Rprice = results[i].Rprice;
                info.Sprice = results[i].Sprice;
            }
            callback(null, info);
        });
    });
}

module.exports.selectSeat = selectSeat;