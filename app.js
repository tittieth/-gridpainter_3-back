const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config();

console.log(process.env.MONGODB_URI);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const conclusionsRouter = require('./routes/conclusions');

const app = express();
const server = require('http').Server(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
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
const colors = ['red', 'green', 'yellow', 'blue'];

let nextPlayer = 0;

io.on("connection", function(socket) {
    console.log(socket.id);

    socket.on('userEnter', (number, string) => {
      console.log(number, string);
    });

    socket.on('getUser', userName => {
      console.log(userName);
      if (users.length < 4) {
        const userColor = colors[nextPlayer];
        const user = {userName: userName, color: userColor, id: socket.id};
        nextPlayer++;
        users.push(user);
        io.emit('updateUsers', users);

      } else {
        io.emit('fullGame');
      }
    

    });

    // socket.on('users', (users) => {
    //   console.log(users);
    //   io.emit('users');
    // });

    socket.on("disconnect", function() {
      console.log("user disconnected");
    });


});    

module.exports = {app: app, server: server};