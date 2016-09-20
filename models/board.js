// 필요한 모듈 로딩
var mysql = require('mysql');
var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');

// 공지사항, 이벤트 목록 조회
function listBoards(callback) {
    var sql = 'SELECT boardNo, titleFileName FROM board ORDER BY boardNo DESC'; // 게시물 목록 화면에 필요한 속성 추출하는 쿼리문
    dbPool.logStatus();
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB 연결 실패");
        }
        // dbConn 연결 - 'sql' 쿼리문을 실행한다.
        dbConn.query(sql, function (err, results) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback("공지사항, 이벤트 목록 조회 실패");
            }

            if(results.length === 0) {
                return callback("조회 목록이 없습니다.");
            } else {
                var board = []; // 공지사항, 이벤트 목록을 담을 배열 객체 생성

                for (var i=0; i<results.length; i++) {
                    // 배열 안에 출력 될 게시글 번호와 titleNameImage를 push한다.
                    board.push({ // 공지사항과 이벤트 목록은 title 이미지로 출력한다.
                        boardNo: results[i].boardNo,
                        image : url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/boardimg/', path.basename(results[i].titleFileName))
                        // image : url.resolve('http://127.0.0.1:8080/boardimg/', path.basename(results[i].titleFileName))
                    });
                }
                callback(null, board); // router에 err->null, results->board 배열 객체를 넘겨준다.
            }
            // 쿼리문을 통해 select된 results(배열 객체)의 길이만큼 for문 실행
        });
    })
}

// 공지사항 이벤트 목록들 중 하나의 게시글 상세보기
function findBoard(boardNo, callback) {
    var sql = 'select boardNo, fileName from board where boardNo = ?'; // select 쿼리문
    dbPool.logStatus();
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB 연결 실패");
        }
        // dbConn 연결 - 매개변수로 게시물번호를 받아 'sql' 쿼리문을 실행한다.
        dbConn.query(sql, [boardNo], function (err, result) {
            dbConn.release();
            dbPool.logStatus();
            if (err) {
                return callback("이미지 불러오기 실패");
            }

            if(result.length === 0) {
                return callback("이미지를 불러올 수 없습니다.");
            } else {
                var board = url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/boardimg/', path.basename(result[0].fileName)); // 하나의 결과 담긴 result 배열 객체의 index 0
                //  var board = url.resolve('http://127.0.0.1:8080/boardimg/', path.basename(result[0].fileName));
                callback(null, board); // router에 err->null, result->board 객체를 넘겨준다.
            }
            // 쿼리문의 결과를 담을 board 객체 생성 - 결과 이미지로 보여줌
        });
    });
}

// 함수를 exports 객체로 노출시켜 router에서 사용 가능하게 한다.
module.exports.findBoard = findBoard;
module.exports.listBoards = listBoards;
