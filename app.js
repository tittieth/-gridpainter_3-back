const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors')
require("dotenv").config();

console.log(process.env.MONGODB_URI);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const conclusionsRouter = require('./routes/conclusions');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser } = require('./utils/users');

const app = express();
const server = require('http').Server(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://127.0.0.1:5502",
    methods: ["GET", "POST"]
    }
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

const db = mongoose.connection;

db.once('open', () => {
  console.log('Database connected');
});

db.on('error', err => {
  console.error('connection error:', err);
});

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/conclusions', conclusionsRouter);

const users = [];

const botName = 'ChatCord Bot';

io.on("connection", function(socket) {
    console.log(socket.id);

    socket.on('joinGame', ({data}) => {
      const user = (data);
      console.log(user);

      const lastUser = user[user.length - 1];

      socket.emit('message', formatMessage(botName, 'välkommen till gridpainter!'));

      // Broadcast when a user connects
      socket.broadcast.emit('message', formatMessage(botName, `${lastUser.userName} has joined the chat`));

      socket.on("disconnect", () => {
        // Find the user that disconnected
        const disconnectedUser = user.find(u => u.socketId === socket.id);
        console.log(disconnectedUser);
        if (disconnectedUser) {
          // You can access the disconnected user's information using disconnectedUser.userName or other properties
          io.emit('message', formatMessage(botName, `${disconnectedUser.userName} has left the chat`));
        }
      });
    });

    socket.on('getUser', (userName) => {
      console.log(userName);

      const user = {userName: userName, color: "red", socketId: socket.id};
      users.push(user);
  
      socket.emit('updateUsers', users);

      // welcome current user
      // socket.emit('message', formatMessage(botName, 'välkommen till gridpainter!'));

      // // Broadcast when a user connects
      // socket.broadcast.emit('message', formatMessage(botName, `${user.userName} has joined the chat`));

    });

    // socket.on("disconnect", function() {
    //   console.log("user disconnected");
    // });

    // socket.on('getUser', ({username, color}) => {
    //   const user = userJoin(socket.id, username, color);

    //   socket.emit('updateUsers', user);

    //   console.log(users);

    //     // welcome current user
    //   socket.emit('message', formatMessage(botName, 'välkommen till gridpainter!'));

    //   // Broadcast when a user connects
    //   socket.broadcast.emit('message', formatMessage(botName, `${user.username} has joined the chat`));
    // });

    // listen for chatmessage
    socket.on('chatMessage', (msg, data) => {
      console.log(data[0], msg);
      io.emit('message', formatMessage(data[0].userName, msg));
      console.log(users);
    });

    // socket.on('chatMessage', (msg) => {
    //   const user = getCurrentUser(socket.id);
    //   if (user) {
    //     io.emit('message', formatMessage(user.username, msg));
    //     console.log(socket.id);
    //   } else {
    //     // Handle case where user is not found
    //     console.error('User not found');
    //   }
    // });

    // Runs when client disconnects
    // socket.on("disconnect", () => {
    //   io.emit('message', formatMessage(botName, 'A user has left the chat'));
    // });
});

module.exports = {app: app, server: server};
