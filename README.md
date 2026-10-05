# Real-Time Chat Application

A shared chat room built with **JavaScript, Node.js and WebSockets**, with live messages, message history and reactions.

I built this project during my training at **CodeYourFuture** to understand how a browser and server exchange messages, and how updates reach other users without refreshing the page. The repository includes a WebSocket implementation and an earlier HTTP long-polling implementation.
[Try the live demo] [Live Demo](https://ahmadhm-chat-application.trainees.hosting.cyf.academy/)

## Features

- **Live messaging:** new messages are broadcast to all connected clients.
- **Message history:** newly connected clients receive messages held by the running server.
- **Live reactions:** like and dislike counts update across connected clients.
- **Usernames and timestamps:** each message displays its author and creation time.
- **Input validation:** the browser and server check usernames and messages after trimming whitespace.
- **Connection-aware sending:** the send button is enabled when the WebSocket connection opens and disabled when it closes.

## Technology

| Area | Tools |
| --- | --- |
| Frontend | HTML, CSS, JavaScript modules, browser WebSocket API |
| Backend | Node.js, Express, `websocket`, CORS |
| Communication | WebSockets and an earlier HTTP long-polling version |
| Deployment  | Coolify,Docker |
| Data storage | In-memory arrays |

## How it works

The browser opens a persistent WebSocket connection using the `chat-protocol` subprotocol. The server sends the current message history when a client connects.

When a user submits a message, the server validates it, assigns an ID and timestamp, stores it in memory and broadcasts it to connected clients. Reactions follow the same pattern: the server finds the message, updates its counters and broadcasts the new counts.

| Direction | Event | Purpose |
| --- | --- | --- |
| Client → server | `newMessage` | Submit a username and message |
| Client → server | `reaction` | Submit a message ID and a `like` or `dislike` action |
| Server → client | `message-history` | Send the current history on connection |
| Server → sender | `message-sent` | Confirm an accepted message |
| Server → all clients | `message-added` | Deliver a new message |
| Server → all clients | `updatedMessage` | Update reaction counts |
| Server → client | `error` | Report a validation or message-processing error |

## Run locally

You need Node.js with npm, Git and a static HTTP server. The example below uses Python 3 to serve the frontend.

### 1. Clone the repository and install dependencies

```bash
git clone https://github.com/AhmadHmedann/Chat-application.git
cd Chat-application/backend
npm ci
```

### 2. Point the frontend at your local backend

In `frontend/websocket.mjs`, change `websocketURL` to:

```js
const websocketURL = "ws://localhost:4000/";
```

The checked-in value points to a hosted backend. This change makes the frontend connect to the server you run locally.

### 3. Start the WebSocket server

From `backend/`:

```bash
node websocket-server.mjs
```

The backend listens on port **4000**.

### 4. Serve the frontend

In another terminal, from the repository root:

```bash
python3 -m http.server 5500 --directory frontend
```

Open **http://localhost:5500/**. The frontend is served separately; the backend does not serve the HTML or CSS.

### 5. Try it with two users

1. Open the page in two browser tabs.
2. Enter a different username in each tab.
3. Send a message and watch it appear in both tabs without refreshing.
4. Click a reaction and check that its count updates in both tabs.
5. Open a third tab to see the history from the running server.

Usernames must contain **2–100 characters** and messages **1–500 characters**, after trimming whitespace.

## Run the backend with Docker

From the repository root:

```bash
docker build -t chat-backend ./backend
docker run --rm -p 4000:4000 chat-backend
```

Use the local WebSocket URL and serve the frontend as described above. The Docker image runs only the WebSocket backend. Stop any other server using port 4000 before starting the container.

For an HTTPS-hosted frontend, use a secure `wss://` backend URL and configure the hosting proxy to support WebSocket connections.

## Earlier long-polling implementation

`backend/polling-server.mjs` and `frontend/main.mjs` contain the HTTP long-polling version:

- `GET /` returns the current message history.
- `GET /?since=<ISO timestamp>` returns newer messages or holds the request open until a new message arrives.
- `POST /` accepts a JSON object containing `username` and `message`.
- After receiving an update, the client sends another request.

The polling server also uses port 4000, so it must run separately from the WebSocket server:

```bash
cd backend
node polling-server.mjs
```

The associated page is `frontend/longPolling.html`. **This older page currently needs a template fix:** its message template has no reaction buttons, but the shared `MessageCard` renderer assumes those buttons exist. Rendering a message can therefore fail. The main WebSocket page includes the expected buttons.

## Project structure

| File | Responsibility |
| --- | --- |
| `frontend/index.html` | WebSocket chat page and message template |
| `frontend/websocket.mjs` | Connection, incoming events, submissions and reactions |
| `frontend/shared.mjs` | Message rendering, sorting, duplicate checks and validation |
| `frontend/style.css` | Chat interface styling |
| `frontend/longPolling.html` | Earlier long-polling page |
| `frontend/main.mjs` | HTTP submissions and long-polling requests |
| `backend/websocket-server.mjs` | Connections, message history and broadcasts |
| `backend/polling-server.mjs` | HTTP endpoints and pending requests |
| `backend/shared.mjs` | Server-side message validation |
| `backend/Dockerfile` | WebSocket backend container |

## What I learned

- How long polling and WebSockets deliver updates differently: repeated HTTP requests versus a persistent, two-way connection.
- How to use event types to distinguish message history, new messages, reactions and errors.
- How to keep multiple browser clients updated through server broadcasts.
- Why validation belongs on the server as well as in the browser.
- How event delegation handles clicks on dynamically created reaction buttons.
- How to package a Node.js backend in a Docker image.

## Current limitations and next steps

This is a learning project with a single shared room.

- **No persistent storage:** messages and reactions disappear when the server restarts.
- **No accounts:** usernames are entered freely and do not verify identity.
- **Repeatable reactions:** a user can react to the same message more than once.
- **No automatic WebSocket reconnection:** reload the page after a dropped connection.
- **Further hardening needed:** stricter event-payload validation, origin restrictions, rate limiting and long-polling timeout/cleanup handling.
- **No automated test suite yet:** useful next tests would cover validation, broadcasts and reaction updates.

Possible next steps include database persistence, connection recovery and repairing the earlier polling page.
