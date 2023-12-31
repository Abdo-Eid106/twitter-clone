const User = require(`${__dirname}/../models/userModel.js`);
const jwt = require('jsonwebtoken');
const catchAsync = require(`${__dirname}/../utils/catchAsync.js`);
const AppError = require(`${__dirname}/../utils/AppError.js`);
const Email = require(`${__dirname}/../utils/Email.js`);

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
  await new Email(user).welcome();

  createSendToken(res, {
    id: user._id
  });
})

exports.getLogin = (req, res, next) => {
  res.render('login', {
    pageTitle: 'login'
  })
}

exports.postLogin = catchAsync(async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return next(new AppError('please provide the user and the password', 400));
  }

  const user = await User.findOne({
    $or: [{
      username
    }, {
      email: username
    }]
  });

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('the user or the password is incorrect', 401));
  }

  createSendToken(res, {
    id: user._id
  });
})

exports.isLoggedIn = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.redirect('/login');

  try {
    const payloud = await jwt.verify(token, JWTSecret);
    const user = await User.findById(payloud.id);
    req.user = user;

    return next();
  } catch (err) {
    return res.redirect('/login');
  }
}

exports.protect = catchAsync(async (req, res, next) => {
  let token = null;

  if (req.cookies.jwt)
    token = req.cookies.jwt;
  else if (req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')) 
    token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return next(new AppError('you are not logged In', 401));
  }

  const payloud = await jwt.verify(token, JWTSecret);
  const user = await User.findById(payloud.id);

  req.user = user;
  next();
})

exports.logOut = (req, res, next) => {
  res.cookie('jwt', '', {
    maxAge: 1
  });
  res.redirect('/login');
}