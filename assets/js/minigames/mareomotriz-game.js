// Configuración del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const timeElement = document.getElementById('timeValue');
const startBtn = document.getElementById('startBtn');

// Variables del juego
let score = 0;
let timeLeft = 60;
let gameInterval;
let bubbles = [];
let isGameRunning = false;
let animationId;
let lastTime = 0;
const bubbleImages = [];

// Ajustar canvas al tamaño de pantalla
function resizeCanvas() {
    const maxWidth = Math.min(500, window.innerWidth - 40);
    const ratio = 400 / 500;
    canvas.width = maxWidth;
    canvas.height = maxWidth * ratio;
}

// Cargar imágenes de burbujas
function loadBubbleImages() {
    const colors = ['#00ffff', '#00ffaa', '#ff00ff', '#ffff00', '#ff7700'];
    const sizes = [15, 25, 35, 45];
    
    sizes.forEach(size => {
        colors.forEach(color => {
            const canvas = document.createElement('canvas');
            canvas.width = size * 2;
            canvas.height = size * 2;
            const ctx = canvas.getContext('2d');
            
            // Crear burbuja con gradiente
            const gradient = ctx.createRadialGradient(
                size, size, size * 0.3,
                size, size, size * 0.8
            );
            gradient.addColorStop(0, 'rgba(255,255,255,0.8)');
            gradient.addColorStop(0.7, color);
            gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(size, size, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Añadir destello
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.beginPath();
            ctx.arc(size * 0.6, size * 0.6, size * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            bubbleImages.push({
                image: canvas,
                size: size,
                color: color,
                points: size * 2
            });
        });
    });
}

resizeCanvas();
loadBubbleImages();
window.addEventListener('resize', resizeCanvas);

// Clase para las burbujas de energía mejoradas
class Bubble {
    constructor() {
        const randomBubble = bubbleImages[Math.floor(Math.random() * bubbleImages.length)];
        this.image = randomBubble.image;
        this.size = randomBubble.size;
        this.points = randomBubble.points;
        this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
        this.y = canvas.height + this.size;
        this.speed = Math.random() * 2 + 1;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.pulseScale = 1;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
    }
    
    update() {
        this.y -= this.speed;
        this.angle += this.rotationSpeed;
        this.pulseScale = 1 + Math.sin(Date.now() * this.pulseSpeed) * 0.1;
        return this.y + this.size < 0;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.scale(this.pulseScale, this.pulseScale);
        ctx.drawImage(this.image, -this.size, -this.size);
        ctx.restore();
        
        // Efecto de estela
        ctx.fillStyle = `rgba(0, 200, 255, 0.3)`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.size * 0.7, 
                    this.size * 0.8, this.size * 0.3, 
                    0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    isClicked(x, y) {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= this.size;
    }
}

// Inicializar juego
function initGame() {
    score = 0;
    timeLeft = 60;
    bubbles = [];
    updateUI();
    draw();
}

// Actualizar la interfaz
function updateUI() {
    scoreElement.textContent = score;
    timeElement.textContent = timeLeft;
}

// Dibujar elementos del juego
function draw() {
    // Fondo con gradiente animado
    const now = Date.now();
    const waveOffset = Math.sin(now * 0.001) * 20;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `hsl(${200 + waveOffset}, 100%, 50%)`);
    gradient.addColorStop(0.5, `hsl(${220 + waveOffset}, 100%, 40%)`);
    gradient.addColorStop(1, `hsl(${240 + waveOffset}, 100%, 30%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
   
    const sunlight = ctx.createRadialGradient(
        canvas.width * 0.7, -canvas.height * 0.3, 0,
        canvas.width * 0.7, -canvas.height * 0.3, canvas.width * 1.5
    );
    sunlight.addColorStop(0, 'rgba(255,255,255,0.15)');
    sunlight.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = sunlight;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
   
    bubbles.forEach(bubble => bubble.draw());
    
  
    ctx.fillStyle = '#2e8b57';
    for (let i = 0; i < 5; i++) {
        const x = (canvas.width / 5) * i + 20;
        ctx.beginPath();
        ctx.moveTo(x, canvas.height);
        ctx.bezierCurveTo(
            x + 30, canvas.height - 100,
            x - 30, canvas.height - 150,
            x, canvas.height - 60
        );
        ctx.bezierCurveTo(
            x + 20, canvas.height - 180,
            x - 20, canvas.height - 200,
            x, canvas.height - 80
        );
        ctx.fill();
    }
    
    // Efecto de partículas
    if (isGameRunning) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 5; i++) {
            const size = Math.random() * 3 + 1;
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                size, 0, Math.PI * 2
            );
            ctx.fill();
        }
    }
}

// Actualizar estado del juego
function update(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
   
    if (Math.random() < 0.05) {
        bubbles.push(new Bubble());
    }
    
    
    bubbles = bubbles.filter(bubble => !bubble.update());
    
    draw();
    animationId = requestAnimationFrame(update);
}

// Manejar clic/touch en las burbujas
function handleClick(x, y) {
    if (!isGameRunning) return;
    
    for (let i = bubbles.length - 1; i >= 0; i--) {
        if (bubbles[i].isClicked(x, y)) {
        
            score += bubbles[i].points;
            bubbles.splice(i, 1);
            updateUI();
            
           
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let j = 0; j < 10; j++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 30;
                ctx.beginPath();
                ctx.arc(
                    x + Math.cos(angle) * distance,
                    y + Math.sin(angle) * distance,
                    Math.random() * 4 + 2,
                    0, Math.PI * 2
                );
                ctx.fill();
            }
            return;
        }
    }
}

// Iniciar el juego
function startGame() {
    if (isGameRunning) return;
    
    initGame();
    isGameRunning = true;
    startBtn.disabled = true;
    startBtn.textContent = "¡Jugando!";
    startBtn.classList.remove('pulse');
    
  
    gameInterval = setInterval(() => {
        timeLeft--;
        updateUI();
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    // Bucle de animación
    lastTime = 0;
    animationId = requestAnimationFrame(update);
}


function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    cancelAnimationFrame(animationId);
    startBtn.disabled = false;
    startBtn.textContent = "¡Jugar de nuevo!";
    startBtn.classList.add('pulse');
    
   
    setTimeout(() => {
        const resultDiv = document.createElement('div');
        resultDiv.style.position = 'fixed';
        resultDiv.style.top = '50%';
        resultDiv.style.left = '50%';
        resultDiv.style.transform = 'translate(-50%, -50%)';
        resultDiv.style.backgroundColor = 'rgba(0, 150, 136, 0.9)';
        resultDiv.style.color = 'white';
        resultDiv.style.padding = '30px';
        resultDiv.style.borderRadius = '20px';
        resultDiv.style.textAlign = 'center';
        resultDiv.style.zIndex = '100';
        resultDiv.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        resultDiv.style.maxWidth = '80%';
        resultDiv.innerHTML = `
            <h2 style="margin-top: 0; color: #b2ebf2;">¡Tiempo terminado!</h2>
            <p style="font-size: 1.3rem;">Energía capturada:</p>
            <p style="font-size: 3rem; margin: 10px 0; font-weight: bold; color: #ffff00;">${score} ⚡</p>
            <button id="closeResult" style="
                background: linear-gradient(to bottom, #00bcd4, #00838f);
                color: white;
                border: none;
                padding: 10px 25px;
                border-radius: 30px;
                font-size: 1rem;
                cursor: pointer;
                margin-top: 15px;
                font-weight: bold;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            ">Aceptar</button>
        `;
        
        document.body.appendChild(resultDiv);
        
        document.getElementById('closeResult').addEventListener('click', () => {
            resultDiv.remove();
        });
    }, 500);
}

// Event listeners
startBtn.addEventListener('click', startGame);

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleClick(x, y);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleClick(x, y);
}, { passive: false });

// Inicializar al cargar
window.addEventListener('load', () => {
    initGame();
});