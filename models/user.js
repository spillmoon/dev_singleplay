var mysql = require('mysql');
var staticUser = {};
staticUser.name = "한세정";
staticUser.id = 1;
staticUser.email = "test@naver.com";
staticUser.password = "123";

function findByEmail(userEmail, callback) {
    if (userEmail === staticUser.email) {
        callback(null, staticUser);
    }
}

function verifyPassword(password, hashPassword, callback) {
    if (password === hashPassword) {
        callback(null, true);
    }
}

function findUser(email, callback) {
    callback(null, staticUser);
}

function findOrCreate(profile, callback) {
    var user = {};
    user.id = staticUser.id;
    // user.email = profile.emails[0].value;
    user.facebookid = profile.id;
    return callback(null, user);
}

module.exports.findByEmail = findByEmail;
module.exports.verifyPassword = verifyPassword;
module.exports.findUser = findUser;
module.exports.findOrCreate = findOrCreate;
