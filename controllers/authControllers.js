const User = require(`${__dirname}/../models/userModel.js`);
const jwt = require('jsonwebtoken');
const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);

const JWTSecret = process.env.JWTSecret;
const JWTexpiresIn = process.env.JWTexpiresIn;

const signToken = (payloud) => {
  const token = jwt.sign(payloud, JWTSecret, {
    expiresIn: JWTexpiresIn
  });

  return token;
}

const createSendToken = (res, payloud) => {
  const token = signToken(payloud);
  res.cookie('jwt', token);

  res.status(200).json({
    status: 'success',
    data: {
      token
    }
  });
}

exports.getRegister = (req, res, next) => {
  res.render('register', {
    pageTitle: 'register'
  });
};

exports.postRegister = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  createSendToken(res, { id: user._id });
})

exports.getLogin = (req, res, next) => {
  res.render('login', {
    pageTitle: 'login'
  })
}

exports.postLogin = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      status: 'failed',
      message: 'please provide the user and the password'
    })
  }

  const user = await User.findOne({
    $or: [{ username }, { email: username }]
  });

  if (!user || !(await user.correctPassword(password))) {
    return res.status(400).json({
      pageTitle: 'login',
      message: 'the user or the password is incorrect'
    });
  }
  createSendToken(res, { id: user._id });
}

exports.isLoggedIn = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.redirect('/login');

  try {
    const payloud = await jwt.verify(token, JWTSecret);
    const user = await User.findById(payloud.id);
    const session = { user };

    req.session = session;
    req.user = user;

    return next();
  } catch (err) {
    return res.redirect('/login');
  }
}

exports.logOut = (req, res, next) => {
  res.cookie('jwt','', { maxAge:1 });
  res.redirect('/login');
}