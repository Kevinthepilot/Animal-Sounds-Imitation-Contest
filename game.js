import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";

kaboom({
    width: 640,
    height: 440,
    canvas: document.getElementById("game-canvas"),
    background: [15, 23, 42],
    debug: true
});

scene("main", () => {
    const levelMap = [
        "================",
        "=     =        =",
        "= === = ====== =",
        "= =   =      = =",
        "= = ====== = = =",
        "= =      = = = =",
        "= ====== = = = =",
        "=      =   =   =",
        "====== ===== ===",
        "=             e=",
        "================",
    ];

    const TILE_SIZE = 40;

    const levelConfig = {
        tileWidth: TILE_SIZE,
        tileHeight: TILE_SIZE,
        tiles: {
            "=": () => [
                rect(TILE_SIZE, TILE_SIZE),
                color(51, 65, 85),
                // Notice we removed body() and area() — we don't need physics collisions anymore!
            ],
            "e": () => [
                rect(TILE_SIZE, TILE_SIZE),
                color(255, 0, 0),
                area(),
                body(),
            ]
        }
    };

    addLevel(levelMap, levelConfig);

    // 1. Track the player's grid coordinates (starting at row 1, col 1)
    let playerGridX = 1;
    let playerGridY = 1;

    // 2. Make the player the exact size of a tile so they fit the grid perfectly
    const player = add([
        rect(TILE_SIZE, TILE_SIZE),
        color(52, 211, 153),
        pos(playerGridX * TILE_SIZE, playerGridY * TILE_SIZE),
        "player"
    ]);

    // 3. The movement logic: Check the array before allowing a jump
    function tryMove(deltaX, deltaY) {
        const nextX = playerGridX + deltaX;
        const nextY = playerGridY + deltaY;

        // Ensure we don't move outside the map array bounds
        if (nextY >= 0 && nextY < levelMap.length && nextX >= 0 && nextX < levelMap[0].length) {

            // Check if the intended destination is NOT a wall
            if (levelMap[nextY][nextX] !== "=") {
                // Update grid coordinates
                playerGridX = nextX;
                playerGridY = nextY;

                // Snap the player's visual position to the new grid coordinates
                player.pos = vec2(playerGridX * TILE_SIZE, playerGridY * TILE_SIZE);
            }
        }
    }

    // 4. Use onKeyPress instead of onKeyDown for discrete jumps
    onKeyPress("w", () => tryMove(0, -1));
    onKeyPress("s", () => tryMove(0, 1));
    onKeyPress("a", () => tryMove(-1, 0));
    onKeyPress("d", () => tryMove(1, 0));

    const voiceBtn = document.getElementById("voice-btn");
    const voiceStatus = document.getElementById("voice-status");

    const BACKEND_URL = "http://127.0.0.1:8000/api/scoring";
    let mediaRecorder;
    let audioChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            // Initialize the recorder
            mediaRecorder = new MediaRecorder(stream);

            // 2. Collect audio data as it's recorded
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            // 3. When the user lets go of the button, package and send the audio
            mediaRecorder.onstop = async () => {
                voiceBtn.innerText = "⏳ Processing...";
                voiceStatus.innerText = "Sending to AI backend...";

                // Create a single audio Blob (typically .webm or .ogg in browsers)
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                audioChunks = []; // Clear chunks for the next recording

                // Package it in FormData so the backend receives it like a file upload
                const formData = new FormData();
                formData.append("file", audioBlob, "audio.webm");
                formData.append("animal", "cat"); // Required Form parameter on backend

                try {
                    // Send to your backend
                    const response = await fetch(BACKEND_URL, {
                        method: "POST",
                        body: formData
                    });

                    const data = await response.json();
                    let command = (data.direction || data.animal || "").toLowerCase();

                    // Map predicted animal sounds to game directions
                    const animalToDirection = {
                        "cat": "up",
                        "dog": "down",
                        "bird": "left",
                        "cow": "right"
                    };
                    if (animalToDirection[command]) {
                        command = animalToDirection[command];
                    }

                    voiceStatus.innerText = `AI says: "${command}"`;

                    // Execute the move based on the AI's response
                    if (command === "up") tryMove(0, -1);
                    else if (command === "down") tryMove(0, 1);
                    else if (command === "left") tryMove(-1, 0);
                    else if (command === "right") tryMove(1, 0);

                } catch (error) {
                    console.error("Backend error:", error);
                    voiceStatus.innerText = "Error contacting backend. Check console.";
                }

                // Reset UI
                voiceBtn.classList.replace("bg-red-600", "bg-emerald-600");
                voiceBtn.innerText = "🎤 Hold to Speak";
            };
        })
        .catch(err => {
            // Handle denied microphone permissions
            voiceBtn.disabled = true;
            voiceBtn.classList.replace("bg-emerald-600", "bg-slate-600");
            voiceBtn.innerText = "❌ Mic Denied";
            voiceStatus.innerText = "Microphone access is required.";
            console.error("Mic error:", err);
        });


    const startRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "inactive") {
            mediaRecorder.start();
            voiceBtn.classList.replace("bg-emerald-600", "bg-red-600");
            voiceBtn.innerText = "🎙️ Recording...";
            voiceStatus.innerText = "Speak now...";
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop(); // This triggers the onstop event above
        }
    };

    // Mouse Events
    voiceBtn.addEventListener("mousedown", startRecording);
    voiceBtn.addEventListener("mouseup", stopRecording);
    voiceBtn.addEventListener("mouseleave", stopRecording); // Safety catch if mouse drags off button

    // Touch Events for mobile
    voiceBtn.addEventListener("touchstart", (e) => { e.preventDefault(); startRecording(); });
    voiceBtn.addEventListener("touchend", stopRecording);

});

go("main");



