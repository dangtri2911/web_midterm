var jwt = require('jsonwebtoken');

function generateToken(username){
    return jwt.sign({ username: username }, process.env.SECRET_KEY);
}

function getCurrentUsername(token){
    try {
        const data = jwt.verify(token, process.env.SECRET_KEY);
        return data['username'];
    } catch (error) {
        return null;
    }
}

module.exports = {
    generateToken,
    getCurrentUsername
};