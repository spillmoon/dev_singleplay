var mysql = require('mysql');
var dbPool = require('../models/common').dbPool;

// todo: 뮤지컬 목록(정렬 방식에 따른 목록 정렬)
function musicalList(sort, callback) {
    var sql_star = "select py.id pid, name, '뮤지컬', placeName, playDay, playTime, VIPprice, starScoreAvg " +
                "from play py join place pe on (py.place_id = pe.id) " +
                "where playDay = '2016-09-01' and theme = 0 " +
                "order by starScoreAvg desc";
    var sql_time = "select py.id pid, name, '뮤지컬', placeName, playDay, playTime, VIPprice, starScoreAvg " +
                    "from play py join place pe on (py.place_id = pe.id) " +
                    "where playDay = '2016-09-01' " +
                    "order by playTime asc";
    var sql_sale = "select py.id pid, name, '뮤지컬', placeName, playDay, playTime, VIPprice, starScoreAvg " +
                    "from play py join place pe on (py.place_id = pe.id) " +
                    "where playDay = '2016-09-01' " +
                    "order by salePer desc";
    var sql = "";
    if (sort == 0)
        sql = sql_star;
    if (sort == 1)
        sql = sql_time;
    if (sort == 2)
        sql = sql_sale;

    dbPool.getConnection(function(err, dbConn) {
        if (err) {
            return callback(err);
        }
        dbConn.query(sql, function(err, playlist) {
            dbConn.release();
            if (err) {
                return callback(err);
            }
            callback(null, playlist);
        })

    });
}
// todo: 오페라 목록(정렬 방식에 따른 목록 정렬)
function operaList() {

}
// todo: 콘서트 목록(정렬 방식에 따른 목록 정렬)
function concertList() {

}
// todo: 검색한 구의 공연장에서 하는 공연 목록(장르 구분 없음)
function searchLocation() {

}
// todo: 검색한 키워드와 관련된 공연 목록(장르 구분 없음)
function searchKeyword() {

}

module.exports.musicalList = musicalList;
module.exports.operaList = operaList;
module.exports.concertList = concertList;
module.exports.searchLocation = searchLocation;
module.exports.searchKeyword = searchKeyword;
