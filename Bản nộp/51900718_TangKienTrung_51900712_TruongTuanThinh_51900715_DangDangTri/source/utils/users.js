const users = [];
const usersCredentail = {
    user1: "123456",
    user2: "123456",
    user3: "123456",
};

function joinRoom(id, username, room) {
    const user = { id, username, room };
    users.push(user);
    return user;
}

function getCurrentUser(id) {
    return users.find((user) => user.id === id);
}

function leaveRoom(id) {
    if (index = users.findIndex((user) => user.id === id) !== -1) {
        return users.splice(index, 1)[0];
    }
}

function getListUser(room) {
    return users.filter((user) => user.room === room);
}

module.exports = {
    userJoin: joinRoom,
    getCurrentUser,
    leaveRoom: leaveRoom,
    getListUser: getListUser,
    usersCredentail,
};