var mysql = require('mysql');
var dbPool = require('../models/common').dbPool;
var path = require('path');
var url = require('url');
var fs = require('fs');

function listBoards(callback) {
    var sql = 'SELECT boardNo, titleFilePath FROM board';

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var board = {};
            board.list = [];
            for (var i=0; i<results.length; i++) {
                board.list.push({
                    fileUrl : url.resolve('http://localhost:8080/boards/', path.basename(results[i].titleFilePath))
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
            var board = {};
            board.fileName = path.basename(result[0].filePath);
            board.fileUrl = url.resolve('http://localhost:80/boards/', board.fileName);
            callback(null, board);
        });
    });
}

module.exports.findBoard = findBoard;
module.exports.listBoards = listBoards;
