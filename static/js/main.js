document.addEventListener("DOMContentLoaded", () => {
    const pusherClient = new window.Pusher("1f0e7b10485527772cd5", {
        cluster: "us3"
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

    // Create and append the PAGE 3 button
    const page3Button = document.createElement("button");
    page3Button.textContent = "PAGE 3";
    page3Button.style.marginTop = "10px";
    page3Button.addEventListener("click", () => {
        window.location.href = "Page3.html"; // Redirect to Page3.html
    });
    document.body.appendChild(page3Button);

    // Create and append the Open Media Library button
    const openMediaLibraryButton = document.createElement("button");
    openMediaLibraryButton.textContent = "Open Media Library";
    openMediaLibraryButton.style.marginLeft = "10px";
    openMediaLibraryButton.addEventListener("click", () => {
        cloudinaryML.show(); // Opens the Cloudinary Media Library
    });
    selectMapButton.parentNode.insertBefore(openMediaLibraryButton, selectMapButton.nextSibling);

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
                    
                    // Check if the file is already in the dropdown
                    let exists = false;
                    for (let i = 0; i < mapSelect.options.length; i++) {
                        if (mapSelect.options[i].value === selectedFile) {
                            exists = true;
                            break;
                        }
                    }
                    
                    // Only add new entries to avoid duplicates
                    if (!exists) {
                        const option = document.createElement("option");
                        option.value = selectedFile;
                        option.textContent = selectedFile.split("/").pop();
                        mapSelect.appendChild(option);
                    }
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
            formData.append("upload_preset", "your_actual_upload_preset");

            fetch("https://api.cloudinary.com/v1_1/dffwgyy4x/image/upload", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.secure_url) {
                    console.log("Upload successful:", data.secure_url);
                    mapContainer.style.backgroundImage = `url(${data.secure_url})`;
                    mapContainer.style.backgroundSize = "cover";

                    // Add the uploaded map to the dropdown
                    const option = document.createElement("option");
                    option.value = data.secure_url;
                    option.textContent = data.secure_url.split("/").pop();
                    mapSelect.appendChild(option);
                } else {
                    console.error("Upload failed:", data);
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
