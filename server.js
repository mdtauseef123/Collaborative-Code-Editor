const express = require('express');
const {Server} = require('socket.io');
const app = express();
const htttp = require('http');
const ACTIONS = require('./src/Action');

const server = htttp.createServer(app);
const io = new Server(server);


const userSocketMap = {}; //For mapping socket-id and username
function getAllConnectedClients(roomId) {
    
    // Arrays.from will convert Map to Array 
    // And if there is not any client then just return empty[] array
    // It will return socketId in single iteration
    // Basically it will return array of objects
    //Type if Map of --------------v
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}


// Whenver a socket/client is connected to our server then the following method 
// will got triggered
io.on('connection', (socket)=>{
    console.log('A new user is connected with Socket ID:-', socket.id);

    // Getting the request sent by the user/client/socket
    // Now we will store the username and socketId mapping to know which user belongs to which socket-id in our server
    socket.on(ACTIONS.JOIN, ({roomId, username}) => {
        userSocketMap[socket.id] = username; // Mapping of socket-id and username
        socket.join(roomId); // Now the current user will join the current roomId
        //Name of the room will be roomId only

        // The main reason for doing this to show the toast message that this user is joined
        const clients = getAllConnectedClients(roomId); //getting all the clients which are connected to this roomId

        clients.forEach(({socketId}) => {
            // kis socketId ko notify karna hai
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients, // all the users belongs to that socketId
                username,// current user who wants to join
                socketId: socket.id
            })
        })
    });


    //For changes in the code
    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
        //io.to(roomId).emit(ACTIONS.CODE_CHANGE, {code});
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // For Auto-Syncing the code.
    socket.on(ACTIONS.SYNC_CODE, ({socketId, code}) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });


    //For disconnecting
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms]; //Since we have to convert this in array that's why we use spread operator
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    })
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));