const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config();
const formatMessage = require('./utils/messages');
// const formatMessage = require('messages');

console.log(process.env.MONGODB_URI);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const conclusionsRouter = require('./routes/conclusions');


const app = express();
const server = require('http').Server(app);

const ConclusionModel = require('./models/conclusion-model');

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

let users = [];
const colors = ['#27f591', '#1be7fa', '#FCE38A', '#F38181'];
const botName = 'ChatCord Bot';

let nextPlayer = 0;


const closeServer = () => {
  io.disconnectSockets();
  console.log("Nedkopplade");
};

let randomImage;


io.on("connection", function(socket) {
    //console.log(socket.id);

  
    socket.on('getUser', (userName) => {
      console.log(userName);
      if (users.length < 4) {
        const userColor = colors[nextPlayer];
        const user = {userName: userName, color: userColor, id: socket.id};
        nextPlayer++;
        users.push(user);
        io.emit('updateUsers', users);
        //socket.emit('usersJoined', users);
        // callback(true);       
      } else {
        console.log('full server');
        // callback(false);
        // socket.emit('fullGame');
      }
      
        socket.on("cancelGame", () => {
          socket.broadcast.emit("redirect");
          closeServer();
          users.length = 0;
          nextPlayer = 0;
          //console.log("users: " + nextPlayer);
        });
      });


    

    socket.on('startGameBtn', (data) => {
      // Kollar så att det är 4 användare 
      if (data.length === 4) {
        // aktiverar då startknappen
      io.emit('activateGameBtn');
      }
    });


    socket.on('startGame', async (data) => {

     io.emit('startGame', data);

     if (!randomImage) {

      const conclusionArray = await ConclusionModel.find();
      const randomIndex = Math.floor(Math.random() * conclusionArray.length);
      randomImage = conclusionArray[randomIndex];
    }
    io.emit('image', randomImage);

    });

    socket.on('joinGame', ({data}) => {
      const user = (data);
      //console.log(user);

      //const lastUser = user[user.length - 1];

      socket.emit('message', formatMessage(botName, 'välkommen till gridpainter!'));

      // Broadcast when a user connects
      //socket.broadcast.emit('message', formatMessage(botName, `${lastUser.userName} har anslutit till spelet`));

      io.emit('gameUsers', data);

      socket.on("disconnect", () => {
        // Find the user that disconnected
        const disconnectedUser = user.find(u => u.id === socket.id);
        //console.log('user left game' + disconnectedUser.userName);

        if (disconnectedUser) {
          // const disconnectedUserIndex = user.findIndex(u => u.id === socket.id);
          // const newUserArray = user.splice(disconnectedUserIndex, 1)[0];
          // console.log('lämnat' + newUserArray.userName);
          const users = user.filter(u => u.id !== socket.id);
          //console.log(users);
          io.emit('message', formatMessage(botName, `${disconnectedUser.userName} har lämnat spelet`));
          io.emit('gameUsers', users);
        }
      });
    });


    socket.on('paint', (data) => {
      io.emit('paint', (data));
      
    });

    //socket for conclusion picture to db
    socket.on("grid-data", async (data) => {
      //console.log("Received grid data:");
      //console.log(data);
      //send painted picture to db
      await ConclusionModel.create(data);
    });

    socket.on('result', (similarityPercentage) => {
      io.emit('result', similarityPercentage);
    });

    socket.on('chatMessage', (msg, username) => {
      //console.log('msg' + msg + username);
      io.emit('message', formatMessage(username, msg));
    });

    socket.on("disconnect", function() {
    //   console.log("user disconnected");
          const disconnectedUser = users.find(u => u.id === socket.id);

          if(disconnectedUser) {
            const userIndex = users.indexOf(disconnectedUser);
            users.splice(userIndex, 1);
            
            console.log(users);
          }
          io.emit('updateUsers', (users));
     });

});    

module.exports = {app: app, server: server};