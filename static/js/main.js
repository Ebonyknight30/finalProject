// Sample Project Structure for a DnD Map Site

// Import necessary libraries
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Store active games and player positions
let games = {};

io.on('connection', (socket) => {
    console.log('A player connected');

    socket.on('joinGame', ({ gameId, playerId }) => {
        if (!games[gameId]) {
            games[gameId] = { players: {}, fog: [] };
        }
        games[gameId].players[playerId] = { x: 0, y: 0 };
        socket.join(gameId);
        io.to(gameId).emit('updateGame', games[gameId]);
    });

    socket.on('movePlayer', ({ gameId, playerId, x, y }) => {
        if (games[gameId] && games[gameId].players[playerId]) {
            games[gameId].players[playerId] = { x, y };
            io.to(gameId).emit('updateGame', games[gameId]);
        }
    });

    socket.on('updateFog', ({ gameId, fogData }) => {
        if (games[gameId]) {
            games[gameId].fog = fogData;
            io.to(gameId).emit('updateGame', games[gameId]);
        }
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
