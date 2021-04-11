

const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null
// var gSocketBySessionIdMap = {}

function connectSockets(http, session) {
    gIo = require('socket.io')(http);

    const sharedSession = require('express-socket.io-session');

    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    gIo.on('connection', socket => {
        // gSocketBySessionIdMap[socket.handshake.sessionID] = socket

        socket.on('disconnect', socket => {
 
        })
        socket.on('board topic', topic => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
            socket.myTopic = topic
            

        })
        socket.on('board update', board => {
            gIo.to(socket.myTopic).emit('board updated', board)
            gIo.to(socket.myTopic).emit('add notification',board.activities[0])
        })
    })
}

function emit({ type, data }) {
    gIo.emit(type, data)
}

// TODO: Need to test emitToUser feature
function emitToUser({ type, data, userId }) {
    gIo.to(userId).emit(type, data)
}


// Send to all sockets BUT not the current socket 
function broadcast({ type, data }) {
    const store = asyncLocalStorage.getStore()
    const { sessionId } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map', gSocketBySessionIdMap)
    excludedSocket.broadcast.emit(type, data)
}


module.exports = {
    connectSockets,
    emit,
    broadcast
}



