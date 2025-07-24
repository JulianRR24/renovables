// Configuración del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const energyElement = document.getElementById('energyValue');
const levelElement = document.getElementById('levelValue');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
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
let score = 0;
let energy = 100;
let level = 1;
let gameSpeed = 1;
let isGameRunning = false;
let isGamePaused = false;
let animationId;
let items = [];
let bin;
let selectedItem = null;
let touchId = null;
let offsetX, offsetY;
let spawnRate = 100;
let framesSinceLastSpawn = 0;

// Tipos de materiales
const MATERIALS = [
    { type: 'organic', emoji: '🍎', name: 'Manzana', color: '#e74c3c', points: 10, energy: 5 },
    { type: 'organic', emoji: '🌽', name: 'Maíz', color: '#f1c40f', points: 15, energy: 7 },
    { type: 'organic', emoji: '🍌', name: 'Plátano', color: '#f39c12', points: 12, energy: 6 },
    { type: 'organic', emoji: '🥕', name: 'Zanahoria', color: '#e67e22', points: 8, energy: 4 },
    { type: 'plastic', emoji: '🥤', name: 'Botella', color: '#3498db', points: -5, energy: -10 },
    { type: 'metal', emoji: '🥫', name: 'Lata', color: '#95a5a6', points: -8, energy: -15 },
    { type: 'other', emoji: '🧱', name: 'Escombro', color: '#7f8c8d', points: -10, energy: -20 }
];

// Inicializar juego
function initGame() {
    score = 0;
    energy = 100;
    level = 1;
    gameSpeed = 1;
    items = [];
    framesSinceLastSpawn = 0;
    
    // Configurar contenedor de biomasa
    bin = {
        x: canvas.width / 2 - 50,
        y: canvas.height - 120,
        width: 100,
        height: 80,
        color: '#27ae60'
    };
    
    updateUI();
    draw();
}

// Actualizar la interfaz de usuario
function updateUI() {
    scoreElement.textContent = score;
    energyElement.textContent = Math.max(0, Math.floor(energy));
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
    
    // Dibujar fondo
    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar contenedor de biomasa
    ctx.fillStyle = bin.color;
    ctx.fillRect(bin.x, bin.y, bin.width, bin.height);
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 3;
    ctx.strokeRect(bin.x, bin.y, bin.width, bin.height);
    
    // Dibujar etiqueta del contenedor
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CONTENEDOR DE BIOMASA', canvas.width / 2, bin.y - 10);
    ctx.textAlign = 'left';
    
    // Dibujar barra de energía
    const energyBarWidth = canvas.width * 0.6;
    const energyFill = (Math.max(0, energy) / 100) * energyBarWidth;
    
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(canvas.width / 2 - energyBarWidth / 2, 20, energyBarWidth, 20);
    ctx.fillStyle = energy > 30 ? '#27ae60' : '#e74c3c';
    ctx.fillRect(canvas.width / 2 - energyBarWidth / 2, 20, energyFill, 20);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(canvas.width / 2 - energyBarWidth / 2, 20, energyBarWidth, 20);
    
    // Dibujar objetos
    items.forEach(item => {
        if (!item.caught) {
            // Sombra para efecto de elevación
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(item.x + 3, item.y + 3, 40, 40);
            
            // Objeto principal
            ctx.font = '40px Arial';
            ctx.fillStyle = '#000';
            ctx.fillText(item.emoji, item.x, item.y + 40);
            
            // Resaltar si está seleccionado
            if (item === selectedItem) {
                ctx.strokeStyle = '#f1c40f';
                ctx.lineWidth = 3;
                ctx.strokeRect(item.x - 5, item.y - 5, 50, 50);
            }
        }
    });
    
    // Mostrar mensaje de nivel
    if (framesSinceLastSpawn < 60) {
        ctx.fillStyle = '#1565c0';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Nivel ${level}`, canvas.width / 2, 70);
        ctx.textAlign = 'left';
    }
}

// Actualizar estado del juego
function update() {
    if (isGamePaused) return;
    
    framesSinceLastSpawn++;
    
    // Generar nuevos objetos
    if (framesSinceLastSpawn >= spawnRate / gameSpeed && Math.random() < 0.3) {
        spawnItem();
        framesSinceLastSpawn = 0;
    }
    
    // Mover objetos hacia abajo
    items.forEach(item => {
        if (!item.caught && item !== selectedItem) {
            item.y += 2 * gameSpeed;
            
            // Eliminar objetos que salen de la pantalla
            if (item.y > canvas.height + 50) {
                const index = items.indexOf(item);
                if (index !== -1) {
                    items.splice(index, 1);
                }
            }
        }
    });
    
    // Verificar si se terminó la energía
    if (energy <= 0) {
        endGame();
        return;
    }
    
    // Subir de nivel cada 100 puntos
    if (score >= level * 100) {
        levelUp();
    }
}

// Generar un nuevo objeto
function spawnItem() {
    const material = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
    const x = Math.random() * (canvas.width - 60) + 30;
    
    items.push({
        x: x,
        y: -50,
        width: 40,
        height: 40,
        emoji: material.emoji,
        type: material.type,
        name: material.name,
        points: material.points,
        energy: material.energy,
        caught: false
    });
}

// Subir de nivel
function levelUp() {
    level++;
    gameSpeed = 1 + (level * 0.2);
    spawnRate = Math.max(30, 100 - (level * 5));
    energy = Math.min(100, energy + 20); // Bonus de energía al subir de nivel
    
    // Mostrar mensaje de nivel
    framesSinceLastSpawn = 0;
    
    updateUI();
    showFeedback(`¡Nivel ${level}!`, canvas.width / 2, canvas.height / 2, '#1565c0');
}

// Finalizar el juego
function endGame() {
    isGameRunning = false;
    cancelAnimationFrame(animationId);
    
    finalScoreElement.textContent = score;
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

// Encontrar objeto en coordenadas
function getItemAt(x, y) {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (!item.caught && 
            x > item.x && x < item.x + item.width &&
            y > item.y && y < item.y + item.height) {
            return item;
        }
    }
    return null;
}

// Manejar inicio de arrastre
function startDrag(x, y) {
    selectedItem = getItemAt(x, y);
    if (selectedItem) {
        offsetX = x - selectedItem.x;
        offsetY = y - selectedItem.y;
        return true;
    }
    return false;
}

// Manejar movimiento durante arrastre
function moveDrag(x, y) {
    if (selectedItem) {
        selectedItem.x = x - offsetX;
        selectedItem.y = y - offsetY;
        
        // Limitar a los bordes del canvas
        selectedItem.x = Math.max(0, Math.min(canvas.width - selectedItem.width, selectedItem.x));
        selectedItem.y = Math.max(0, Math.min(canvas.height - selectedItem.height, selectedItem.y));
    }
}

// Manejar fin de arrastre
function endDrag() {
    if (selectedItem) {
        // Verificar si el objeto está sobre el contenedor
        if (selectedItem.x > bin.x && selectedItem.x < bin.x + bin.width &&
            selectedItem.y > bin.y && selectedItem.y < bin.y + bin.height) {
            
            // Actualizar puntuación y energía
            score += selectedItem.points;
            energy += selectedItem.energy;
            energy = Math.max(0, Math.min(100, energy));
            
            // Mostrar feedback visual
            const feedbackX = bin.x + bin.width / 2;
            const feedbackY = bin.y - 30;
            if (selectedItem.points > 0) {
                showFeedback(`+${selectedItem.points}`, feedbackX, feedbackY, '#27ae60');
            } else {
                showFeedback(selectedItem.points, feedbackX, feedbackY, '#e74c3c');
            }
            
            // Marcar como capturado
            selectedItem.caught = true;
            
            // Eliminar el objeto del array
            const index = items.indexOf(selectedItem);
            if (index !== -1) {
                items.splice(index, 1);
            }
            
            updateUI();
        }
        
        selectedItem = null;
    }
}

// Event listeners para mouse
canvas.addEventListener('mousedown', (e) => {
    if (!isGameRunning || isGamePaused) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    startDrag(x, y);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isGameRunning || isGamePaused || !selectedItem) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    moveDrag(x, y);
});

canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('mouseleave', endDrag);

// Event listeners para pantallas táctiles
canvas.addEventListener('touchstart', (e) => {
    if (!isGameRunning || isGamePaused) return;
    
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (startDrag(x, y)) {
        touchId = touch.identifier;
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    if (!isGameRunning || isGamePaused || !selectedItem) return;
    
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === touchId) {
            const rect = canvas.getBoundingClientRect();
            const x = e.touches[i].clientX - rect.left;
            const y = e.touches[i].clientY - rect.top;
            
            moveDrag(x, y);
            break;
        }
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    endDrag();
    touchId = null;
}, { passive: false });

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

// Inicializar el juego al cargar la página
window.addEventListener('load', () => {
    initGame();
    draw();
});