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

io.on("connection", function(socket) {
    console.log(socket.id);

    // welcome current user
    socket.emit('message', 'välkommen till gridpainter!');

    // Broadcast when a user connects
    socket.broadcast.emit('message', 'A user has joined the chat');

    socket.on('getUser', userName => {
      console.log(userName);
      socket.emit('getUser', userName);
    });

    // listen for chatmessage
    socket.on('chatMessage', (msg) => {
      io.emit('message', msg);
    });

    // Runs when client disconnects
    socket.on("disconnect", () => {
      io.emit('message', 'A user has left the chat');
    });
});

module.exports = {app: app, server: server};
