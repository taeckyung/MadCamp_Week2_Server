const express = require('express'),
http = require('http'),
app = express(),
server = http.createServer(app),
sio = require("socket.io"),
io = sio.listen(server);

const redis = require("redis"),
client = redis.createClient();

client.once('ready', () => {
    client.flushdb();
});


app.get('/', (req, res) => {
    res.send('Chat Server is running on port 680');
});


io.on('connection', (socket) => {
    console.log('User connected: '+socket.id);
    
    socket.on('NEW_GAME', () => {
        var randNum, randStr;
        do {
            randNum = Math.floor(Math.random(Date.now()) * 10000);
            randStr = randNum.toString();
        } while (client.exists(randStr) && randNum < 1000);
        
        console.log(randStr+": Player 1 created the game");
        
        client.hmset(randStr, 'player1', socket.id, 'player2', "null");
        client.set(socket.id, randStr);
        
        socket.emit('GAME_NUM', randStr);
    });
    
    socket.on('ENTER_GAME', (gameNum) => {
        var success = false;
        client.hgetall(gameNum, (err, obj) => {
            if (err || obj == null) {
                console.error(err);
            }
            else if (obj['player2'] == "null") {
                console.log(gameNum + ": Player 2 entered the game");
                obj['player2'] = socket.id;
                
                client.hmset(gameNum, obj);
                client.set(socket.id, gameNum);
                
                socket.emit('GAME_START', true);
                io.sockets.connected[obj['player1']].emit('GAME_START', true);
                success = true;
            }
        });
        
        if (!success) {
            socket.emit('GAME_START', false);
        }
    });
    
    socket.on('MOVE', (playerId, direction) => {
        client.get(socket.id, (err, reply) => {
            if (err) {
                console.error(err);
            }
            else {
                client.hgetall(reply, (err, obj) => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        console.log(reply + ": Player " + playerId + " is moving to direction " + direction);
                        var message = {"playerId": playerId, "direction": direction};
                        io.sockets.connected[obj['player1']].emit('MOVE', message);
                        io.sockets.connected[obj['player2']].emit('MOVE', message);
                    }
                });
            }
        });
    });
    
    socket.on('STOP', (playerId) => {
        client.get(socket.id, (err, reply) => {
            if (err) {
                console.error(err);
            }
            else {
                client.hgetall(reply, (err, obj) => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        console.log(reply + ": Player " + playerId + " stops");
                        var message = {"playerId": playerId};
                        io.sockets.connected[obj['player1']].emit('STOP', message);
                        io.sockets.connected[obj['player2']].emit('STOP', message);
                    }
                });
            }
        });
    });
    
    socket.on('JUMP', (playerId) => {
        client.get(socket.id, (err, reply) => {
            if (err) {
                console.error(err);
            }
            else {
                client.hgetall(reply, (err, obj) => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        console.log(reply + ": Player " + playerId + " is jumping");
                        var message = {"playerId": playerId};
                        io.sockets.connected[obj['player1']].emit('JUMP', message);
                        io.sockets.connected[obj['player2']].emit('JUMP', message);
                    }
                });
            }
        });
    });
    
    socket.on('FIRE', (playerId) => {
        client.get(socket.id, (err, reply) => {
            if (err) {
                console.error(err);
            }
            else {
                client.hgetall(reply, (err, obj) => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        console.log(reply + ": Player " + playerId + " fires");
                        var message = {"playerId": playerId};
                        io.sockets.connected[obj['player1']].emit('FIRE', message);
                        io.sockets.connected[obj['player2']].emit('FIRE', message);
                    }
                });
            }
        });
    });
    
    socket.on('disconnect', () => {
        console.log("User disconnected: "+socket.id);
        client.get(socket.id, (err, reply) => {
            if (err) {
                console.error(err);
            }
            else {
                if (reply != null && client.exists(reply)) {
                    console.log(reply + ": Game destroyed.");
                    client.del(reply);
                }
                client.del(socket.id);
            }
        });
    });
});


server.listen(80, () => {
    console.log('Node app is running on port 680');
});