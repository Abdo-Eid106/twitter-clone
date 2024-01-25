$(document).ready(async () => {
  try {
    const url = `/api/chats`;
    const method = 'GET';
    const response = await axios({ url, method });
    
    const chats = response.data.data.chats;
    for (const chat of chats)
      $('.resultsContainer').append(createChat(chat));
  } catch (err) {
    if (err.response) alert(err.response.data.message);
    else alert(err);
  }
});