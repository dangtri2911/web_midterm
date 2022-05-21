const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".messages-container");
const userList = document.getElementById("users");
const socket = io();

socket.emit("joinRoom", { username, room });

socket.on("roomUsers", ({ room, users }) => {
  createUsers(users);
});

socket.on("message", (message) => {
  createMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

function createMessage(message) {
  const div = document.createElement("div");
  let htmlStr =
    message.username === "Bot" ? buildBotMsg(message) : buildUserMsg(message);
  div.innerHTML = htmlStr;
  document.querySelector(".messages-container").appendChild(div);
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

function createUsers(users) {
  userList.innerHTML = "";
  const addedUser = [];
  users.forEach((user) => {
    if (addedUser.indexOf(user.username) == -1) {
      const li = document.createElement("li");
      li.innerText = user.username;
      userList.appendChild(li);
      addedUser.push(user.username);
    }
  });
}

document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "/logout";
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
