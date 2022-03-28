module.exports = function (io) {
  io.on("connection", (socket) => {
    socket.on("clientMsg", ({ message }) => {
      const user = getUser(socket.id);
      const data = { text: message, user: user.username };
      io.emit("serverMsg", data);
    });
  });
};
