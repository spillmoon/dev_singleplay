function isAuthenticated(req, res, next) {
    if (!req.user) {
        return res.status(401).send({
            message: '로그인을 해주세요.'
        });
    }
    next();
} // 'login이 필요하다'라는 에러 표시

function isSecure(req, res, next) {
    if (!req.secure) {
        return res. status(426).send({
            message: 'upgrade required!!!'
        });
    }
    next();
}

module.exports.isAuthenticated = isAuthenticated;
module.exports.isSecure = isSecure;
