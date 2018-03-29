const path = require('path');
const express = require('express');
const port = process.env.PORT || 3000;
const socketIO = require('socket.io');
const http = require('http');
const publicPath = path.join(__dirname, '../public');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected!');

    socket.on('disconnect', () => {
        console.log('User was disconnected!');
    });
});
server.listen(port, () => {
    console.log(`server is up on port ${port}!`)
})