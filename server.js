const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

require("dotenv").config();
const {
  userJoin,
  getCurrentUser,
  leaveRoom,
  getListUser,
  usersCredentail,
} = require("./utils/users");
const { generateToken, getCurrentUserdata } = require("./utils");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const BOT_NAME = "Bot";
const fileUpload = require("express-fileupload");

app.use((req, res, next) => {
  if (req.url === "/chat.html") {
    if (
      !req.cookies ||
      !req.cookies[process.env.TOKEN] ||
      getCurrentUserdata(req) === null
    ) {
      res.clearCookie(process.env.TOKEN);
      res.redirect("/");
      return;
    }
  }

  next();
  return;
});

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

app.get("/demo", (req, res) => {
  res.json(usersCredentail);
  return;
});

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit("message", formatMessage(BOT_NAME, `${username} has joined`));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(BOT_NAME, `${user.username} has joined the chat`)
      );
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getListUser(user.room),
    });
  });

  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  socket.on("disconnect", () => {
    const user = leaveRoom(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(BOT_NAME, `${user.username} has left the chat`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getListUser(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () =>
  console.log(`Application is running on http://localhost:${PORT}`)
);
