import Pusher from 'pusher-js';
import cloudinary from 'cloudinary';

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

    cloudinary.config({ 
        cloud_name: 'dffwgyy4x', 
        api_key: '525923916383224', 
        api_secret: 'MZmFjxW8W67YNnFxQNxq5s-f4R4' 
    });

    // Function to refresh map dropdown list
    function refreshMapList() {
        fetch("https://api.cloudinary.com/v1_1/dffwgyy4x/resources/image")
            .then(response => response.json())
            .then(data => {
                mapSelect.innerHTML = ""; // Clear current options
                data.resources.forEach(map => {
                    const option = document.createElement("option");
                    option.value = map.secure_url;
                    option.textContent = map.public_id;
                    mapSelect.appendChild(option);
                });
            })
            .catch(err => console.error("Error fetching maps:", err));
    }

    // Refresh map list on page load
    refreshMapList();

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

    // Upload map functionality
    uploadButton.addEventListener("click", () => {
        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "map_upload_preset");

            fetch("https://api.cloudinary.com/v1_1/dffwgyy4x/image/upload", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.secure_url) {
                    mapContainer.style.backgroundImage = `url(${data.secure_url})`;
                    mapContainer.style.backgroundSize = "cover";
                    refreshMapList(); // Refresh dropdown after upload
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
});
