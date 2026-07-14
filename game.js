import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";

kaboom({
    width: 640,
    height: 440,
    canvas: document.getElementById("game-canvas"),
    background: [15, 23, 42],
    debug: true
});

// --- NEW: Win Scene ---
scene("win", () => {
    // Draw winning text
    add([
        text("YOU ESCAPED!", { size: 48 }),
        pos(width() / 2, height() / 2 - 40),
        anchor("center"),
        color(250, 204, 21) // Yellow
    ]);

    add([
        text("Press Space to Try Again", { size: 24 }),
        pos(width() / 2, height() / 2 + 40),
        anchor("center"),
        color(255, 255, 255)
    ]);

    // Restart the main scene if they press Space
    onKeyPress("space", () => {
        go("main");
    });

    // Also allow tapping the canvas (for mobile)
    onClick(() => {
        go("main");
    });
});

scene("lose", () => {
    add([
        text("CAUGHT!", { size: 64 }),
        pos(width() / 2, height() / 2 - 40),
        anchor("center"),
        color(239, 68, 68) // Red
    ]);
    add([
        text("Press Space to Restart", { size: 24 }),
        pos(width() / 2, height() / 2 + 40),
        anchor("center")
    ]);
    onKeyPress("space", () => go("main"));
    onClick(() => go("main"));
});

scene("main", () => {
    const levelMap1 = [
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
    const levelMap2 = [
        "================",
        "=              =",
        "= ============ =",
        "= =          = =",
        "= = ======== = =",
        "= = =      = = =",
        "= = = ==== = = =",
        "= =   =    =   =",
        "= ===== ==== ===",
        "=             e=",
        "================",
    ];
    const levelMap3 = [
        "================",
        "=   =   =      =",
        "= = = = = ==== =",
        "= = = = = =  = =",
        "= =   = = =  = =",
        "= ===== = == = =",
        "= =          = =",
        "= = === ==== = =",
        "= =   =      = =",
        "=   =   =     e=",
        "================",
    ];
    const choices = [levelMap1, levelMap2, levelMap3]
    const levelMap = choices[randi(0, 3)]

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
                "goal"
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

    loadSprite("enemyImage", "assets/enemy.png");
    const enemySpawnPoints = [
        { x: 14, y: 9 }, // Bottom right
        { x: 1, y: 9 },  // Bottom left
        { x: 14, y: 1 }  // Top right (near the goal)
    ];

    const enemies = enemySpawnPoints.map(spawn => {
        return {
            gridX: spawn.x,
            gridY: spawn.y,
            sprite: add([
                sprite("enemyImage", { width: TILE_SIZE, height: TILE_SIZE }),
                pos(spawn.x * TILE_SIZE, spawn.y * TILE_SIZE),
            ])
        };
    });

    function checkEntityCollisions() {
        // Loop through every enemy in the array
        for (const enemy of enemies) {
            if (playerGridX === enemy.gridX && playerGridY === enemy.gridY) {
                go("lose");
            }
        }
    }

    // --- ENEMY PATHFINDING (BFS) ---
    function getNextEnemyStep(startX, startY, targetX, targetY) {
        const queue = [{ x: startX, y: startY, path: [] }];
        const visited = new Set([`${startX},${startY}`]);
        const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];

        while (queue.length > 0) {
            const current = queue.shift();

            if (current.x === targetX && current.y === targetY) return current.path[0];

            for (const d of dirs) {
                const nx = current.x + d.x;
                const ny = current.y + d.y;

                if (ny >= 0 && ny < levelMap.length && nx >= 0 && nx < levelMap[0].length) {
                    if (levelMap[ny][nx] !== "=" && !visited.has(`${nx},${ny}`)) {
                        visited.add(`${nx},${ny}`);
                        queue.push({
                            x: nx, y: ny,
                            path: [...current.path, { x: nx, y: ny }]
                        });
                    }
                }
            }
        }
        return null;
    }

    // --- ENEMY AI LOOP ---
    loop(2, () => {
        // Run the pathfinding for every enemy independently
        for (const enemy of enemies) {
            const nextStep = getNextEnemyStep(enemy.gridX, enemy.gridY, playerGridX, playerGridY);

            if (nextStep) {
                enemy.gridX = nextStep.x;
                enemy.gridY = nextStep.y;
                enemy.sprite.pos = vec2(enemy.gridX * TILE_SIZE, enemy.gridY * TILE_SIZE);
            }
        }

        // Check if any enemy stepped on the player during this tick
        checkEntityCollisions();
    });

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
            if (levelMap[nextY][nextX] === "e") {
                // Give it a tiny delay so the player sees themselves land on the goal
                wait(0.2, () => {
                    go("win"); // Switch scenes!
                });
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

    let recognizer;

    // Load TensorFlow.js Speech Commands Model (Teachable Machine wrapper)
    async function initModel() {
        const modelUrl = "https://teachablemachine.withgoogle.com/models/A_Odm4k96/";
        const checkpointURL = modelUrl + "model.json";
        const metadataURL = modelUrl + "metadata.json";

        try {
            if (!modelUrl.includes("YOUR_MODEL_ID")) {
                recognizer = speechCommands.create(
                    "BROWSER_FFT",
                    undefined,
                    checkpointURL,
                    metadataURL
                );
            } else {
                // Use default pre-trained Google model (recognizes "up", "down", "left", "right")
                recognizer = speechCommands.create("BROWSER_FFT");
            }
            await recognizer.ensureModelLoaded();
            voiceStatus.innerText = "AI đã tải xong! Bật mic để điều khiển rảnh tay.";
        } catch (e) {
            console.error("Error loading model, falling back to default:", e);
            recognizer = speechCommands.create("BROWSER_FFT");
            await recognizer.ensureModelLoaded();
            voiceStatus.innerText = "Lỗi tải model, sử dụng AI mặc định. Bật mic để điều khiển.";
        }
    }

    // Call model initialization on page load
    initModel();

    let isListening = false;

    async function toggleListening() {
        try {
            if (!recognizer) {
                voiceStatus.innerText = "Đang tải mô hình AI...";
                await initModel();
            }

            if (isListening) {
                // Stop listening
                if (recognizer.isListening()) {
                    recognizer.stopListening();
                }
                isListening = false;
                voiceBtn.classList.replace("bg-red-600", "bg-emerald-600");
                voiceBtn.innerText = "🎤 Bật Mic (Rảnh Tay)";
                voiceStatus.innerText = "Đã tắt Mic.";
            } else {
                // Start listening
                voiceBtn.classList.replace("bg-emerald-600", "bg-red-600");
                voiceBtn.innerText = "🎙️ Mic: ĐANG BẬT";
                voiceStatus.innerText = "Đang lắng nghe: cat, dog, duck, cow...";
                isListening = true;

                recognizer.listen(result => {
                    const classLabels = recognizer.wordLabels(); // ["background noise", "unknown", ...]

                    // Get label with highest probability
                    let maxScore = -1;
                    let highestLabel = "";
                    for (let i = 0; i < classLabels.length; i++) {
                        if (result.scores[i] > maxScore) {
                            maxScore = result.scores[i];
                            highestLabel = classLabels[i];
                        }
                    }

                    // If prediction probability is high, execute movement
                    if (maxScore > 0.5) {
                        const command = highestLabel.toLowerCase();
                        voiceStatus.innerText = `AI nghe: "${command}" (${Math.round(maxScore * 100)}%)`;

                        if (command === "cat") tryMove(0, -1);
                        else if (command === "dog") tryMove(0, 1);
                        else if (command === "duck") tryMove(-1, 0);
                        else if (command === "cow") tryMove(1, 0);
                    }
                }, {
                    includeSpectrogram: false,
                    probabilityThreshold: 0.5,
                    overlapFactor: 0.50,
                    invokeCallbackOnNoiseAndBackground: false
                });
            }
        } catch (err) {
            voiceBtn.disabled = true;
            voiceBtn.classList.replace("bg-emerald-600", "bg-slate-600");
            voiceBtn.innerText = "❌ Lỗi Mic";
            voiceStatus.innerText = "Không thể khởi động Microphone. Cần cấp quyền.";
            console.error("Microphone or recognition error:", err);
            isListening = false;
        }
    }

    // Toggle listening on click/touch
    voiceBtn.addEventListener("click", toggleListening);

});

go("main");


