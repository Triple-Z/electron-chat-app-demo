const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

exports.server = {
    run(port) {
        server.listen(port, () => {
            console.log('Server listening at port %d', port);
        });
    },
};

app.get('/', function(req, res) {
    res.type('html');
    res.send('<h1>Electron Chat Server by <a href="https://triplez.cn">TripleZ</a></h1>');
});

const users = new Set();

io.on('connection', function onConnection(socket) {
    let username;

    socket.on('message', function onMessage(data) {
        const text = data.text;
        io.sockets.emit('message', { username, text });
    });

    socket.on('login', function onLogin(data) {
        username = data.username;
        users.add(username);
        io.sockets.emit('login', { username, users: Array.from(users) });
    });

    socket.on('typing', function onTyping() {
        socket.broadcast.emit('typing', { username });
    });

    socket.on('stop-typing', function onStopTyping() {
        socket.broadcast.emit('stop-typing', { username });
    });

    socket.on('disconnect', function onDisconnect() {
        users.delete(username);
        socket.broadcast.emit('logout', { username, users: Array.from(users) });
    });
});