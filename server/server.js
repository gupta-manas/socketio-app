const path = require('path');
const express = require('express');
const port = process.env.PORT || 3000;
const socketIO = require('socket.io');
const http = require('http');
const publicPath = path.join(__dirname, '../public');

const { generateMessage, generateLocMsg } = require('./util/msg');
const { isRealString } = require('./util/validation');
const {Users} = require('./util/users');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users= new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected!');

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback("Name and room name are required!")
        }
		socket.join(params.room);
		
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);
		
		io.to(params.room).emit('updateUserList', users.getUserList(params.room));
		
		socket.emit('newMessage', {
			from: 'Admin',
			text: 'Welcome to the chat app',
			createdAt: new Date().getTime()
		});
		
		socket.broadcast.to(params.room).emit('newMessage', {
			from: 'Admin',
			text: `${params.name} has joined`,
			createdAt: new Date().getTime()
		});
        
		callback();
    });

    socket.on('disconnect', () => {
        var user= users.removeUser(socket.id);
		if(user){
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left!`));
		}
    });

    socket.on('createMessage', (newMessage, callback) => {
		var user= users.getUser(socket.id);
		
		if(user && isRealString(newMessage.text)){
			io.to(user.room).emit('newMessage', {
				from: user.name,
				text: newMessage.text,
				createdAt: new Date().getTime()
			});
		}
        
        callback();
    });

    socket.on('createLocationMessage', (coords) => {
		var user= users.getUser(socket.id);
		
		if(user){
			io.to(user.room).emit('newLocationMessage', generateLocMsg(user.name, coords.latitude, coords.longitude));
		}
        
    });
});
server.listen(port, () => {
    console.log(`server is up on port ${port}!`)
})