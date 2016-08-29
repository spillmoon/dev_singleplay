var mysql = require('mysql');
var path = require('path');
var url = require('url');
var async = require('async');
var dbPool = require('../models/common').dbPool;

// 뮤지컬 목록(정렬 방식에 따른 목록 정렬)
function musicalList(sort, callback) {
    var sql_star = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imagePath " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 0 " +
        "group by name " +
        "order by starScoreAvg desc";
    var sql_time = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imagePath " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 0 " +
        "group by name " +
        "order by playTime asc";
    var sql_sale = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imagePath " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 0 " +
        "group by name " +
        "order by salePer desc";
    var sql = "";
    if (sort == 0)
        sql = sql_star;
    if (sort == 1)
        sql = sql_time;
    if (sort == 2)
        sql = sql_sale;

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var playlist = [];
            for (var i = 0; i < results.length; i++) {
                playlist.push({
                    playId: results[i].pid,
                    playName: results[i].name,
                    theme: "뮤지컬",
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: results[i].VIPprice,
                    salePrice: results[i].VIPprice * ((100 - results[i].salePer) / 100),
                    salePer: results[i].salePer,
                    starScore: results[i].starScoreAvg,
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imagePath))
                    // poster: url.resolve('http://localhost:8080/posterimg/', path.basename(results[i].imagePath))
                });
            }
            callback(null, playlist);
        });
    });
}
// 오페라 목록(정렬 방식에 따른 목록 정렬)
function operaList(sort, callback) {
    var sql_star = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imagePath " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 1 " +
        "group by name " +
        "order by starScoreAvg desc";
    var sql_time = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imagePath " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 1 " +
        "group by name " +
        "order by playTime asc";
    var sql_sale = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imagePath " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 1 " +
        "group by name " +
        "order by salePer desc";
    var sql = "";
    if (sort == 0)
        sql = sql_star;
    if (sort == 1)
        sql = sql_time;
    if (sort == 2)
        sql = sql_sale;

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var playlist = [];
            for (var i = 0; i < results.length; i++) {
                playlist.push({
                    playId: results[i].pid,
                    playName: results[i].name,
                    theme: "오페라",
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: results[i].VIPprice,
                    salePrice: results[i].VIPprice * ((100 - results[i].salePer) / 100),
                    salePer: results[i].salePer,
                    starScore: results[i].starScoreAvg,
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imagePath))
                    // poster: url.resolve('http://localhost:8080/posterimg/', path.basename(results[i].imagePath))
                });
            }
            callback(null, playlist);
        });
    });
}
// 콘서트 목록(정렬 방식에 따른 목록 정렬)
function concertList(sort, callback) {
    var sql_star = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imagePath " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 2 " +
        "group by name " +
        "order by starScoreAvg desc";
    var sql_time = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imagePath " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 2 " +
        "group by name " +
        "order by playTime asc";
    var sql_sale = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imagePath " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 2 " +
        "group by name " +
        "order by salePer desc";

    var sql = "";
    if (sort == 0)
        sql = sql_star;
    if (sort == 1)
        sql = sql_time;
    if (sort == 2)
        sql = sql_sale;

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var playlist = [];
            for (var i = 0; i < results.length; i++) {
                playlist.push({
                    playId: results[i].pid,
                    playName: results[i].name,
                    theme: "콘서트",
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: results[i].VIPprice,
                    salePrice: results[i].VIPprice * ((100 - results[i].salePer) / 100),
                    salePer: results[i].salePer,
                    starScore: results[i].starScoreAvg,
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imagePath))
                    // poster: url.resolve('http://localhost:8080/posterimg/', path.basename(results[i].imagePath))
                });
            }
            callback(null, playlist);
        });
    });
}
// 검색한 구의 공연장에서 하는 공연 목록(장르 구분 없음)
function searchLocation(location, callback) {
    var sql = "select py.id pid, name, theme, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imagePath " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and address = ? " +
        "group by name " +
        "order by playTime asc";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [location], function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var playlist = [];
            var theme = "";
            for (var i = 0; i < results.length; i++) {
                if (results[i].theme == 0)
                    theme = "뮤지컬";
                if (results[i].theme == 1)
                    theme = "오페라";
                if (results[i].theme == 2)
                    theme = "콘서트";
                playlist.push({
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
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imagePath))
                    // poster: url.resolve('http://localhost:8080/posterimg/', path.basename(results[i].imagePath))
                });
            }
            callback(null, playlist);
        });
    });
}
// 검색한 키워드와 관련된 공연 목록(장르 구분 없음)
function searchKeyword(keyword, callback) {
    var sql = "select a.pid, name, theme, placeName, playDay, playTime, VIPprice, Rprice, Sprice, salePer, starScoreAvg " +
        "from (select py.id pid, name, theme, placeName, playDay, playTime, VIPprice, Rprice, Sprice, salePer, starScoreAvg " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "where name like '%" + keyword + "%' or placeName like '%" + keyword + "%') a " +
        "where a.playDay = '2016-09-01'";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, [keyword], function (err, results) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            var playlist = [];
            var theme = "";
            for (var i = 0; i < results.length; i++) {
                if (results[i].theme == 0)
                    theme = "뮤지컬";
                if (results[i].theme == 1)
                    theme = "오페라";
                if (results[i].theme == 2)
                    theme = "콘서트";
                playlist.push({
                    id: results[i].pid,
                    name: results[i].name,
                    theme: theme,
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: results[i].VIPprice,
                    salePrice: results[i].VIPprice * ((100 - results[i].salePer) / 100),
                    salePer: results[i].salePer,
                    star: results[i].starScoreAvg,
                    posterUrl: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imagePath))
                    // poster: url.resolve('http://localhost:8080/posterimg/', path.basename(results[i].imagePath))
                });
            }
            callback(null, playlist);
        });
    });
}

function findPlay(pid, callback) {
    var sql_play = "select py.id pid, name, theme, placeName, playDay, playTime, VIPprice, Rprice, Sprice, salePer, starScoreAvg " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "where py.id = ? ";
    var sql_poster = "select imagePath " +
        "from image i join play p on (i.play_name = p.name) " +
        "where name = ? and imageType = 0 " +
        "group by imageNo";
    var sql_cast = "select imagePath " +
        "from image i join play p on (i.play_name = p.name) " +
        "where name = ? and imageType = 1 " +
        "group by imageNo";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql_play, [pid], function (err, results) {
            if (err) {
                return callback(err);
            }
            var playlist = {};
            var theme = "";

            if (results[0].theme == 0)
                theme = "뮤지컬";
            if (results[0].theme == 1)
                theme = "오페라";
            if (results[0].theme == 2)
                theme = "콘서트";

            playlist.playId = results[0].pid;
            playlist.playName = results[0].name;
            playlist.theme = theme;
            playlist.placeName = results[0].placeName;
            playlist.day = results[0].playDay;
            playlist.time = results[0].playTime;
            playlist.price = results[0].VIPprice;
            playlist.salePrice = results[0].VIPprice * ((100 - results[0].salePer) / 100);
            playlist.userCount = 0;
            playlist.seatCount = {};
            playlist.seatPrice = {};
            playlist.salePer = results[0].salePer;
            playlist.starScore = results[0].starScoreAvg;

            async.parallel([selectPoster, selectCast], function(err) {
                dbConn.release();
                if (err) {
                    return callback(err);
                }
                callback(null, playlist);
            });

            function selectPoster(callback) {
                dbConn.query(sql_poster, [playlist.name], function(err, posters) {
                    if (err) {
                        return callback(err);
                    }
                    playlist.poster = [];
                    for(var i = 0; i < posters.length; i++){
                        playlist.poster.push(url.resolve('http://localhost:8080/posterimg/', path.basename(posters[i].imagePath)));
                    }
                    callback(null);
                });
            }

            function selectCast(callback) {
                dbConn.query(sql_cast, [playlist.name], function(err, casts) {
                    if (err) {
                        return callback(err);
                    }
                    playlist.cast = [];
                    for(var i = 0; i < casts.length; i++){
                        playlist.cast.push(url.resolve('http://localhost:8080/castimg/', path.basename(casts[i].imagePath)));
                    }
                    callback(null);
                });
            }
        });
    });
}

module.exports.musicalList = musicalList;
module.exports.operaList = operaList;
module.exports.concertList = concertList;
module.exports.searchLocation = searchLocation;
module.exports.searchKeyword = searchKeyword;
module.exports.findPlay = findPlay;
