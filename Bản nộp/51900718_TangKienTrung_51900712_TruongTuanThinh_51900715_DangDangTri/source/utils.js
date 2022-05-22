var jwt = require('jsonwebtoken');

function generateToken(username){
    return jwt.sign({ username: username }, process.env.SECRET_KEY);
}

function getCurrentUserdata(req){
    try {
        return req.cookies[process.env.TOKEN]
        ? jwt.verify(req.cookies[process.env.TOKEN], process.env.SECRET_KEY)['user_id']
        : null;
    } catch (error) {
        return null;
    }
}

module.exports = {
    generateToken,
    getCurrentUserdata
};