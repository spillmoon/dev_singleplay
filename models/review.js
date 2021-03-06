// 필요한 모듈 로딩
var mysql = require('mysql');
var dbPool = require('../models/common').dbPool;

// 리뷰 생성
function createReview(userId, playId, playName, starScore, callback) {
    var sql = 'insert into starScore(user_id, play_id, play_name, starScore) ' +
              "values (?, ?, ?, ?)"; // 리뷰 생성하는 쿼리문
    var sql_reivew_check = "update reservation set review = 1 where user_id = ? and play_id = ? and status = 1";
    dbPool.logStatus();
    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        // dbConn 연결 - 매개변수로 회원ID, 공연ID, 공연명, 별점을 받아 'sql' 쿼리문 실행
        dbConn.query(sql, [userId, playId, playName, starScore], function(err) {
            if (err) {
                dbConn.release();
                dbPool.logStatus();
               return callback("평가 입력 실패");
            }
            dbConn.query(sql_reivew_check, [userId, playId], function(err) {
                dbConn.release();
                dbPool.logStatus();
                if (err) {
                    return callback("리뷰 체크 실패");
                }
                callback(null); // router에 null->err를 넘겨준다.
            });
        });
    });
}

// 함수를 exports 객체로 노출
module.exports.createReview = createReview;
