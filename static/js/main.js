import fs from 'fs';
import path from 'path';
import express from 'express';

const app = express();
const imgDir = path.join(__dirname, 'static', 'img');

// Endpoint to list available map images
app.get('/maps', (req, res) => {
    fs.readdir(imgDir, (err, files) => {
        if (err) {
            console.error("Error reading map directory:", err);
            return res.status(500).json({ error: "Failed to retrieve maps" });
        }
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        res.json(imageFiles);
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const socket = io();
    const mapContainer = document.getElementById("mapContainer");
    const fogLayer = document.getElementById("fogLayer");
    const fileInput = document.getElementById("mapUpload");
    const uploadButton = document.getElementById("uploadButton");
    const mapSelect = document.getElementById("mapSelect");
    const selectMapButton = document.getElementById("selectMapButton");

    // Fetch available maps from the server and populate the dropdown
    fetch("/maps")
        .then(response => response.json())
        .then(maps => {
            maps.forEach(map => {
                const option = document.createElement("option");
                option.value = `/static/img/${map}`;
                option.textContent = map;
                mapSelect.appendChild(option);
            });
        })
        .catch(err => console.error("Error fetching maps:", err));

    // Upload map functionality
    uploadButton.addEventListener("click", () => {
        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("mapImage", file);

            fetch("/upload", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.imagePath) {
                    mapContainer.style.backgroundImage = `url(${data.imagePath})`;
                    mapContainer.style.backgroundSize = "cover";
                }
            })
            .catch(err => console.error("Error uploading map image:", err));
        } else {
            console.error("No file selected");
        }
    });

    // Select map functionality
    selectMapButton.addEventListener("click", () => {
        const selectedMap = mapSelect.value;
        if (selectedMap) {
            mapContainer.style.backgroundImage = `url(${selectedMap})`;
            mapContainer.style.backgroundSize = "cover";
        }
    });

    socket.on("updateGame", (gameData) => {
        console.log("Game updated:", gameData);
    });

    // Server-side game logic
    const games = {};

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