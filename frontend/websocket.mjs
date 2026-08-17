import {
  sortMessagesOldestFirst,
  validateMessage,
  addMessageIfNew,
  MessageCard,
  renderMessages,
} from "./shared.mjs";

const websocketURL = "ws://localhost:4000";
const websocket = new WebSocket(websocketURL, "chat-protocol");
const rootEle = document.getElementById("messages-root")
const submitButton = document.getElementById("submit-button");
const formFeedbackMessage = document.getElementById("form-feedback");

let messages = [];

function handleReceivedMessage(receivedObject) {
  if (receivedObject.type === "message-history") {
    messages = sortMessagesOldestFirst(receivedObject.data);
    renderMessages(messages);
  }
  if (receivedObject.type === "message-added") {
    const newMessage = receivedObject.data;
    console.log(newMessage);
    addMessageIfNew(messages, newMessage);
  }
  if (receivedObject.type === "error") {
    formFeedbackMessage.textContent = receivedObject.data;
  }
}

websocket.addEventListener("open", () => {
  console.log("connected to the websocket server");
  submitButton.disabled = false;
  //I can add the connection status (connected) and add className success
});

websocket.addEventListener("error", () => {
  console.error("Websocket connection failed");
});
websocket.addEventListener("close", () => {
  console.log("Websocket connection close");
  //I can add the connection status (disconnected) and add className error
});
websocket.addEventListener("message", (event) => {
const receivedObject= JSON.parse(event.data)
handleReceivedMessage(receivedObject)
});


