import express from "express";
import cors from "cors";
import { buffer } from "node:stream/consumers";
const app = express();
app.use(cors());
const port = 4000;

const messages = [];
let nextMessageId = 1;
app.get("/", (req, res) => {
  res.json(messages);
});

function validateBody(body) {
  if (
    typeof body != "object" ||
    body === null ||
    Array.isArray(body) ||
    !("message" in body) ||
    !("username" in body)
  ) {
    return "Expected body to be a JSON object containing keys message and username.";
  }
  if (typeof body.message !== "string" || typeof body.username !== "string")
    return "Message and username must be strings.";

  return null;
}
function validateMessage(trimmedMessage, trimmedUsername) {
  if (trimmedMessage.length < 1 || trimmedMessage.length > 500)
    return "Message must be between 1 and 500 characters.";

  if (trimmedUsername.length < 2 || trimmedUsername.length > 100)
    return "Username must be between 2 and 100 characters.";

  return null;
}

app.post("/", (req, res) => {
  const bodyChunks = [];
  req.on("data", (chunk) => bodyBytes.push(chunk));
  req.on("end", () => {
    const bodyString = buffer.concat(bodyChunks).toString("utf8")
    let body;
    try {
      body = JSON.parse(bodyString);
    } catch (error) {
      res.status(400).send("Expected body to be JSON.");
      return;
    }
    const validateBodyError = validateBody(body);
    if (validateBodyError !== null) {
      res.status(400).send(validateBodyError);
      return;
    }

    const message = body.message.trim();
    const username = body.username.trim();
    const validateMessageError = validateMessage(message, username);
    if (validateMessageError !== null) {
      res.status(400).send(validateMessageError);
      return;
    }
    const newMessage = {
      id: nextMessageId++,
      message: message,
      username: username,
      createdAt:new Date().toISOString(),
    };
    messages.push(newMessage);
    res.status(201).json(newMessage); 
  });
});

app.listen(port, () => {
  console.error(`Chat server listening on port ${port}`);
});
