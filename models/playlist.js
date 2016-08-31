var mysql = require('mysql');
var path = require('path');
var url = require('url');
var async = require('async');
var dbPool = require('../models/common').dbPool;
// fixme: 같은 날 다른 시간 공연들 하나로 표시, 시간은 여러개 저장할 수 있도록 하기
// fixme: 쿼리 리팩토링
// 뮤지컬 목록(정렬 방식에 따른 목록 정렬)
function musicalList(sort, callback) {
    var sql_star = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 0 and imageType = 0 " +
        "order by starScoreAvg desc";
    var sql_time = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 0 and imageType = 0 " +
        "order by playTime asc";
    var sql_sale = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 0 and imageType = 0 " +
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
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, playlist);
        });
    });
}
// fixme: 쿼리 리팩토링
// 오페라 목록(정렬 방식에 따른 목록 정렬)
function operaList(sort, callback) {
    var sql_star = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 1 and imageType = 0 " +
        "order by starScoreAvg desc";
    var sql_time = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 1 and imageType = 0 " +
        "order by playTime asc";
    var sql_sale = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 1 and imageType = 0 " +
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
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, playlist);
        });
    });
}
// fixme: 쿼리 리팩토링
// 콘서트 목록(정렬 방식에 따른 목록 정렬)
function concertList(sort, callback) {
    var sql_star = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 2 and imageType = 0 " +
        "order by starScoreAvg desc";
    var sql_time = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 2 and imageType = 0 " +
        "order by playTime asc";
    var sql_sale = "select py.id pid, name, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and theme = 2 and imageType = 0 " +
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
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, playlist);
        });
    });
}

// 검색한 구의 공연장에서 하는 공연 목록(장르 구분 없음)
function searchLocation(location, callback) {
    var sql = "select py.id pid, name, theme, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = '2016-09-01' and address = ? and imageType = 0 " +
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
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, playlist);
        });
    });
}

// 검색한 키워드와 관련된 공연 목록(장르 구분 없음)
function searchKeyword(keyword, callback) {
    var sql = "select a.pid, name, theme, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imageName, imageType " +
        "from (select py.id pid, name, theme, placeName, playDay, playTime, VIPprice, salePer, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where name like '%" + keyword + "%' or placeName like '%" + keyword + "%') a " +
        "where a.playDay = '2016-09-01' and imageType = 0";

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
                    posterUrl: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, playlist);
        });
    });
}

function findPlay(pid, callback) {
    var sql_image = "select p.id pid, name, theme, placeName, playDay, playTime, VIPprice, Rprice, Sprice, salePer, starScoreAvg, imageName, imageType " +
        "from play p join image i on (i.play_name = p.name) " +
        "join place pl on (p.place_id = pl.id) " +
        "where p.id = ?";

    var sql_info = "select usableNo, seatInfo, seatClass " +
        "from play p join usableSeat u on (p.id = u.play_id) " +
        "where p.id = ?";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback(err);
        }
        var playlist = {};
        async.parallel([getPlayInfo, getPlaySeat], function(err) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            callback(null, playlist);
        });

        function getPlayInfo(callback) {
            dbConn.query(sql_image, [pid], function(err, playinfo) {
                if (err) {
                    return callback(err);
                }
                var theme = "";
                if (playinfo[0].theme == '0')
                    theme = "뮤지컬";
                if (playinfo[0].theme == '1')
                    theme = "오페라";
                if (playinfo[0].theme == '2')
                    theme = "콘서트";
                playlist.playId = playinfo[0].pid;
                playlist.playName = playinfo[0].name;
                playlist.theme = theme;
                playlist.placeName = playinfo[0].placeName;
                playlist.playDay = playinfo[0].playDay;
                playlist.playTime = playinfo[0].playTime;
                playlist.VIPprice = playinfo[0].VIPprice;
                playlist.saleVIPprice = playinfo[0].VIPprice * ((100 - playinfo[0].salePer) / 100);
                playlist.Rprice = playinfo[0].Rprice;
                playlist.saleRprice = playinfo[0].Rprice * ((100 - playinfo[0].salePer) / 100);
                playlist.Sprice = playinfo[0].Sprice;
                playlist.saleSprice = playinfo[0].Sprice * ((100 - playinfo[0].salePer) / 100);
                playlist.salePer = playinfo[0].salePer;
                playlist.starScore = playinfo[0].starScoreAvg;
                playlist.userCount = 0;
                playlist.poster = [];
                playlist.cast = [];
                for(var i = 0; i < playinfo.length; i++){
                    if (playinfo[i].imageType == 0 ) {
                        playlist.poster.push(url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(playinfo[i].imageName)));
                        // playlist.poster.push(url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(playinfo[i].imageName)));
                    }
                    else {
                        playlist.cast.push(url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(playinfo[i].imageName)));
                        // playlist.cast.push(url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(playinfo[i].imageName)));
                    }
                }
                callback(null);
            });
        }

        function getPlaySeat(callback) {
            dbConn.query(sql_info, [pid], function(err, seatinfo) {
                if (err) {
                    return callback(err);
                }
                if (seatinfo.length == 0) {
                    playlist.usableSeat = "매진";
                }
                else {
                    playlist.usableSeat = [];
                    for (var i = 0; i < seatinfo.length; i++) {
                        playlist.usableSeat.push(seatinfo[i].seatInfo);
                    }
                }
                callback(null);
            });
        }
    });
}

module.exports.musicalList = musicalList;
module.exports.operaList = operaList;
module.exports.concertList = concertList;
module.exports.searchLocation = searchLocation;
module.exports.searchKeyword = searchKeyword;
module.exports.findPlay = findPlay;
