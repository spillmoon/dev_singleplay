// 필요한 모듈 로딩
var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');
var async = require('async');

// 위시리스트 목록 조회
function listWish(uid, callback) {
    var sql_select_wishlist = "SELECT p.id pid, w.wishId, p.name, place.placeName, substring(p.playDay, 1, 10) playDay, substring(p.playTime, 1, 5) playTime, " +
                              "VIPprice, Rprice, Sprice, p.saveOff, p.starScoreAvg, i.imageName " +
                              "FROM play p join wishlist w on (p.id = w.playId) " +
                              "join place on (place.id = p.place_id)" +
                              "join image i on (p.name = i.play_name) " +
                              "where w.userId = ? " +
                              "group by w.wishId"; // image, place, play, wishlist 테이블을 join하여 필요한 속성 추출하는 쿼리문

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        // dbConn 연결 - 'sql_select'wishlist' 쿼리문 실행
        dbConn.query(sql_select_wishlist, [uid], function (err, results) {
            dbConn.release();
            if (err) {
                return callback("위시리스트 조회 실패");
            }
            // 쿼리문 결과 담을 wish 배열 객체 생성
            var wish = [];
            var tmpwish = {}; // 조건에 맞는 price와 salePrice를 담을 임시 객체

            // 쿼리문을 통해 select된 results(배열 객체)의 길이만큼 for문 실행
            for (var i = 0; i < results.length; i++) {
                // 위시리스트 목록에 VIPprice와 할인 가격이 표시되어야 하는데 VIPprice가 없는 경우 처리
                if (results[i] === null) { // VIPprice가 없는 경우 Rprice를 결과값으로 한다.
                    tmpwish.price = results[i].VIPprice;
                    tmpwish.salePrice = results[i].VIPprice * ((100 - results[i].saveOff) / 100);
                } else { // VIPprice가 있으면 VIPprice를 결과값으로 한다.
                    tmpwish.price = results[i].Rprice;
                    tmpwish.salePrice = results[i].Rprice * ((100 - results[i].saveOff) / 100);
                }
                // 최종 출력될 결과값들을 wish 배열 객체에 push 한다.
                wish.push({
                    playId: results[i].pid,
                    playName: results[i].name,
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: parseInt(tmpwish.price),
                    salePrice: parseInt(tmpwish.salePrice),
                    starScore: results[i].starScoreAvg,
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                    // poster : url.resolve('https://127.0.0.1:4433/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, wish); // router에 null->err, wish->result를 넘겨준다.
        });
    });
}

// 위시리스트 추가
function createWish(userId, playId, callback) {
    var sql_insert_wish = "insert into wishlist (userId, playId, ctime) values (?, ?, convert_tz(current_timestamp(), '+00:00', '+09:00'))"; // 위시리스트 추가하는 쿼리문

    var sql_select_thumbnail = 'select i.imageName ' +
                                'from wishlist w join play p on (w.playId = p.id) ' +
                                'join image i on (i.play_name = p.name) ' +
                                'where w.userId = ? ' +
                                'group by wishId'; // 위시리스트 추가할 시 나타나는 썸네일 이미지 URL 출력해줄 쿼리문

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.beginTransaction(function (err) { // 두 개의 행동이 하나의 작업
            if (err) {
                dbConn.release();
                return callback("위시리스트 추가 실패"); // createWish의 callback에 err를 넘겨줌
            }
            async.series([insertWish, selectThumbnail], function (err, result) { // insertWish, selectThumbnail 함수를 순차실행
                if (err) {
                    return dbConn.rollback(function () { // 에러가 나면 db 롤백! (주의! autocommit 모드 해제!)
                        dbConn.release(); // db연결 끊음
                        callback("위시리스트 추가 실패"); // callback에 err를 넘겨주고
                    });
                }
                dbConn.commit(function () { // 에러가 아니면 commit
                    dbConn.release(); // db연결 끊음
                    callback(null, result[1]); // 두번째 함수의 result가 router의 createWish 함수에 전달 됨.
                })
            });
        });

        function insertWish(callback) { // 트랜잭션 내의 insertWish 함수 정의
            dbConn.query(sql_insert_wish, [userId, playId], function (err, result) {
                if (err) {
                    return callback("WISH INSERT Failed!!!");
                }
                //var wishId = result.insertId;
                callback(null);
            });
        }

        function selectThumbnail(callback) { // 트랜잭션 내의 selectThumbnail 함수 정의
            // dbConn 연결 - 'sql_select_thumbnail' 실행
            dbConn.query(sql_select_thumbnail, [userId], function (err, results) {
                if (err) {
                    return callback("THUMBNAIL SELECT Failed!!!");
                }
                var thumbnail = []; // 쿼리문의 결과가 담길 배열 객체 생성
                // 쿼리문을 통해 select된 results(배열 객체)의 길이만큼 for문 실행
                for (var i = 0; i < results.length; i++) {
                    // 결과로 출력할 위시리스트에 있는 공연 포스터 URL을 thumbnail 배열에 push한다.
                    thumbnail.push(
                        url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                        // url.resolve('https://127.0.0.1:4433/posterimg/', path.basename(results[i].imageName));
                    );
                }
                callback(null, thumbnail); // router의 createWish 함수에 null->err, thumbnail 배열 객체->results를 념겨준다.
            });
        }
    });
}

// 위시리스트 삭제
function deleteWish(wishId, callback) {
    var sql = 'delete from wishlist where wishId = ?'; // 위시리스트 삭제하는 쿼리문

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        // dbConn 연결 - 위시리스트ID를 매개변수로 받아 'sql' 쿼리문을 실행한다.
        dbConn.query(sql, [wishId], function (err) {
            dbConn.release();
            if (err) {
                return callback("위시리스트 삭제 실패");
            }
            callback(null); // router의 deleteWish 함수에 null->err로 넘겨준다.(결과 출력X)
        });
    });
}

// 함수들 exports 모듈 객체로 노출
module.exports.listWish = listWish;
module.exports.createWish = createWish;
module.exports.deleteWish = deleteWish;

