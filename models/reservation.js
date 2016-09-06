// 필요한 모듈 로딩
var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');
var async = require('async');

// 예약 내역 조회
function listRsv(uid, callback) {
    var sql_select_rsvlist = 'SELECT r.id rid, p.name, place.placeName, substring(p.playDay, 1, 10) playDay, substring(p.playTime, 1, 5) playTime, ' +
                            'p.VIPprice, p.Rprice, p.Sprice, p.saveOff, p.starScoreAvg, i.imageName ' +
                            'FROM play p join reservation r on (p.id = r.play_id) ' +
                            'join place on (place.id = p.place_id) ' +
                            'join image i on (p.name = i.play_name) ' +
                            'where r.user_id = ? ' +
                            'group by r.id'; // play, reservation, place, image 테이블을 join하여 필요한 속성을 추출하는 쿼리문

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        // dbConn 연결 - 'sql_select_rsvlist' 쿼리문 실행
        dbConn.query(sql_select_rsvlist, [uid], function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }

            var rsv = []; // 쿼리문의 결과를 담을 rsv 배열 객체 생성
            var tmprsv = {}; // 조건에 맞는 price와 salePrice를 담을 임시 객체

            // 쿼리문을 통해 select된 results(배열 객체)의 길이만큼 for문 실행
            for (var i=0; i<results.length; i++) {
                // 예약 목록에 VIPprice와 할인 가격이 표시되어야 하는데 VIPprice가 없는 경우 처리
                if (results[i].VIPprice === null) { // VIPprice가 없는 경우 Rprice를 결과값으로 한다.
                    tmprsv.price = results[i].Rprice;
                    tmprsv.salePrice = results[i].Rprice * ((100-results[i].saveOff)/100);
                } else { // VIPprice가 있으면 VIPprice를 결과값으로 한다.
                    tmprsv.price = results[i].VIPprice;
                    tmprsv.salePrice = results[i].VIPprice * ((100-results[i].saveOff)/100);
                }
                // 최종 출력될 결과값들을 rsv 배열 객체에 push 한다.
                rsv.push({
                    rsvId: results[i].rid,
                    playName: results[i].name,
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: tmprsv.price,
                    salePrice: tmprsv.salePrice,
                    starScore: results[i].starScoreAvg,
                    poster: url.resolve('https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('https://127.0.0.1:4433/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, rsv); // router에 null->err, board 객체->results를 넘겨준다.
        });
    });
}

// 예약 내역 추가
function createRsv(userId, playId, playName, usableSeatNo, seatClass, booker, bookerPhone, bookerEmail, callback) {
    var sql_insert = 'insert into reservation(user_id, play_id, play_name, usableSeat_usableNo, seatClass, booker, bookerPhone, bookerEmail) ' +
        "values (?, ?, ?, ?, ?, ?, ?, ?)";// 예약을 추가하는 쿼리문
    var sql_update = 'update usableSeat ' +
        'set state = 1 ' +
        'where state = 0 and usableNo = ?';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function (err) { // 두 개의 행동이 하나의 작업
            if (err) {
                return callback(err);
            }
            async.series([insertRsv, updateSeatState], function (err, result) {
                if (err) {
                    return dbConn.rollback(function () { // 에러가 나면 db 롤백! (주의! autocommit 모드 해제!)
                        dbConn.release(); // db연결 끊음
                        callback(err); // callback에 err를 넘겨주고
                    });
                }
                dbConn.commit(function () { // 에러가 아니면 commit
                    dbConn.release(); // db연결 끊음
                    callback(null); //
                })
            });
        });

        function insertRsv(callback) { // 트랜잭션 내의 함수 정의
            dbConn.query(sql_insert, [userId, playId, playName, usableSeatNo, seatClass, booker, bookerPhone, bookerEmail], function (err) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }

        function updateSeatState(callback) { // 트랜잭션 내의 함수 정의
            dbConn.query(sql_update, [usableSeatNo], function (err) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
    });
}

// 예약 내역들 중 하나의 예약 내역 상세보기
function findRsv(rsvId, callback) {
    var sql = 'select r.id rid, r.user_id uid, r.play_id , r.play_name, substring(p.playDay, 1, 10) playDay, substring(p.playTime, 1, 5) playTime, ' +
                "pl.placeName, r.seatClass, u.seatInfo, VIPprice, Rprice, Sprice, i.imageName, concat(date_format(r.rsvDate, '%Y-%m%d'), '-', r.id, r.user_id, r.play_id) rsvNo " +
                'from reservation r join usableSeat u on (r.usableSeat_usableNo = u.usableNo) ' +
                'join play p on (p.id = r.play_id) ' +
                'join place pl on (p.place_id = pl.id) ' +
                'join image i on (i.play_name = r.play_name) ' +
                'where r.id = ? and imageType = 0'; // reservation, usableSeat, play, place, image 테이블을 join 하여 필요한 속성을 추출하는 쿼리문

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        // dbConn 연결 - 매개변수로 예약ID를 받아 'sql' 쿼리문을 실행한다.
        dbConn.query(sql, [rsvId], function(err, result){
            dbConn.release();
            if (err) {
                return callback(err);
            }
            // 출력하고자 하는 결과를 담을 객체 생성, 하나의 결과가 담겨있는 result 배열 객체의 인덱스는 0이다.
            var rsv = {};
            rsv.rsvId = result[0].rid;
            rsv.reservationNo = result[0].rsvNo;
            rsv.playName = result[0].name;
            rsv.placeName = result[0].placeName;
            rsv.playDay = result[0].playDay;
            rsv.playTime = result[0].playTime;
            rsv.seatClass = result[0].seatClass;
            rsv.seatInfo = result[0].seatInfo;
            // 좌석등급에 따라 결제금액을 처리해준다.
            // 결제금액 = 좌석등급 가격*(100-쿠폰 할인율(%))-회원 마일리지
            if (rsv.seatClass = 'VIP') {
                rsv.settlement = ((result[0].VIPprice*(100-result[0].saveOff)/100)-result[0].mileage)
            }
            if (rsv.seatClass = 'R') {
                rsv.settlement = ((result[0].Rprice*(100-result[0].saveOff)/100)-result[0].mileage)
            }
            if (rsv.seatClass = 'S') {
                rsv.settlement = ((result[0].Sprice*(100-result[0].saveOff)/100)-result[0].mileage)
            }
            // 예약한 공연의 포스터 이미지
            rsv.poster = url.resolve('https://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:4433/posterimg/', path.basename(result[0].imageName));
            // rsv.poster = url.resolve('https://127.0.0.1:4433/posterimg/', path.basename(result[0].imageName));
            callback(null, rsv); // router에 null->err, rsv객체->result에 넘겨준다.
        });
    });
}

function deleteRsv(rsvId, callback) {
    var sql_seat_cancel = "update usableSeat set state = 0 where usableNo = (select usableSeat_usableNo from reservation where id = ?)";
    var sql_rsv_delete = "delete from reservation where id = ?";

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.beginTransaction(function(err) {
            if (err) {
                return callback(err);
            }
            async.series([seatCancel, rsvDelete], function(err, result) {
                if (err) {
                    return dbConn.rollback(function() {
                        dbConn.release();
                        callback(err);
                    });
                }
                dbConn.commit(function() {
                    dbConn.release();
                    callback(null);
                });
            });
        });
        function seatCancel(callback) {
            dbConn.query(sql_seat_cancel, [rsvId], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
        function rsvDelete(callback) {
            dbConn.query(sql_rsv_delete, [rsvId], function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        }
    });
}

// 함수를 exports 객체로 노출시켜 router에서 사용 가능하게 한다.
module.exports.createRsv = createRsv;
module.exports.listRsv = listRsv;
module.exports.findRsv = findRsv;
module.exports.deleteRsv = deleteRsv;
