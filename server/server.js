const express = require('express');
const path = require('path');
const socketIO = require('socket.io');
const http = require('http');

const publicPath = path.join(__dirname, '../public');

const {isRealString} = require('./../utils/validation.js')
const {generateMessage, generateLocationMessage} = require('./../utils/message');
const {Users} = require('./../utils/users');

const PORT = process.env.PORT || 3000;

var app = express();

var server = http.createServer(app);

var io = socketIO(server);

var users = new Users();


io.on('connection', (socket) => {

    socket.on('join', (params, callback) => {
        if(!isRealString(params.name) || !isRealString(params.room)) {
            return callback('name and room are required');
        }
        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
        io.to(params.room).emit('updateUserList', users.getUserList(params.room) );
        socket.emit('newMessage', generateMessage('admin', 'welcome'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('admin', `${params.name} joined`));
        console.log(users);
        callback();
    });
    socket.on('createMessage', (message, callback) => {
        var user = users.getUser(socket.id);
        if(user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }
        callback();
    });
    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);
        if(user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });
    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
        }
    });
});

app.use(express.static(publicPath));


server.listen(3000, (err) => console.log(`server is up at ${PORT}`));

