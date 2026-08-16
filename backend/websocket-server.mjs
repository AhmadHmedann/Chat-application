import { server as WebSocketServer } from "websocket"; //const WebSocketServer = websocket.server
import express from "express"; // is a class or function ?
import http from "node:http";
import cors from "cors";

const app = express();
app.use(cors());

const port = 4000;
const messages = [];
const connections = []; //to stores active WebSocket connection objects- one for every connected browser tab
let nextMessageId = 1;

//handle normal HTTP request
app.get("/", (req, res) => {
  //we need to load the history only once then websocket will handle everything that happens afterwards
  res.json(messages);
});
const server = http.createServer(app); // create HTTP server
//Attach the WebSocket server
const webSocketServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
}); //at this point express handles normal HTTP requests. webSocketServer handles WebSocket upgrade requests (both use same port)


function originIsAllowed(origin) {
  //check the requesting website
  // return origin === "my front end domain"
  return true; //for now it permits every website
}

webSocketServer.on("request", (request) => {
  //Registers a handler for WebSocket handshake requests.
  if (!originIsAllowed(request.origin)) {
    //request.origin is the address of the frontend requesting the connection
    //to make sure that  we only accept requests from an allowed origin
    request.reject();
    console.log(`connection from origin ${request.origin} rejected.`); ///////////////////////////////////////
    return;
  }
  const connection = request.accept("chat-protocol", request.origin); //return a connection object representing that particular browser tab
  connections.push(connection);
  console.log(
    `WebSocket connection accepted. Active connections: ${connections.length}`,
  ); ///////////////////////////////////////////////////////////////////////////////
  connection.on("message", (message) => {
    //   that fired when  client use socket.send("keke")
    if (message.type !== "utf8") {
      connection.sendUTF(
        JSON.stringify({
          type: "error",
          message: "Expect a text message ",
        }),
      );
      return;
    }
    let body;
    try {
      body = JSON.parse(message.utf8Data);
    } catch (error) {
      connection.sendUTF(
        JSON.stringify({
          type: "error",
          message: "Expected message to be valid JSON ",
        }),
      );
      return;
    }
  });
  connection.on("close", (reasonCode, description) => {
    console.log("disconnected"); /////////////////////////////
  });
});



server.listen(port, () => {
  //start the server  notice server.     not app.  (now the websocket server is attached to server)
  console.error(`WebSocket chat server is listening on port :${port}`);
});