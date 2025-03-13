import Pusher from 'pusher-js';

document.addEventListener("DOMContentLoaded", () => {
    const pusherClient = new Pusher("YOUR_KEY", {
        cluster: "YOUR_CLUSTER"
    });
    
    const channel = pusherClient.subscribe("map-channel");
    channel.bind("map-updated", (data) => {
        mapContainer.style.backgroundImage = `url(${data.imageUrl})`;
        mapContainer.style.backgroundSize = "cover";
    });

    const mapContainer = document.getElementById("mapContainer");
    const fileInput = document.getElementById("mapUpload");
    const uploadButton = document.getElementById("uploadButton");
    const mapSelect = document.getElementById("mapSelect");
    const selectMapButton = document.getElementById("selectMapButton");
    const addPlayerButton = document.getElementById("addPlayerTokenButton");

    // Cloudinary Media Library Widget
    const cloudinaryML = cloudinary.createMediaLibrary(
        {
            cloud_name: "dffwgyy4x",
            api_key: "525923916383224",
            multiple: false,
        },
        {
            insertHandler: function (data) {
                if (data.assets.length > 0) {
                    const selectedFile = data.assets[0].secure_url;
                    mapSelect.innerHTML = ""; // Clear dropdown
                    const option = document.createElement("option");
                    option.value = selectedFile;
                    option.textContent = selectedFile.split("/").pop();
                    mapSelect.appendChild(option);
                }
            },
        },
        document.getElementById("selectMapButton") // Opens media library when clicked
    );

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

    uploadButton.addEventListener("click", () => {
        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "YOUR_UPLOAD_PRESET");

            fetch("https://api.cloudinary.com/v1_1/dffwgyy4x/image/upload", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.secure_url) {
                    mapContainer.style.backgroundImage = `url(${data.secure_url})`;
                    mapContainer.style.backgroundSize = "cover";
                }
            })
            .catch(err => console.error("Error uploading map image:", err));
        } else {
            console.error("No file selected");
        }
    });

    selectMapButton.addEventListener("click", () => {
        const selectedMap = mapSelect.value;
        if (selectedMap) {
            mapContainer.style.backgroundImage = `url(${selectedMap})`;
            mapContainer.style.backgroundSize = "cover";
        }
    });
});
