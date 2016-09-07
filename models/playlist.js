var path = require('path');
var url = require('url');
var async = require('async');
var dbPool = require('../models/common').dbPool;
// 같은 날 다른 시간 공연들 하나로 표시, 시간은 여러개 저장할 수 있도록 하기

// 당일 전체 공연 목록
function allList(sort, callback) {
    // 공연, 공연장, 이미지 테이블로 공연 목록 정보 제공
    // substring()으로 T00:00:00.000Z 만 제거
    // curdate()로 현재 날짜 검색
    // 별점순
    var sql_star = "select py.id pid, name, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and imageType = 0 " +
        // "group by name " +
        "order by starScoreAvg desc";
    // 최신순
    var sql_time = "select py.id pid, name, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and imageType = 0 " +
        // "group by name " +
        "order by playTime asc";
    // 할인순
    var sql_sale = "select py.id pid, name, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and imageType = 0 " +
        // "group by name " +
        "order by saveOff desc";
    // var sql_score = "select sum(starScore)/count(starScore) starAvg from starScore where play_name = ?";
    // 매개변수로 받은 정렬 값에 따라 쿼리 선택
    var sql = "";
    if (sort == 0)
        sql = sql_star;
    if (sort == 1)
        sql = sql_time;
    if (sort == 2)
        sql = sql_sale;
    // dbPool에서 커넥션을 가져옴
    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql, function (err, results) {
            dbConn.release();
            if (err) {
                return callback("목록 조회 실패");
            }
            if (results.length == 0) {
                return callback("오늘 공연은 없습니다.");
            }
            var playlist = [];
            var tmpPrice = {};
            for (var i = 0; i < results.length; i++) { // 결과 갯수만큼 객체들을 만들어 정보를 배열에 저장
                if (results[i].VIPprice === null) { // 최고가가 없는 경우 처리
                    tmpPrice.price = results[i].Rprice;
                    tmpPrice.salePrice = results[i].Rprice * ((100 - results[i].saveOff) / 100);
                } else {
                    tmpPrice.price = results[i].VIPprice;
                    tmpPrice.salePrice = results[i].VIPprice * ((100 - results[i].saveOff) / 100);
                }
                playlist.push({
                    playId: results[i].pid,
                    playName: results[i].name,
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: tmpPrice.price,
                    salePrice: tmpPrice.salePrice,
                    starScore: results[i].starScoreAvg,
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, playlist);
        });
    });
}

function musicalList(sort, callback) {
    // 뮤지컬 목록(정렬 방식에 따른 목록 정렬), 쿼리만 다를뿐 전체 목록과 동작과정은 동일
    var sql_star = "select py.id pid, name, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and theme = 0 and imageType = 0 " +
        // "group by name " +
        "order by starScoreAvg desc";
    var sql_time = "select py.id pid, name, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and theme = 0 and imageType = 0 " +
        // "group by name " +
        "order by playTime asc";
    var sql_sale = "select py.id pid, name, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and theme = 0 and imageType = 0 " +
        // "group by name " +
        "order by saveOff desc";
    var sql = "";
    if (sort == 0)
        sql = sql_star;
    if (sort == 1)
        sql = sql_time;
    if (sort == 2)
        sql = sql_sale;

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql, function (err, results) {
            dbConn.release();
            if (err) {
                return callback("목록 조회 실패");
            }
            if (results.length == 0) {
                return callback("오늘 공연은 없습니다.");
            }
            var playlist = [];
            var tmpPrice = {};
            for (var i = 0; i < results.length; i++) {
                if (results[i].VIPprice === null) {
                    tmpPrice.price = results[i].Rprice;
                    tmpPrice.salePrice = results[i].Rprice * ((100 - results[i].saveOff) / 100);
                } else {
                    tmpPrice.price = results[i].VIPprice;
                    tmpPrice.salePrice = results[i].VIPprice * ((100 - results[i].saveOff) / 100);
                }
                playlist.push({
                    playId: results[i].pid,
                    playName: results[i].name,
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: tmpPrice.price,
                    salePrice: tmpPrice.salePrice,
                    starScore: results[i].starScoreAvg,
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, playlist);
        });
    });
}

// 오페라 목록(정렬 방식에 따른 목록 정렬)
function operaList(sort, callback) {
    var sql_star = "select py.id pid, name, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and theme = 1 and imageType = 0 " +
        // "group by name " +
        "order by starScoreAvg desc";
    var sql_time = "select py.id pid, name, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and theme = 1 and imageType = 0 " +
        // "group by name " +
        "order by playTime asc";
    var sql_sale = "select py.id pid, name, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and theme = 1 and imageType = 0 " +
        // "group by name " +
        "order by saveOff desc";
    var sql = "";
    if (sort == 0)
        sql = sql_star;
    if (sort == 1)
        sql = sql_time;
    if (sort == 2)
        sql = sql_sale;

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql, function (err, results) {
            dbConn.release();
            if (err) {
                return callback("목록 조회 실패");
            }
            if (results.length == 0) {
                return callback("오늘 공연은 없습니다.");
            }
            var playlist = [];
            var tmpPrice = {};
            for (var i = 0; i < results.length; i++) {
                if (results[i].VIPprice === null) {
                    tmpPrice.price = results[i].Rprice;
                    tmpPrice.salePrice = results[i].Rprice * ((100 - results[i].saveOff) / 100);
                } else {
                    tmpPrice.price = results[i].VIPprice;
                    tmpPrice.salePrice = results[i].VIPprice * ((100 - results[i].saveOff) / 100);
                }
                playlist.push({
                    playId: results[i].pid,
                    playName: results[i].name,
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: tmpPrice.price,
                    salePrice: tmpPrice.salePrice,
                    starScore: results[i].starScoreAvg,
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, playlist);
        });
    });
}

// 콘서트 목록(정렬 방식에 따른 목록 정렬)
function concertList(sort, callback) {
    var sql_star = "select py.id pid, name, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and theme = 2 and imageType = 0 " +
        // "group by name " +
        "order by starScoreAvg desc";
    var sql_time = "select py.id pid, name, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and theme = 2 and imageType = 0 " +
        // "group by name " +
        "order by playTime asc";
    var sql_sale = "select py.id pid, name, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and theme = 2 and imageType = 0 " +
        // "group by name " +
        "order by saveOff desc";

    var sql = "";
    if (sort == 0)
        sql = sql_star;
    if (sort == 1)
        sql = sql_time;
    if (sort == 2)
        sql = sql_sale;

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql, function (err, results) {
            dbConn.release();
            if (err) {
                return callback("목록 조회 실패");
            }
            if (results.length == 0) {
                return callback("오늘 공연은 없습니다.");
            }
            var playlist = [];
            var tmpPrice = {};
            for (var i = 0; i < results.length; i++) {
                if (results[i].VIPprice === null) {
                    tmpPrice.price = results[i].Rprice;
                    tmpPrice.salePrice = results[i].Rprice * ((100 - results[i].saveOff) / 100);
                } else {
                    tmpPrice.price = results[i].VIPprice;
                    tmpPrice.salePrice = results[i].VIPprice * ((100 - results[i].saveOff) / 100);
                }
                playlist.push({
                    playId: results[i].pid,
                    playName: results[i].name,
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: tmpPrice.price,
                    salePrice: tmpPrice.salePrice,
                    starScore: results[i].starScoreAvg,
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, playlist);
        });
    });
}

// 검색한 구의 공연장에서 하는 공연 목록
function searchLocation(location, callback) {
    // 당일 검색한 구에 위치한 공연장에서 하는 공연 목록 검색 쿼리
    var sql = "select py.id pid, name, theme, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where playDay = curdate() and address = ? and imageType = 0 " +
        // "group by name " +
        "order by playTime asc";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql, location, function (err, results) {
            dbConn.release();
            if (err) {
                return callback("지역 검색 실패");
            }
            if (results.length == 0) {
                return callback("검색 결과가 없습니다.");
            }
            var playlist = [];
            var tmpPrice = {};
            for (var i = 0; i < results.length; i++) {

                if (results[i].VIPprice === null) {
                    tmpPrice.price = results[i].Rprice;
                    tmpPrice.salePrice = results[i].Rprice * ((100 - results[i].saveOff) / 100);
                } else {
                    tmpPrice.price = results[i].VIPprice;
                    tmpPrice.salePrice = results[i].VIPprice * ((100 - results[i].saveOff) / 100);
                }
                playlist.push({
                    playId: results[i].pid,
                    playName: results[i].name,
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: tmpPrice.price,
                    salePrice: tmpPrice.salePrice,
                    starScore: results[i].starScoreAvg,
                    poster: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, playlist);
        });
    });
}

// 검색한 키워드와 관련된 공연 목록
function searchKeyword(keyword, callback) {
    // like를 사용해 검색할 단어와 연관된 공연, 공연장의 공연 목록 제공
    var sql = "select py.id pid, name, theme, placeName, playDay, playTime, VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play py join place pe on (py.place_id = pe.id) " +
        "join image i on (i.play_name = py.name) " +
        "where (name like '%" + keyword + "%' or placeName like '%" + keyword + "%') and playDay = curdate() and imageType = 0 "; // +
    // "group by name";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        dbConn.query(sql, function (err, results) {
            dbConn.release();
            if (err) {
                return callback("키워드 검색 실패");
            }
            if (results.length == 0) {
                return callback("검색 결과가 없습니다.");
            }
            var playlist = [];
            var tmpPrice = {};
            for (var i = 0; i < results.length; i++) {
                if (results[i].VIPprice === null) {
                    tmpPrice.price = results[i].Rprice;
                    tmpPrice.salePrice = results[i].Rprice * ((100 - results[i].saveOff) / 100);
                } else {
                    tmpPrice.price = results[i].VIPprice;
                    tmpPrice.salePrice = results[i].VIPprice * ((100 - results[i].saveOff) / 100);
                }
                playlist.push({
                    id: results[i].pid,
                    name: results[i].name,
                    placeName: results[i].placeName,
                    playDay: results[i].playDay,
                    playTime: results[i].playTime,
                    price: tmpPrice.price,
                    salePrice: tmpPrice.salePrice,
                    star: results[i].starScoreAvg,
                    posterUrl: url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(results[i].imageName))
                    // poster: url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(results[i].imageName))
                });
            }
            callback(null, playlist);
        });
    });
}

function findPlay(pid, uid, callback) {
    // 공연정보, 포스터, 출연자 이미지 가져오기
    var sql_info = "select p.id pid, name, theme, placeName, substring(playDay, 1, 10) playDay, substring(playTime, 1, 5) playTime, " +
        "VIPprice, Rprice, Sprice, saveOff, starScoreAvg, imageName, imageType " +
        "from play p join image i on (i.play_name = p.name) " +
        "join place pl on (p.place_id = pl.id) " +
        "where p.id = ?";
    // 위시리스트에 있는지 판별
    var sql_isWish = "select count(wishId) from wishlist where playId = ? and userId = ?";
    // 빈좌석 갯수 가져오기
    var sql_seat = "select " +
        "sum(case when seatClass = 'VIP' then 1 else 0 end) 'VIP', " +
        "sum(case when seatClass = 'R' then 1 else 0 end) 'R', " +
        "sum(case when seatClass = 'S' then 1 else 0 end) 'S' " +
        "from play p join usableSeat u on (p.id = u.play_id) " +
        "where p.id = ? and u.state = 0";

    dbPool.getConnection(function (err, dbConn) {
        if (err) {
            return callback("DB CONNECTION FAIL");
        }
        var play = {};
        // async의 parallel로 공연정보, 빈자리 정보 가져오기
        dbConn.beginTransaction(function(err) {
            if (err) {
                return callback("TRANSACTION FAIL");
            }
            async.parallel([getPlayInfo, getPlaySeat, isWish], function (err) {
                if (err) {
                    return dbConn.rollback(function() {
                        dbConn.release();
                        callback("공연 상세 조회 실패");
                    });
                }
                dbConn.commit(function() {
                    dbConn.release();
                    callback(null, play);
                });
            });
        });

        // 공연정보 가져오기
        function getPlayInfo(callback) {
            dbConn.query(sql_info, [pid], function (err, playinfo) {
                if (err) {
                    return callback("SQL INFO FAIL");
                }
                if (playinfo.length == 0) {
                    return callback("공연 조회 실패")
                }
                var theme = "";
                if (playinfo[0].theme == 0)
                    theme = "뮤지컬";
                if (playinfo[0].theme == 1)
                    theme = "오페라";
                if (playinfo[0].theme == 2)
                    theme = "콘서트";
                play.playId = playinfo[0].pid;
                play.playName = playinfo[0].name;
                play.theme = theme;
                play.placeName = playinfo[0].placeName;
                play.playDay = playinfo[0].playDay;
                play.playTime = playinfo[0].playTime;
                play.VIPprice = playinfo[0].VIPprice;
                play.saleVIPprice = parseInt(playinfo[0].VIPprice * ((100 - playinfo[0].saveOff) / 100));
                play.Rprice = playinfo[0].Rprice;
                play.saleRprice = parseInt(playinfo[0].Rprice * ((100 - playinfo[0].saveOff) / 100));
                play.Sprice = playinfo[0].Sprice;
                play.saleSprice = parseInt(playinfo[0].Sprice * ((100 - playinfo[0].saveOff) / 100));
                play.starScore = playinfo[0].starScoreAvg;
                play.userCount = 0;
                if (playinfo[0].imageType === 0) {
                    play.poster = url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/posterimg/', path.basename(playinfo[0].imageName));
                    // play.poster.push(url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(playinfo[i].imageName));
                }
                play.cast = [];
                for (var i = 0; i < playinfo.length; i++) {
                    play.cast.push(url.resolve('http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:8080/castimg/', path.basename(playinfo[i].imageName)));
                    // play.cast.push(url.resolve('http://127.0.0.1:8080/posterimg/', path.basename(playinfo[i].imageName)));
                }
                callback(null);
            });
        }

        // 빈자리 정보 가져오기
        function getPlaySeat(callback) {
            dbConn.query(sql_seat, [pid], function (err, seatCount) {
                if (err) {
                    return callback("SQL SEAT FAIL");
                }
                seatCount[0].VIP = seatCount[0].VIP || 0;
                seatCount[0].R = seatCount[0].R || 0;
                seatCount[0].S = seatCount[0].S || 0;
                play.usableSeat = [seatCount[0].VIP, seatCount[0].R, seatCount[0].S];
                callback(null);
            });
        }

        function isWish(callback) {
            if (uid != undefined) {
                dbConn.query(sql_isWish, [pid, uid], function(err, result) {
                    if (err) {
                        return callback("SQL isWISH FAIL");
                    }
                    if (result.length == 1)
                        play.isWish = 1;
                    else
                        play.isWish = 0;
                    callback(null);
                });
            }
            else {
                play.isWish = 0;
                callback(null);
            }
        }
    });
}

module.exports.allList = allList;
module.exports.musicalList = musicalList;
module.exports.operaList = operaList;
module.exports.concertList = concertList;
module.exports.searchLocation = searchLocation;
module.exports.searchKeyword = searchKeyword;
module.exports.findPlay = findPlay;
