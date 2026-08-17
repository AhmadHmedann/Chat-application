import { server as WebSocketServer } from "websocket"; 
import express from "express"; 
import http from "node:http";
import cors from "cors";
import { validateBody, validateMessage } from "./shared.mjs";
const app = express();
app.use(cors());

const port = 4000;
const messages = [];
const connections = []; 
let nextMessageId = 1;

// //handle normal HTTP request
// app.get("/", (req, res) => {
//   //we need to load the history only once then websocket will handle everything that happens afterwards
//   res.json(messages);
// });
const server = http.createServer(app); // create HTTP server
//Attach the WebSocket server
const webSocketServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

function originIsAllowed(origin) {
  //check the requesting website
  // return origin === "my front end domain"
  return true; //for now it permits every website
}

webSocketServer.on("request", (request) => {
 
  if (!originIsAllowed(request.origin)) {
    //request.origin is the address of the frontend requesting the connection
    //to make sure that  we only accept requests from an allowed origin
    request.reject();
    console.log(`connection from origin ${request.origin} rejected.`); ///////////////////////////////////////
    return;
  }
  const connection = request.accept("chat-protocol", request.origin); 
  connections.push(connection);
  console.log(
    `WebSocket connection accepted. Active connections: ${connections.length}`,
  ); 
connection.sendUTF(JSON.stringify({
    type:"message-history",
    data: messages,
}))
  connection.on("message", (message) => {
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
          data: "Expected message to be valid JSON ",
        }),
      );
      return;
    }
    const validateBodyError = validateBody(body);
    if (validateBodyError !== null) {
      connection.sendUTF(
        JSON.stringify({ type: "error", data: validateBodyError }),
      );
      return;
    }
    const trimmedMessage = body.message.trim();
    const trimmedUserName = body.username.trim();
    const validateMessageError = validateMessage(
      trimmedMessage,
      trimmedUserName,
    );
     if (validateMessageError !== null) {
       connection.sendUTF(
         JSON.stringify({ type: "error", data: validateMessageError }),
       );
       return;
     }
     const newMessage = {
        id:nextMessageId++,
        username:trimmedUserName,
        message:trimmedMessage,
        createdAt: new Date().toISOString(),
     };
     messages.push(newMessage)

     const response = JSON.stringify({type:"message-added",data:newMessage});
     connections.forEach((client)=>{
        if(client.connected)
        {
            client.sendUTF(response)
        }
     })
  });
  connection.on("close", () => {
    const connectionIndex =connections.indexOf(connection);
    if(connectionIndex!==-1){
        connections.splice(connectionIndex,1);
    }
    console.log(`Websocket disconnected. Active connections:${connections.length}`)
});
});

server.listen(port, () => {
  console.error(`WebSocket chat server is listening on port :${port}`);
});
