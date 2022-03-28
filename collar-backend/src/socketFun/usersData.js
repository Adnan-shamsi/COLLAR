const users = [];

//Adding users in a room 
const addUser = ({ id, username, siteId, room}) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //No two user can have same name
  if (existingUser) {
    return {
      error: "Username is in use! Choose some other name",
    };
  }

  const user = { id, username, room, siteId };
  users.push(user);
  return { user };
};

//removing the user by filtering the user id 
const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  } else {
    return null;
  }
};

//returns a user
const getUser = (id) => {
  return users.find((user) => user.id === id);
};

//Returning a list of users
const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};