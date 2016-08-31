var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');
var async = require('async');


// FIXME: 로그인 연동
function listWish(callback) {
    var sql_select_wishlist = "SELECT w.wishId, p.name, place.placeName, substring(p.playDay, 1, 10) playDay, substring(p.playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, p.salePer, p.starScoreAvg, i.imageName " +
        "FROM play p join wishlist w on (p.id = w.playId) " +
        "join place on (place.id = p.place_id)" +
        "join image i on (p.name = i.play_name) " +
        "group by w.wishId";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_select_wishlist, function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var wish = [];
            var tmpwish = {}; // 조건에 맞는 price와 salePrice를 담을 임시 객체

            for (var i=0; i<results.length; i++) {
                if (results[i] === null) {
                    tmpwish.price = results[i].VIPprice;
                    tmpwish.salePrice = results[i].VIPprice * ((100-results[i].salePer)/100);
                } else {
                    tmpwish.price = results[i].Rprice;
                    tmpwish.salePrice = results[i].Rprice * ((100-results[i].salePer)/100);
                }
                wish.push({
                    playName : results[i].name,
                    starScoreAvg : results[i].starScoreAvg,
                    placeName : results[i].placeName,
                    playDay : results[i].playDay,
                    playTime : results[i].playTime,
                    salePer : results[i].salePer,
                    originalPrice : tmpwish.price,
                    salePrice : tmpwish.salePrice,
                    poster : url.resolve('https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/posterimg/', path.basename(results[i].imageName))
                    // poster : url.resolve('https://127.0.0.1:4433/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, wish);
        });
    });
}

function createWish(userId, playId, callback) {
    var sql_insert_wish = 'insert into wishlist(userId, playId) values(?, ?)';

    var sql_select_thumbnail = 'select i.imageName ' +
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
                    thumbnail.push(
                        url.resolve('https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/posterimg/', path.basename(results[i].imageName))
                        // url.resolve('https://127.0.0.1:4433/posterimg/', path.basename(results[i].imageName));
                    );
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
