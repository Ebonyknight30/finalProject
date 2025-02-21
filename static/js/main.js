import fs from 'fs';
import path from 'path';
import express from 'express';
import multer from 'multer';

const app = express();
const imgDir = path.join(__dirname, 'static', 'img');

// Set up multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imgDir); // Save to ./static/img/
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Keep original filename
    }
});

const upload = multer({ storage });

// Endpoint to handle image uploads
app.post('/upload', upload.single('mapImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ imagePath: `/static/img/${req.file.filename}` });
});

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
    const addPlayerButton = document.createElement("button");
    addPlayerButton.textContent = "Add Player Token";
    document.body.insertBefore(addPlayerButton, mapContainer);

    addPlayerButton.addEventListener("click", () => {
        const playerToken = document.createElement("div");
        playerToken.classList.add("player");
        playerToken.style.position = "absolute";
        playerToken.style.width = "20px";
        playerToken.style.height = "20px";
        playerToken.style.backgroundColor = "blue";
        playerToken.style.borderRadius = "50%";
        playerToken.style.top = "50%";
        playerToken.style.left = "50%";
        playerToken.draggable = true;
        
        playerToken.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", "dragging");
        });
        
        playerToken.addEventListener("dragend", (event) => {
            playerToken.style.left = `${event.clientX - mapContainer.offsetLeft}px`;
            playerToken.style.top = `${event.clientY - mapContainer.offsetTop}px`;
        });
        
        mapContainer.appendChild(playerToken);
    });

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
