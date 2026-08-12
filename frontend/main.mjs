const backend = "http://localhost:4000/"; 
let messages = [];

async function fetchMessages() {
  try {
    const response = await fetch(backend);               // sends the HTTP request get by default 
    if (!response.ok) {                                 
      throw new Error(`HTTP error: ${response.status}`);
    }
    messages = await response.json(); //reads the response body and parses JSON into JS value
    sortMessagesOldestFirst(messages);
    // function displayAllMessage(messages){}
  } catch (error) { 
    console.error("Failed to fetch messages: ", error)       // what is the error here ????
  }
}

function sortMessagesOldestFirst(messages) {
  return messages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}


fetchMessages();
