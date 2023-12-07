let lastType;
$(document).ready(async () => {
  socket.emit('join room', chatId);
  socket.on('typing', () => $(".typingDots").show());
  socket.on('stop typing', () => $(".typingDots").hide());
  
  try {
    let url = `http://localhost:3000/api/chats/${chatId}/messages`;
    let method = 'GET';

    const response = await axios({ url, method });
    const data = response.data.data.messages;

    const messages = [];
    let lastSenderId = "";
    data.forEach((message, index) => {
      const html = createMessageHtml(message, data[index + 1], lastSenderId);
      messages.push(html);
      lastSenderId = message.sender._id;
    })

    const messagesHtml = messages.join("");
    $(".chatMessages").append(messagesHtml);
    scrollToBottom(false);

    $(".loadingSpinnerContainer").remove();
    $(".chatContainer").css("visibility", "visible");

    url = `http://localhost:3000/api/chats/${chatId}/messages/markAsRead`;
    method = 'PATCH';
    await axios({ url, method });
    refreshMessageBadge();

  } catch (err) {
    if (err.response) alert(err.response.data);
    else alert('Something Went Wrong');
  }
})


$("#chatNameButton").click(async event => {
  const val = $("#chatNameTextbox").val().trim();
  try {
    const url = `http://localhost:3000/api/chats/${chatId}`;
    const method = 'PATCH';

    axios({ method, url, data: { chatName: val } });
    window.location.reload();
  } catch (err) {
    if (err.response) alert(err.response.data.message);
    else alert('Something went Wrong');
  }
})

$(".inputTextbox").keydown(event => {
  if (event.which == 13) {
    const content = $(".inputTextbox").val().trim();
    if (content) 
      sendMessage(content);
    return;
  }
  socket.emit('typing', chatId);

  lastType = Date.now();
  setTimeout(() => {
    if (Date.now() >= lastType + 1500) 
      socket.emit('stop typing', chatId);
  }, 1500);
});

$(".sendMessageButton").click(event => {
  const content = $(".inputTextbox").val().trim();
  if (content) 
    sendMessage(content);
})

const sendMessage = async content => {
  try {
    const url = 'http://localhost:3000/api/messages';
    const method = 'POST';
    const data = { content, chat: chatId };

    const response = await axios({ url, method, data });
    socket.emit('stop typing');
    $(".inputTextbox").val("");

    const message = response.data.data.message;
    addMessage(message);
    socket.emit('message', message);

  } catch (err) {
    if (err.response) alert(err.response.data.message);
    else alert('Something went Wrong');
  }
}


