const websocketURL = "ws://localhost:4000";
const websocket = new WebSocket(websocketURL, "chat-protocol");

const submitButton =document.getElementById("submit-button")

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
  //here event is the message I received form backend
});
