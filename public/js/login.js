const login = async (username, password) => {
  try {
    const url = 'http://localhost:3000/api/login';
    const method = 'POST';
    const data = { username, password };

    const response = await axios({ url, method, data });
    window.location = 'http://localhost:3000/';
  } catch (err) {
    if (err.response)
      alert(err.response.data.message);
    else alert(err);
  }
}

const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async event => {
  event.preventDefault();

  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  login(email, password);
})