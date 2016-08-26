var mysql = require('mysql');
var dbPool = require('../models/common').dbPool;

// todo: 뮤지컬 목록(정렬 방식에 따른 목록 정렬)
function musicalList() {

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
