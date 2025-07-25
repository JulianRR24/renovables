// Configuración del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let gameRunning = true;
let waveOffset = 0;


const converter = {
    x: canvas.width/2 - 50,
    y: 300,
    width: 100,
    height: 30,
    speed: 6
};

// Olas
let waves = [];


let keys = {
    left: false,
    right: false
};


function drawWaves() {
    waveOffset += 0.05;
    
    ctx.fillStyle = '#1E90FF';
    ctx.beginPath();
    ctx.moveTo(0, 300);
    

    for (let x = 0; x <= canvas.width; x += 20) {
        const y = 300 + Math.sin(x * 0.02 + waveOffset) * 15;
        ctx.lineTo(x, y);
    }
    
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x <= canvas.width; x += 30) {
        const y = 300 + Math.sin(x * 0.02 + waveOffset) * 15;
        if (x % 60 === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}


function draw() {
   
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    

    drawWaves();
    
  
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(converter.x, converter.y, converter.width, converter.height);
    
  
    ctx.fillStyle = '#1E90FF';
    ctx.fillRect(converter.x + 10, converter.y - 15, 80, 10);
    ctx.fillRect(converter.x + 20, converter.y - 30, 60, 15);
    
  
    ctx.fillStyle = 'rgba(0, 191, 255, 0.7)';
    waves.forEach(wave => {
        ctx.beginPath();
        ctx.ellipse(
            wave.x, 
            wave.y + Math.sin(wave.x * 0.1) * 5, 
            wave.size, 
            wave.size * 0.6, 
            0, 0, Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(
            wave.x - wave.size * 0.3, 
            wave.y + Math.sin(wave.x * 0.1) * 5 - wave.size * 0.4, 
            wave.size * 0.3, 
            0, Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 191, 255, 0.7)';
    });
    
   
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Energía: ' + score + ' kW', 20, 30);
}


function update() {
   
    if (keys.left && converter.x > 0) {
        converter.x -= converter.speed;
    }
    if (keys.right && converter.x < canvas.width - converter.width) {
        converter.x += converter.speed;
    }
    
  
    waves.forEach(wave => {
        wave.x += wave.speed;
        
      
        if (wave.x > converter.x && wave.x < converter.x + converter.width &&
            wave.y + Math.sin(wave.x * 0.1) * 5 > converter.y - wave.size) {
            score += Math.floor(wave.size * wave.speed);
            wave.x = canvas.width + 100; // Eliminar ola
            document.getElementById('score').textContent = score;
        }
    });
    
  
    waves = waves.filter(wave => wave.x < canvas.width + 50);
    
   
    if (Math.random() < 0.03) {
        waves.push({
            x: -30,
            y: 280 + Math.random() * 20,
            size: 15 + Math.random() * 20,
            speed: 1.5 + Math.random() * 2.5
        });
    }
}


function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    requestAnimationFrame(gameLoop);
}


function resetGame() {
    score = 0;
    waves = [];
    gameRunning = true;
    document.getElementById('score').textContent = '0';
    converter.x = canvas.width/2 - 50;
    gameLoop();
}


window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
});


gameLoop();