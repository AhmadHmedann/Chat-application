const backend = "http://localhost:4000/";
let messages = [];

async function fetchMessages() {
  try {
    const response = await fetch(backend); // sends the HTTP request get by default
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    messages = await response.json(); //reads the response body and parses JSON into JS value
    sortMessagesOldestFirst(messages);
    renderMessages(messages);
  } catch (error) {
    console.error("Failed to fetch messages: ", error); // what is the error here ????
  }
}

function sortMessagesOldestFirst(messages) {
  return messages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}
function MessageCard({ id, username, message, createdAt }) {
  const template = document.getElementById("show-message-template");
  const card = template.content.cloneNode(true);
  //   const root = card.firstElementChild;
  //         root.id = String(id)

  const usernameEle = card.querySelector(".message-username");
  usernameEle.textContent = username;

  const messageEle = card.querySelector(".message-content");
  messageEle.textContent = message;

  const timeEle = card.querySelector(".message-created-time");
  timeEle.textContent = new Date(createdAt).toLocaleString();
  timeEle.dateTime = createdAt;

  return card;
}

function renderMessages(messages) {
  const rootEle = document.getElementById("messages-root");
  rootEle.textContent = "";
  if (messages.length === 0) {
    rootEle.textContent = "There are no messages to display :(";
    return;
  }
  messages.forEach((message) => {
    const card = MessageCard(message);
    rootEle.append(card);
  });
}
const formFeedbackMessage = document.getElementById("form-feedback");
const formElm = document.getElementById("message-form");
formElm.addEventListener("submit", handleSubmit);

function validateMessage(trimmedUsername, trimmedMessage) {
  if (trimmedUsername.length === 0) {
    return "The username cannot be empty or contain only spaces.";
  }
  if (trimmedMessage.length === 0) {
    return "The message cannot be empty or contain only spaces.";
  }
  if (trimmedMessage.length < 1 || trimmedMessage.length > 500)
    return "Message must be between 1 and 500 characters.";

  if (trimmedUsername.length < 2 || trimmedUsername.length > 100)
    return "Username must be between 2 and 100 characters.";

  return null;
}
async function handleSubmit(event) {
  //provent default  and clear feedback message read the values and trim validation
  //if invalid (display validtion error add class error inside catch  and return to stop)
  //crate message Object   and convert to JSON
  //post request fetch the backend recieve status
  event.preventDefault();
  formFeedbackMessage.textContent = "";
  const username = document.getElementById("username-input").value.trim();
  const message = document.getElementById("message-input").value.trim();
  const validateMessageError = validateMessage(username, message);
  if (validateMessageError !== null) {
    formFeedbackMessage.textContent = validateMessageError;
    formFeedbackMessage.className = "error";
    return;
  }
  const messageObj = {
    username: username,
    message: message,
  };
  const messageJSON = JSON.stringify(messageObj);
  try {
    const response = await fetch(backend, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: messageJSON,
    });
    if (!response.ok) {
      const responseMessage = await response.text();
      throw new Error(responseMessage || `HTTP error; ${response.status}`);
    }
    const result = await response.json(); //I will receive a new message object I will display it later
    formFeedbackMessage.textContent = "Message sent successfully.";
    formFeedbackMessage.className = "success";
    formElm.reset();
  } catch (error) {
    formFeedbackMessage.textContent =
      error.message || "Failed to send the message. Please try again.";
    formFeedbackMessage.className = "error";
    console.error("failed to send message:", error);
  }
}

fetchMessages();
