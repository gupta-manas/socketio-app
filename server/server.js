const path = require('path');
const express = require('express');
const port = process.env.PORT || 3000;
const socketIO = require('socket.io');
const http = require('http');
const publicPath = path.join(__dirname, '../public');
const { generateMsg, generateLocMsg } = require('./util/msg');
const { isRealString } = require('./util/validation');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected!');

    socket.emit('newMessage', {
        from: 'Admin',
        text: 'Welcome to the chat app',
        createdAt: new Date().getTime()
    });

    socket.broadcast.emit('newMessage', {
        from: 'Admin',
        text: 'New user joined',
        createdAt: new Date().getTime()
    });

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            callback("Name and room name are required!")
        }

        callback();
    });

    socket.on('disconnect', () => {
        console.log('User was disconnected!');
    });

    socket.on('createMessage', (newMessage, callback) => {
        console.log(newMessage);
        io.emit('newMessage', {
            from: newMessage.from,
            text: newMessage.text,
            createdAt: new Date().getTime()
        });
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocMsg('Admin', coords.latitude, coords.longitude));
    });
});
server.listen(port, () => {
    console.log(`server is up on port ${port}!`)
})