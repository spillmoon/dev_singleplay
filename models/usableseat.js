


function seatInfo(playId, callback) {
    var info = {};

    info.image = "http://ec2-52-78-118-8.ap-northeast-2.compute.amazonaws.com:80/placeimg/play1_201609012000.png";
    info.list = [];
    info.list.push({usableSeatNo: 3, seatClass: "VIP", seatInfo: "1F-A01"},
        {usableSeatNo: 8, seatClass: "R", seatInfo: "1F-D42"},
        {usableSeatNo: 15, seatClass: "S", seatInfo: "1F-E19"});

    callback(null, info);
}

module.exports.seatInfo = seatInfo;