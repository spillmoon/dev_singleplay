var mysql = require('mysql');
var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');
var async = require('async');


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
                    poster: url.resolve('https://localhost:4433/posterimg/', path.basename(results[i].imagePath))
                });
            }
            callback(null, wishlist);
        });
    });
}

function createWish(userId, playId, callback) {
    var sql_insert_wish = 'insert into wishlist(userId, playId) values(?, ?)';

    var sql_select_thumbnail = 'select i.imageName, i.imagePath ' +
        'from wishlist w join play p on (w.playId = p.id) ' +
        'join image i on (i.play_name = p.name) ' +
        'group by wishId';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function (err) { // 두 개의 행동이 하나의 작업
            if (err) {
                return callback(err); // createMenu의 callback에 err를 넘겨줌
            }
            async.series([insertWish, selectThumbnail], function (err, result) { // 함수를 순차실행
                if (err) {
                    return dbConn.rollback(function () { // 에러가 나면 db 롤백! (주의! autocommit 모드 해제!)
                        dbConn.release(); // db연결 끊음
                        callback(err); // callback에 err를 넘겨주고
                    });
                }
                dbConn.commit(function () { // 에러가 아니면
                    dbConn.release(); // db연결 끊음
                    callback(null, result[1]); // 뒷 함수의 result가 전달 됨.
                })
            });
        });
        function insertWish(callback) { // 트랜잭션 내의 insertMenu, insertFile 함수 정의
            dbConn.query(sql_insert_wish, [userId, playId], function (err, result) {
                if (err) {
                    return callback(err);
                }
                var wishId = result.insertId;
                callback(null);
            });
        }

        function selectThumbnail(callback) { // 트랜잭션 내의 insertFile 함수 정의
            dbConn.query(sql_select_thumbnail, function (err, results) {
                if (err) {
                    return callback(err);
                }
                var thumbnail = [];
                for (var i = 0; i < results.length; i++) {
                    thumbnail.push({
                        thumbnail: url.resolve('https://localhost:4433/posterimg/', path.basename(results[i].imagePath))
                    });
                }
                callback(null, thumbnail);
            });
        }
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
