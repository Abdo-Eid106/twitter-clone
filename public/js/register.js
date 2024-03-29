const form = document.getElementById('registerForm');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const passwordConfirm = document.getElementById('passwordConfirm');

const register = async (data) => {
  try {
    const url = '/api/register';
    const method = 'POST';

    const response = await axios({
      url,
      method,
      data
    });
    window.location = '/';
  } catch (err) {
    if (err.response)
      alert(err.response.data.message);
    else alert(err);
  }
}

let canRegister = true;
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!canRegister) return;
  canRegister = false;

  const data = {};
  data.firstName = firstName.value;
  data.lastName = lastName.value;
  data.username = username.value;
  data.email = email.value;
  data.password = password.value;
  data.passwordConfirm = passwordConfirm.value;
  await register(data);
  canRegister = true;
})