const express = require("express");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);

const port = process.env.PORT || 8080;
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
});

require("./socketFunc")(io);

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});

