var mysql = require('mysql');
var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');

function listBoards(callback) {
    var sql = 'SELECT boardNo, title, writeDate, titleFilePath FROM board';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            console.log('here is board list model');
            var board = [];
            for (var i=0; i<results.length; i++) {
                board.push({
                    id: results[i].boardNo,
                    title: results[i].title,
                    writeDate: results[i].writeDate,
                    fileUrl : url.resolve('http://localhost:8080/boardimg/', path.basename(results[i].titleFilePath))
                });
            }
            callback(null, board);
        });
    })
}

function findBoard(boardNo, callback) {
    var sql = 'select boardNo, filePath from board where boardNo = ?';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [boardNo], function (err, result) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var board = url.resolve('http://localhost:8080/boardimg/', path.basename(result[0].filePath));
            callback(null, board);
        });
    });
}

module.exports.findBoard = findBoard;
module.exports.listBoards = listBoards;
