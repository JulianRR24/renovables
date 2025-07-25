// Configuración del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const energyElement = document.getElementById('energyValue');
const tempDiffElement = document.getElementById('tempDiffValue');
const levelElement = document.getElementById('levelValue');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalEnergyElement = document.getElementById('finalEnergy');
const finalLevelElement = document.getElementById('finalLevel');

// Ajustar canvas al tamaño de pantalla
function resizeCanvas() {
    const maxWidth = Math.min(700, window.innerWidth - 40);
    const ratio = 500 / 700;
    canvas.width = maxWidth;
    canvas.height = maxWidth * ratio;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Variables del juego
let energy = 0;
let tempDiff = 20;
let level = 1;
let gameSpeed = 1;
let isGameRunning = false;
let isGamePaused = false;
let animationId;
let plant;
let coldWaterValve = 0.5;
let warmWaterValve = 0.5;
let efficiency = 1;
let heatWaves = [];
let coldCurrents = [];
let frames = 0;

// Inicializar juego
function initGame() {
    energy = 0;
    tempDiff = 20;
    level = 1;
    gameSpeed = 1;
    efficiency = 1;
    coldWaterValve = 0.5;
    warmWaterValve = 0.5;
    heatWaves = [];
    coldCurrents = [];
    frames = 0;
    
    // Configurar planta OTEC
    plant = {
        x: canvas.width / 2 - 60,
        y: canvas.height / 2 - 40,
        width: 120,
        height: 80,
        temp: 25,
        maxTemp: 50,
        minTemp: 0
    };
    
    updateUI();
    draw();
}

// Actualizar la interfaz de usuario
function updateUI() {
    energyElement.textContent = Math.floor(energy);
    tempDiffElement.textContent = Math.floor(tempDiff * 10) / 10;
    levelElement.textContent = level;
}

// Mostrar feedback visual
function showFeedback(text, x, y, color) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.textContent = text;
    feedback.style.color = color;
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 1000);
}

// Dibujar elementos del juego
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar fondo oceánico
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#3498db');  // Superficie cálida
    gradient.addColorStop(1, '#1a237e');  // Profundidad fría
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar tuberías
    drawPipe(canvas.width * 0.25, 0, canvas.width * 0.25, canvas.height, 30, '#81d4fa');  // Agua fría
    drawPipe(canvas.width * 0.75, 0, canvas.width * 0.75, canvas.height, 30, '#ef5350');  // Agua caliente
    
    // Dibujar válvulas
    drawValve(canvas.width * 0.25, canvas.height * 0.7, 40, coldWaterValve, '#81d4fa', 'FRÍA');
    drawValve(canvas.width * 0.75, canvas.height * 0.7, 40, warmWaterValve, '#ef5350', 'CÁLIDA');
    
    // Dibujar planta OTEC
    ctx.fillStyle = tempToColor(plant.temp);
    ctx.fillRect(plant.x, plant.y, plant.width, plant.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(plant.x, plant.y, plant.width, plant.height);
    
    // Dibujar turbina
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(plant.x + plant.width / 2, plant.y + plant.height / 2, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Dibujar aspas de turbina
    ctx.fillStyle = '#555';
    for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(plant.x + plant.width / 2, plant.y + plant.height / 2);
        ctx.rotate(i * Math.PI / 2 + frames * 0.02 * efficiency);
        ctx.fillRect(0, -5, 40, 10);
        ctx.restore();
    }
    
    // Dibujar indicador de temperatura
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(plant.temp)}°C`, plant.x + plant.width / 2, plant.y + plant.height + 20);
    
    // Dibujar eventos térmicos
    heatWaves.forEach(wave => {
        ctx.fillStyle = `rgba(239, 83, 80, ${wave.opacity})`;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    
    coldCurrents.forEach(current => {
        ctx.fillStyle = `rgba(129, 212, 250, ${current.opacity})`;
        ctx.beginPath();
        ctx.arc(current.x, current.y, current.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Dibujar eficiencia
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Eficiencia: ${Math.floor(efficiency * 100)}%`, 20, 30);
    
    // Dibujar controles
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('↑ Más frío', canvas.width * 0.25, canvas.height - 20);
    ctx.fillText('↓ Más calor', canvas.width * 0.75, canvas.height - 20);
}

// Dibujar tubería
function drawPipe(x1, y1, x2, y2, width, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Dibujar válvula
function drawValve(x, y, size, openness, color, label) {
    // Base de la válvula
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
    
    // Indicador de apertura
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size * Math.cos(Math.PI * (1 - openness)), y - size * Math.sin(Math.PI * (1 - openness)));
    ctx.lineTo(x + size * Math.cos(Math.PI * (1 - openness) + 0.2), y - size * Math.sin(Math.PI * (1 - openness) + 0.2));
    ctx.closePath();
    ctx.fill();
    
    // Etiqueta
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + size + 15);
}

// Convertir temperatura a color
function tempToColor(temp) {
    const normalized = (temp - plant.minTemp) / (plant.maxTemp - plant.minTemp);
    const r = Math.floor(255 * normalized);
    const b = Math.floor(255 * (1 - normalized));
    return `rgb(${r}, 100, ${b})`;
}

// Actualizar estado del juego
function update() {
    if (isGamePaused) return;
    
    frames++;
    
    // Calcular diferencia de temperatura (efecto de las válvulas)
    tempDiff = 10 + (warmWaterValve * 20) - (coldWaterValve * 10);
    
    // Actualizar temperatura de la planta
    const tempChange = (warmWaterValve * 0.2 - coldWaterValve * 0.15) * gameSpeed;
    plant.temp += tempChange;
    
    // Efectos de eventos térmicos
    heatWaves.forEach(wave => {
        if (Math.abs(wave.x - (plant.x + plant.width/2)) < 50 && 
            Math.abs(wave.y - (plant.y + plant.height/2)) < 50) {
            plant.temp += 0.1 * gameSpeed;
        }
        wave.radius += 0.5 * gameSpeed;
        wave.opacity -= 0.01 * gameSpeed;
    });
    
    coldCurrents.forEach(current => {
        if (Math.abs(current.x - (plant.x + plant.width/2)) < 50 && 
            Math.abs(current.y - (plant.y + plant.height/2)) < 50) {
            plant.temp -= 0.1 * gameSpeed;
        }
        current.radius += 0.5 * gameSpeed;
        current.opacity -= 0.01 * gameSpeed;
    });
    
    // Eliminar eventos térmicos terminados
    heatWaves = heatWaves.filter(wave => wave.opacity > 0);
    coldCurrents = coldCurrents.filter(current => current.opacity > 0);
    
    // Generar eventos térmicos aleatorios
    if (Math.random() < 0.005 * gameSpeed) {
        heatWaves.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.6,
            radius: 10,
            opacity: 0.7
        });
    }
    
    if (Math.random() < 0.005 * gameSpeed) {
        coldCurrents.push({
            x: Math.random() * canvas.width,
            y: canvas.height * 0.4 + Math.random() * canvas.height * 0.6,
            radius: 10,
            opacity: 0.7
        });
    }
    
    // Calcular eficiencia
    if (tempDiff >= 20 && tempDiff <= 25) {
        efficiency = 1;
    } else if (tempDiff > 25) {
        efficiency = 1 - (tempDiff - 25) * 0.05;
    } else {
        efficiency = 1 - (20 - tempDiff) * 0.05;
    }
    efficiency = Math.max(0, Math.min(1, efficiency));
    
    // Generar energía
    if (plant.temp > 15 && plant.temp < 30) {
        energy += (0.1 * efficiency * gameSpeed);
    }
    
    // Verificar condiciones de fallo
    if (plant.temp >= 30 || plant.temp <= 15 || tempDiff < 15) {
        efficiency *= 0.95;  // Reducir eficiencia por condiciones adversas
        
        if (plant.temp >= 35 || plant.temp <= 10 || tempDiff < 10) {
            endGame();
            return;
        }
    }
    
    // Subir de nivel cada 100 MW
    if (energy >= level * 100) {
        levelUp();
    }
    
    updateUI();
}

// Subir de nivel
function levelUp() {
    level++;
    gameSpeed = 1 + (level * 0.1);
    
    // Mostrar mensaje de nivel
    showFeedback(`¡Nivel ${level}!`, canvas.width / 2, canvas.height / 2, '#2ecc71');
}

// Finalizar el juego
function endGame() {
    isGameRunning = false;
    cancelAnimationFrame(animationId);
    
    finalEnergyElement.textContent = Math.floor(energy);
    finalLevelElement.textContent = level - 1;
    gameOverScreen.style.display = 'flex';
}

// Bucle principal del juego
function gameLoop() {
    update();
    draw();
    
    if (isGameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Manejar controles de teclado
document.addEventListener('keydown', (e) => {
    if (!isGameRunning || isGamePaused) return;
    
    switch(e.key) {
        case 'ArrowUp':
            coldWaterValve = Math.min(1, coldWaterValve + 0.05);
            break;
        case 'ArrowDown':
            coldWaterValve = Math.max(0, coldWaterValve - 0.05);
            break;
        case 'ArrowLeft':
            warmWaterValve = Math.max(0, warmWaterValve - 0.05);
            break;
        case 'ArrowRight':
            warmWaterValve = Math.min(1, warmWaterValve + 0.05);
            break;
    }
});

// Botones de control
startBtn.addEventListener('click', () => {
    if (!isGameRunning) {
        initGame();
        isGameRunning = true;
        isGamePaused = false;
        startBtn.textContent = 'Reiniciar';
        pauseBtn.disabled = false;
        gameLoop();
    } else {
        initGame();
    }
});

pauseBtn.addEventListener('click', () => {
    isGamePaused = !isGamePaused;
    pauseBtn.textContent = isGamePaused ? 'Continuar' : 'Pausa';
    
    if (!isGamePaused && isGameRunning) {
        gameLoop();
    }
});

restartBtn.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    initGame();
    isGameRunning = true;
    isGamePaused = false;
    pauseBtn.textContent = 'Pausa';
    gameLoop();
});

// Controles táctiles para válvulas
canvas.addEventListener('touchstart', (e) => {
    if (!isGameRunning || isGamePaused) return;
    
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Válvula fría (izquierda)
    if (x < canvas.width / 2 && y > canvas.height * 0.6) {
        coldWaterValve = Math.min(1, coldWaterValve + 0.1);
    }
    // Válvula caliente (derecha)
    else if (x >= canvas.width / 2 && y > canvas.height * 0.6) {
        warmWaterValve = Math.min(1, warmWaterValve + 0.1);
    }
}, { passive: false });

// Inicializar el juego al cargar la página
window.addEventListener('load', () => {
    initGame();
    draw();
});