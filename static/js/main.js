document.addEventListener("DOMContentLoaded", () => {
    const socket = io();
    const mapContainer = document.getElementById("mapContainer");
    const fogLayer = document.getElementById("fogLayer");
    const fileInput = document.getElementById("mapUpload");
    const uploadButton = document.getElementById("uploadButton");

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
