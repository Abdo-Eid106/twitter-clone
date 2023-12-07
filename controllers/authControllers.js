const User = require(`${__dirname}/../models/userModel.js`);

exports.getRegister = (req, res, next) => {
  res.render('register', {
    pageTitle: 'register'
  })
};

exports.postRegister = async (req, res, next) => {
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const username = req.body.username.trim();
  const email = req.body.email.trim();

  if (!firstName || !lastName || !username || !email) {
    const errorMessage = 'Make sure each field has a valid value';
    req.body.errorMessage = errorMessage;
    return res.render('register', req.body);
  }
  let user = await User.findOne({
    $or: [{
      username
    }, {
      email
    }]
  });

  if (user) {
    const errorMessage = 'the username and the email should be unique';
    req.body.errorMessage = errorMessage;
    return res.render('register', req.body);
  }
  user = await User.create(req.body);
  res.redirect('/login');
}

exports.getLogin = (req, res, next) => {
  res.render('login', {
    pageTitle: 'login'
  })
}

exports.postLogin = async (req, res, next) => {
  const logUsername = req.body.logUsername;
  const password = req.body.logPassword;

  if (!logUsername || !password) {
    res.render('login', {
      pageTitle: 'login',
      errorMessage: 'please provide the user and the password'
    })
  }

  const user = await User.findOne({
    $or: [{
      username: logUsername
    }, {
      email: logUsername
    }]
  });

  if (!user || !(await user.correctPassword(password))) {
    return res.render('login', {
      pageTitle: 'login',
      errorMessage: 'the user or the password is incorrect'
    })
  }

  req.session.user = user;
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) return next();
  res.redirect('/login');
}

exports.logOut = (req, res, next) => {
  req.session.destroy();
  res.redirect('/login');
}