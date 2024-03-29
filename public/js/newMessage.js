const selectedUsers = [];
const container = $('.resultsContainer');
const createChatButton = $("#createChatButton");

$('#userSearchTextbox').keydown(async event => {
  clearTimeout(timer);
  const textbox = $(event.target);
  let val = textbox.val();

  if (val == "" && event.keyCode == 8) {
    selectedUsers.pop();
    updateSelectedUsersHtml();
    container.html("");

    if (selectedUsers.length == 0) {
      createChatButton.prop("disabled", true);
    }
    return;
  }

  timer = setTimeout(async () => {
    val = textbox.val();
    if (val == "") {
      container.html("");
      return;
    }
    try {
      const url = '/api/users';
      const method = 'GET';
      const params = {
        search: val
      };

      const response = await axios({
        url,
        method,
        params
      });

      const users = response.data.data.users;
      outputSelectableUsers(users, container);
    } catch (err) {
      if (err.response) alert(err.response.data.message);
      else alert("Something went wrong");
    }
  }, 1000);
});

let canCreate = true;
createChatButton.click(async event => {
  if (!canCreate) return;
  canCreate = false;

  try {
    const url = '/api/chats';
    const method = 'POST';
    const data = {
      users: selectedUsers
    };

    const response = await axios({
      url,
      method,
      data
    });
  
    window.location.href = '/messages';
  } catch (err) {
    canCreate = true;
    if (err.response) alert(err.reponse.data.message);
    else alert('Something went wrong');
  }
})