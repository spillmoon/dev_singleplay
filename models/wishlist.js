var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');

//FIXME: 로그인 연동
function listWish(callback) {
    var sql_select_wishlist = "SELECT p.name, place.placeName, p.playDay, p.playTime, p.VIPprice, p.salePer, p.starScoreAvg, i.imageName " +
        "FROM play p join wishlist w on (p.id = w.playId) " +
        "join place on (place.id = p.place_id)" +
        "join image i on (p.name = i.play_name)";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_select_wishlist, function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var wish = {};
            wish.list = [];
            for (var i=0; i<results.length; i++) {
                wish.playName= results[i].name;
                wish.starScoreAvg = results[i].starScoreAvg;
                wish.placeName = results[i].placeName;
                wish.playDay = results[i].playDay;
                wish.playTime = results[i].playTime;
                wish.price = results[i].VIPprice;
                wish.salePrice = results[i].VIPprice * ((100-results[i].salePer)/100);
                wish.list.push({
                    list : url.resolve('https://localhost:8080/image/poster/', path.basename(results[i].imageName))
                });
            }
            callback(null, wish);
        });
    });
}

function createWish(userId, playId, callback) {
    var sql = 'insert into wishlist(userId, playId) ' +
        'values(?, ?)';

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

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [wishId], function(err, result) {
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