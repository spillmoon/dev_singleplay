


function seatInfo(playId, callback) {
    // var sql = "select p.theme, p.name, p.playDay, p.playTime, pl.address, pl.placeName, p.placeImageName, (p.VIPprice*(100-p.saveOff)/100) VIPprice, (p.Rprice*(100-p.saveOff)/100) Rprice, (p.Sprice*(100-p.saveOff)/100) Sprice  " +
    //"from play p join place pl on (pl.id = p.place_id) "  +
   // "where p.playDay=curdate() and play_name='잭더리퍼'";

    var info = {};

    info.image = "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:80/placeimg/play1_201609012000.png";
    info.list = [];
    info.list.push({usableSeatNo: 3, seatClass: "VIP", seatInfo: "1F-A01"},
        {usableSeatNo: 8, seatClass: "R", seatInfo: "1F-D42"},
        {usableSeatNo: 15, seatClass: "S", seatInfo: "1F-E19"});

    callback(null, info);
}

module.exports.seatInfo = seatInfo;