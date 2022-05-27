const { addUser, removeUser, getUser, getUsersInRoom } = require("./usersData");
const {compilerFunc} = require('../utils/compile.js')

module.exports = function (io) {
  io.on("connection", (socket) => {
    socket.on("join", ({ username, room, siteId }, callback) => {
      try {
        const { error, user } = addUser({
          id: socket.id,
          siteId,
          username,
          room,
        });

        if (error) {
          return callback({ error });
        }
        try {
          socket.join(user.room);
          console.log("A new user joined", user.room, user.username);
        } catch (e) {
          return console.log("cant join");
        }

        //To get data for newly connected client from the room
        const socketsInstances = async () => {
          try {
            const clients = await io.in(user.room).fetchSockets();
            const teamMembers = getUsersInRoom(user.room);
            io.to(user.room).emit("peopleInRoom", {
              teamMembers,
              userJoin: user,

            });

            //counts how many users are active in room
            let res = "";
            if (clients.length > 1) {
              //make functions for getting data
              let askedCnt = 0;

              for (const client of clients) {
                if (askedCnt == 5) break;
                if (client.id === socket.id) continue;

                askedCnt++;
                io.to(client.id).emit("sendFullData", { id: socket.id });
              }
            }
          } catch (e) {}
        };

        socketsInstances();
        return callback({ user });
      } catch (e) {
        console.log(e);
      }
    });

    socket.on("MyFullData", (data) => {
      console.log('MyFullData:',data);
      try {
        io.to(data.sendTo).emit("syncIntialData", data);
      } catch (e) {
        console.log(e);
      }
    });
    
    //codeCompile and broadcast
    socket.on("codeCompile", async(data) => {
      console.log('codeCompile')
      try {
        const {language ,code, input} = data;
        let res = await compilerFunc(language, code, input);
        console.log(res.data)
        const { room } = getUser(socket.id);
        if (!room) return;
        io.to(room).emit("compileResult", res.data);
      } catch (e) {
        console.log(e);
      }
    });

    //real-time updates on the change in IO
    socket.on("LocalChanges", (data) => {
      try {
        const { room } = getUser(socket.id);
        if (!room) return;
        socket.broadcast.to(room).emit("RemoteChanges", data);
      } catch (e) {
        console.log(e);
      }
    });
    
    //Disconnecting the user and updating , notifying other people in the room about the user
    socket.on("disconnect", () => {
      try {
        const user = removeUser(socket.id);
        if (!user) return;

        console.log("disconnecting", user);

        if (user) {
          try {
            const socketsInstances = async () => {
              const clients = await io.in(user.room).fetchSockets();
              const teamMembers = getUsersInRoom(user.room);
              if (clients.length) {
                io.to(user.room).emit("peopleInRoom", {
                  teamMembers,
                  userLeft: user,
                });
              }
              socket.leave(user.room);
              console.log("Disconnected");
            };
            socketsInstances();
          } catch (e) {
            console.log(e);
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
  });
};
