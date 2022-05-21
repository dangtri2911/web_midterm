const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const socket = io();

socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
  createRoomName(room);
  createUsers(users);
});

socket.on("message", (message) => {
  console.log(message);
  createMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

function createMessage(message) {
  const div = document.createElement("div");
  let htmlStr =
    message.username === "Bot" ? buildBotMsg(message) : buildUserMsg(message);
  div.innerHTML = htmlStr;
  document.querySelector(".chat-messages").appendChild(div);
}

function buildBotMsg(message) {
  return `<div class="row msg-container bot-msg">
            <div class="message">
              <p class="text">${message.text}</p>
            </div>
          </div>`;
}

function buildUserMsg(message) {
  const classes = username === message.username ? "current-user-msg" : "";
  return `<div class="row msg-container ${classes}">
            <div class="message">
            <p class="meta">${message.username} - <span>${message.time}</span></p>
              <p class="text">${message.text}</p>
            </div>
          </div>`;
}

function createRoomName(room) {
  roomName.innerText = room;
}

function createUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "/logout";
  } else {
  }
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value;
  msg = msg.trim();
  if (!msg) {
    return false;
  }
  socket.emit("chatMessage", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});
