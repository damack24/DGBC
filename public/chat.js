// chat.js
const socket = io();

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

function appendMessage(msg, isOwn = false) {
  const div = document.createElement("div");
  div.classList.add("message");
  if (isOwn) div.classList.add("own");
  div.textContent = msg;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", () => {
  const msg = input.value.trim();
  if (!msg) return;
  socket.emit("chatMessage", msg);
  appendMessage(`🕶️ You: ${msg}`, true);
  input.value = "";
});

socket.on("chatMessage", (msg) => {
  appendMessage(`💬 ${msg}`);
});
