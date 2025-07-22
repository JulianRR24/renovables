document.addEventListener('DOMContentLoaded', () => {
    const waterLevelDiv = document.getElementById('waterLevel');
    const openGateBtn = document.getElementById('openGateBtn');
    const closeGateBtn = document.getElementById('closeGateBtn');
    const gateStatusDiv = document.getElementById('gateStatus');
    const turbineDiv = document.getElementById('turbine');
    const powerBarDiv = document.getElementById('powerBar');
    const powerValueDiv = document.getElementById('powerValue');

    let waterLevel = 100; // Percentage, 100% is full
    let gateOpen = false;
    let powerOutput = 0; // Megawatts (MW)
    let gameInterval;
    let turbineSpinInterval;

    const MAX_POWER = 100; // Max MW output
    const WATER_CONSUMPTION_RATE = 0.5; // % per game tick when gate is open
    const POWER_GENERATION_RATE = 2; // MW per game tick when gate is open
    const GAME_TICK_RATE = 100; // Milliseconds for each update

    // --- Functions to update the game state and visuals ---

    function updateWaterLevel() {
        waterLevelDiv.style.height = `${waterLevel}%`;
    }

    function updateGateStatus() {
        gateStatusDiv.textContent = gateOpen ? 'Compuerta Abierta' : 'Compuerta Cerrada';
        openGateBtn.disabled = gateOpen;
        closeGateBtn.disabled = !gateOpen;
    }

    function updatePowerOutput() {
        powerBarDiv.style.height = `${(powerOutput / MAX_POWER) * 100}%`;
        powerValueDiv.textContent = `${powerOutput.toFixed(0)} MW`;
    }

    function startTurbineSpin() {
        if (!turbineSpinInterval) {
            let rotation = 0;
            turbineSpinInterval = setInterval(() => {
                rotation += 10; // Spin speed
                turbineDiv.style.transform = `rotate(${rotation}deg)`;
            }, 50); // Faster spin for visual effect
        }
    }

    function stopTurbineSpin() {
        clearInterval(turbineSpinInterval);
        turbineSpinInterval = null;
        turbineDiv.style.transform = `rotate(0deg)`; // Reset rotation
    }

    // --- Game Logic Loop ---
    function gameLoop() {
        if (gateOpen && waterLevel > 0) {
            // Decrease water level
            waterLevel = Math.max(0, waterLevel - WATER_CONSUMPTION_RATE);
            updateWaterLevel();

            // Generate power
            powerOutput = Math.min(MAX_POWER, powerOutput + POWER_GENERATION_RATE);
            updatePowerOutput();
            startTurbineSpin(); // Start/continue spinning turbine

        } else if (waterLevel <= 0) {
            // Reservoir is empty, close gate and stop power
            if (gateOpen) {
                gateOpen = false;
                updateGateStatus();
                console.log("¡El embalse se ha vaciado! Compuerta cerrada automáticamente.");
            }
            powerOutput = 0;
            updatePowerOutput();
            stopTurbineSpin();

        } else {
            // Gate is closed or no water, no power generation
            // Power should decay if gate closes while power is still high
            powerOutput = Math.max(0, powerOutput - (POWER_GENERATION_RATE / 4)); // Decay slower than generation
            updatePowerOutput();
            stopTurbineSpin(); // Stop turbine if no power
        }
    }

    // --- Event Listeners ---
    openGateBtn.addEventListener('click', () => {
        if (waterLevel > 0) {
            gateOpen = true;
            updateGateStatus();
            console.log("Compuerta abierta. El agua fluye.");
        } else {
            alert("¡No hay suficiente agua en el embalse para abrir la compuerta!");
        }
    });

    closeGateBtn.addEventListener('click', () => {
        gateOpen = false;
        updateGateStatus();
        console.log("Compuerta cerrada. El flujo de agua se detiene.");
    });

    // --- Initialization ---
    function initGame() {
        updateWaterLevel();
        updateGateStatus();
        updatePowerOutput();
        gameInterval = setInterval(gameLoop, GAME_TICK_RATE); // Start the game loop
    }

    initGame();
});