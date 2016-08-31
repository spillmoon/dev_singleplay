var mysql = require('mysql');
var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');

function listBoards(callback) {
    var sql = 'SELECT boardNo, titleFileName FROM board;';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var board = [];
            for (var i=0; i<results.length; i++) {
                board.push({
                    boardNo: results[i].boardNo,
                    image : url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/boardimg/', path.basename(results[i].titleFileName))
                    //image : url.resolve('http://127.0.0.1:8080/boardimg/', path.basename(results[i].titleFileName))
                });
            }
            callback(null, board);
        });
    })
}

function findBoard(boardNo, callback) {
    var sql = 'select boardNo, fileName from board where boardNo = ?';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [boardNo], function (err, result) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var board = url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/boardimg/', path.basename(result[0].fileName));
            // var board = url.resolve('http://127.0.0.1:8080/boardimg/', path.basename(result[0].filePath));
            callback(null, board);
        });
    });
}

module.exports.findBoard = findBoard;
module.exports.listBoards = listBoards;