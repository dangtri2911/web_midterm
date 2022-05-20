const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const cookieParser = require("cookie-parser");
var bodyParser = require('body-parser');

require("dotenv").config();
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  usersCredentail,
} = require("./utils/users");
const { generateToken } = require("./utils");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "Bot";
const fileUpload = require('express-fileupload');

// for parsing application/json
app.use(bodyParser.json()); 
app.use(fileUpload());

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/user-list", (req, res) => {
  res.type("json");
  res.json(Object.keys(usersCredentail));
});

app.get("/logout", (req, res) => {
  res.clearCookie(process.env.TOKEN);
  res.redirect("/");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (usersCredentail[username] && usersCredentail[username] == password) {
    res.cookie(process.env.TOKEN_NAME, generateToken(username));
    res.json({
      message: "SUCCESS",
    });
    return;
  } else {
    res.statusCode = 401;
    res.json({
      message: "INVALID_CREDENTIALS",
    });
    return;
  }
});

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit("message", formatMessage(botName, `${username} has joined`));

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () =>
  console.log(`Application running on http://localhost:${PORT}`)
);
