$("#searchBox").keyup(async event => {
  clearTimeout(timer);
  const target = $(event.target);
  const val = target.val();
  const users = target.data().search == 'users';

  const container = $(".resultsContainer");
  if (val == "") {
    return container.html("");
  }

  timer = setTimeout(async () => {
    try {
      const url = `/api/${users ? 'users' : 'posts'}`;
      const method = 'GET';
      const params = {
        search: val
      };

      const response = await axios({
        url,
        method,
        params
      });

      if (users) outputUsers(response.data.data.users, container);
      else outputPosts(response.data.data.posts, container);
    } catch (err) {
      if (err.response) return alert(err.response.data);
      alert("Something Went Wrong");
    }
  }, 500)
})