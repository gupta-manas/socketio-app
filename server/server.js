const path = require('path');
const express = require('express');
const port = process.env.PORT || 3000;
const socketIO = require('socket.io');
const http = require('http');
const publicPath = path.join(__dirname, '../public');

const { generateMessage, generateLocMsg } = require('./util/msg');
const { isRealString } = require('./util/validation');
const { Users } = require('./util/users');

let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected!');

    socket.on('join', (params, callback) => {
        let joiningUserName = params.name;
        let existingUser = users.getUserList(params.room).filter((user) => user === joiningUserName);

        if (existingUser.length > 0) {
            return callback("Given user already exists in the room!");
        }
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback("Name and room name are required!")
        }
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));
        callback();
    });

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left!`));
        }
    });

    socket.on('createMessage', (newMessage, callback) => {
        let user = users.getUser(socket.id);
        if (user && isRealString(newMessage.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, newMessage.text));
        }
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        let user = users.getUser(socket.id);
        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocMsg(user.name, coords.latitude, coords.longitude));
        }
    });
});
server.listen(port, () => {
    console.log(`server is up on port ${port}!`);
});