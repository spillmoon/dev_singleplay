var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');

// FIXME: 로그인 연동
function listWish(callback) {
    var sql_select_wishlist = "SELECT p.id pid, p.name, place.placeName, p.playDay, p.playTime, p.VIPprice, p.salePer, p.starScoreAvg, i.imageName " +
        "FROM play p join wishlist w on (p.id = w.playId) " +
        "join place on (place.id = p.place_id)" +
        "join image i on (p.name = i.play_name) " +
        "group by p.name";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_select_wishlist, function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var wishlist = [];
            var theme = "";
            for (var i = 0; i < results.length; i++) {
                if (results[i].theme == 0)
                    theme = "뮤지컬";
                if (results[i].theme == 1)
                    theme = "오페라";
                if (results[i].theme == 2)
                    theme = "콘서트";
                wishlist.push({
                    playId: results[i].pid,
                    playName: results[i].name,
                    theme: theme,
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: results[i].VIPprice,
                    salePrice: results[i].VIPprice * ((100 - results[i].salePer) / 100),
                    salePer: results[i].salePer,
                    starScore: results[i].starScoreAvg,
                    poster: url.resolve('https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/posterimg/', path.basename(results[i].imagePath))
                    //poster: url.resolve('https://localhost:4433/posterimg/', path.basename(results[i].imagePath))
                });
            }
            callback(null, wishlist);
        });
    });
}

function createWish(userId, playId, callback) {
    var sql = 'insert into wishlist(userId, playId) values(?, ?)';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [userId, playId], function (err) {
            if (err) {
                return callback(err);
            }
            callback(null);
        });
    });
}

function deleteWish(wishId, callback) {
    var sql = 'delete from wishlist where wishId = ? ';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [wishId], function (err, result) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    });
}

module.exports.listWish = listWish;
module.exports.createWish = createWish;
module.exports.deleteWish = deleteWish;