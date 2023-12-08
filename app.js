const path = require('path');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
dotenv.config({
  path: `${__dirname}/config.env`
});

//Routes
const authRoutes = require(`${__dirname}/routes/authRoutes.js`);
const viewsRoutes = require(`${__dirname}/routes/viewsRoutes.js`);
const postsRoutes = require(`${__dirname}/routes/api/postsRoutes.js`);
const usersRoutes = require(`${__dirname}/routes/api/usersRoutes.js`);
const chatsRoutes = require(`${__dirname}/routes/api/chatsRoutes.js`);
const messagesRoutes = require(`${__dirname}/routes/api/messagesRoutes.js`);
const notificationsRoutes = require(`${__dirname}/routes/api/notificationsRoutes.js`);
const authAPIRoutes = require(`${__dirname}/routes/api/authRoutes.js`);
//userModel to update the current logged in User
const User = require(`${__dirname}/models/userModel.js`);


const DB = process.env.DATABASE;
//setting the view engine and the view folder
app.set('view engine', 'pug');
app.set('views', 'views');

//implementing cors
app.use(cors());
//request logger
app.use(morgan('dev'));
//serving static files
app.use(express.static(path.join(__dirname, 'public')));
//body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api', authAPIRoutes);
app.use(authRoutes);
app.use(viewsRoutes);

const errorHandler = require(`${__dirname}/controllers/errorHandler.js`);
app.use(errorHandler);

const PORT = process.env.PORT;
mongoose.connect(DB)
  .then(con => {
    console.log('connecting to the database is done');
  });

const server = app.listen(PORT, () => console.log('the server is listening on port ' + PORT));
const io = require('socket.io')(server, {
  pingTimeout: 60000
});

io.on('connection', socket => {
  socket.on("setup", user => {
    socket.join(user._id);
    socket.emit("connected");
  });

  socket.on('join room', room => {
    socket.join(room);
  });

  socket.on('typing', room => {
    socket.broadcast.to(room).emit('typing');
  });

  socket.on('stop typing', room => {
    socket.broadcast.to(room).emit('stop typing');
  });

  socket.on('notification recieved', room => {
    io.to(room).emit('notification recieved');
  });

  socket.on('message', message => {
    for (let user of message.chat.users) {
      if (user._id.toString() != message.sender._id.toString())
        io.to(user._id).emit('message', message);
    }
  });
})