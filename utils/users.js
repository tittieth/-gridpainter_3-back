const users = [];

// Join user to chat
function userJoin(id, username, color) {
    const user = { id, username, color };

    users.push(user);
    console.log('new user' + users.username);
    return user;
}

// Get current user 
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

// // user leaves chat
// function userLeave(id) {
//     const index = users.findIndex(user => user.id === id);

//     if(index !== -1) {
//         return users.splice(index, 1)[0];
//     }
// }

// // get room users 
// function getRoomUsers(room) {
//     return users.filter(user => user.room === room);
// }

module.exports = {
    userJoin,
    getCurrentUser,
    users
    // userLeave,
    // getRoomUsers
};