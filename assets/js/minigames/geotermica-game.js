// Elementos del DOM
const subsurfaceTempEl = document.getElementById('subsurface-temp');
const waterInjectedEl = document.getElementById('water-injected');
const steamGeneratedEl = document.getElementById('steam-generated');
const energyProducedEl = document.getElementById('energy-produced');
const plantStatusEl = document.getElementById('plant-status');
const gameMessagesEl = document.getElementById('game-messages');

const tempBar = document.getElementById('temp-bar');
const waterBar = document.getElementById('water-bar');
const steamBar = document.getElementById('steam-bar');
const energyBar = document.getElementById('energy-bar');

const injectWaterBtn = document.getElementById('inject-water-btn');
const reduceWaterBtn = document.getElementById('reduce-water-btn');
const increasePressureBtn = document.getElementById('increase-pressure-btn');
const decreasePressureBtn = document.getElementById('decrease-pressure-btn');
const maintenanceBtn = document.getElementById('maintenance-btn');

// Variables del juego
let subsurfaceTemperature = 150; // °C
let waterInjectedRate = 0;     // L/s
let steamGenerationRate = 0;   // kg/s
let energyProduction = 0;      // MW
let pressure = 1;              // Factor de presión (1 = normal)
let plantOperational = true;
let maintenanceTimer = 0;
const MAX_WATER_INJECTED = 100; // L/s
const MIN_WATER_INJECTED = 0;
const MAX_TEMP = 300;
const MIN_TEMP = 100;
const MAX_ENERGY = 100;

// Función para actualizar la interfaz de usuario
function updateUI() {
    subsurfaceTempEl.textContent = `${subsurfaceTemperature.toFixed(0)}°C`;
    waterInjectedEl.textContent = `${waterInjectedRate.toFixed(0)} L/s`;
    steamGeneratedEl.textContent = `${steamGenerationRate.toFixed(1)} kg/s`;
    energyProducedEl.textContent = `${energyProduction.toFixed(1)} MW`;
    plantStatusEl.textContent = plantOperational ? "Operando" : "En Mantenimiento...";

    // Actualizar barras de progreso
    tempBar.style.width = `${((subsurfaceTemperature - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)) * 100}%`;
    waterBar.style.width = `${(waterInjectedRate / MAX_WATER_INJECTED) * 100}%`;
    steamBar.style.width = `${(steamGenerationRate / (MAX_WATER_INJECTED * 0.8)) * 100}%`; // Asumiendo un max de steam
    energyBar.style.width = `${(energyProduction / MAX_ENERGY) * 100}%`;
}

// Función para mostrar mensajes en el juego
function showMessage(message, type = 'info') {
    gameMessagesEl.textContent = message;
    gameMessagesEl.className = `messages ${type}`; // Para futuros estilos de mensajes (info, error, success)
    setTimeout(() => {
        gameMessagesEl.textContent = '';
        gameMessagesEl.className = 'messages';
    }, 5000); // El mensaje desaparece después de 5 segundos
}

// Lógica principal del juego (se ejecuta cada segundo)
function gameLoop() {
    if (!plantOperational) {
        maintenanceTimer--;
        if (maintenanceTimer <= 0) {
            plantOperational = true;
            plantStatusEl.textContent = "Operando";
            showMessage("¡Mantenimiento completado! La central está operativa de nuevo.", 'success');
            // Re-habilitar botones
            injectWaterBtn.disabled = false;
            reduceWaterBtn.disabled = false;
            increasePressureBtn.disabled = false;
            decreasePressureBtn.disabled = false;
            maintenanceBtn.disabled = false;
        } else {
            plantStatusEl.textContent = `En Mantenimiento... (${maintenanceTimer}s restantes)`;
            updateUI(); // Sigue actualizando el tiempo
            return; // No procesar producción si está en mantenimiento
        }
    }

    // Calcular generación de vapor: depende del agua inyectada y la temperatura
    // A mayor temperatura y agua, más vapor, pero hay límites y óptimos
    const tempFactor = (subsurfaceTemperature / 200); // Ejemplo de factor
    steamGenerationRate = waterInjectedRate * 0.8 * tempFactor * pressure;

    // Calcular producción de energía: depende del vapor
    energyProduction = steamGenerationRate * 0.5; // Factor de eficiencia

    // Simular el cambio de temperatura del subsuelo (el agua inyectada enfría)
    subsurfaceTemperature -= (waterInjectedRate * 0.05); // Enfría más con más agua
    subsurfaceTemperature = Math.max(MIN_TEMP, Math.min(MAX_TEMP, subsurfaceTemperature)); // Mantener dentro de límites

    // Pequeña recuperación de temperatura si no se inyecta agua
    if (waterInjectedRate === 0) {
        subsurfaceTemperature += 0.5;
    }

    // Asegurar que no haya valores negativos o demasiado altos
    waterInjectedRate = Math.max(MIN_WATER_INJECTED, Math.min(MAX_WATER_INJECTED, waterInjectedRate));
    steamGenerationRate = Math.max(0, steamGenerationRate);
    energyProduction = Math.max(0, Math.min(MAX_ENERGY, energyProduction)); // Limitar la energía máxima

    updateUI();
    checkGameConditions();
}

// Función para verificar condiciones del juego (ej. baja energía, alta temperatura)
function checkGameConditions() {
    if (energyProduction < 10 && waterInjectedRate > 0) {
        showMessage("¡Alerta! La producción de energía es muy baja. Considera ajustar la inyección de agua o la presión.", 'warning');
    }
    if (subsurfaceTemperature < 120 && waterInjectedRate > 50) {
        showMessage("El subsuelo se está enfriando demasiado rápido. Reduce la inyección de agua para permitir que se recupere el calor.", 'warning');
    }
    if (subsurfaceTemperature >= 280 && waterInjectedRate < 10) {
        showMessage("¡Cuidado! La temperatura del subsuelo es muy alta, lo que podría indicar sobrecalentamiento si no se inyecta suficiente agua.", 'warning');
    }
}

// Event Listeners para los botones
injectWaterBtn.addEventListener('click', () => {
    if (plantOperational) {
        waterInjectedRate += 10;
        showMessage(`Inyectando ${waterInjectedRate} L/s de agua.`);
        updateUI();
    }
});

reduceWaterBtn.addEventListener('click', () => {
    if (plantOperational) {
        waterInjectedRate -= 10;
        showMessage(`Reduciendo a ${waterInjectedRate} L/s de agua.`);
        updateUI();
    }
});

increasePressureBtn.addEventListener('click', () => {
    if (plantOperational) {
        pressure = Math.min(1.5, pressure + 0.1); // Máx 1.5
        showMessage(`Presión aumentada a x${pressure.toFixed(1)}. Esto puede aumentar la eficiencia de vapor.`);
        updateUI();
    }
});

decreasePressureBtn.addEventListener('click', () => {
    if (plantOperational) {
        pressure = Math.max(0.7, pressure - 0.1); // Mín 0.7
        showMessage(`Presión disminuida a x${pressure.toFixed(1)}. Esto puede reducir el estrés en el sistema.`);
        updateUI();
    }
});

maintenanceBtn.addEventListener('click', () => {
    if (plantOperational) {
        plantOperational = false;
        maintenanceTimer = 30; // 30 segundos de mantenimiento
        showMessage("Iniciando mantenimiento. La producción se detendrá temporalmente.", 'info');
        // Deshabilitar botones durante el mantenimiento
        injectWaterBtn.disabled = true;
        reduceWaterBtn.disabled = true;
        increasePressureBtn.disabled = true;
        decreasePressureBtn.disabled = true;
        maintenanceBtn.disabled = true;
        updateUI();
    }
});


// Iniciar el bucle del juego cada 1000 ms (1 segundo)
setInterval(gameLoop, 1000);

// Actualizar la UI al cargar por primera vez
updateUI();