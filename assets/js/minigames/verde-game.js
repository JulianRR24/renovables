// Configuración del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Elementos del juego
const waterMolecules = [];
const h2Molecules = [];
let energy = 100;
let score = 0;
let gameTime = 0;

// Generar moléculas de agua
function generateWater() {
    if (Math.random() < 0.02) {
        waterMolecules.push({
            x: Math.random() * canvas.width,
            y: 0,
            hPos: Math.random() * Math.PI * 2, // Posición angular de los átomos H
            speed: 1 + Math.random() * 2
        });
    }
}

// Dibujar elementos
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar fondo
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar panel de control
    ctx.fillStyle = '#1abc9c';
    ctx.fillRect(0, 0, canvas.width, 60);
    ctx.fillStyle = '#000';
    ctx.font = '18px Arial';
    ctx.fillText(`Hidrógeno producido: ${score} mol`, 20, 30);
    ctx.fillText(`Energía renovable: ${energy.toFixed(1)}%`, 300, 30);
    
    // Dibujar moléculas de agua (H₂O)
    waterMolecules.forEach(mol => {
        // Oxígeno (centro)
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(mol.x, mol.y, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Hidrógenos
        ctx.fillStyle = '#00BFFF';
        ctx.beginPath();
        ctx.arc(mol.x + Math.cos(mol.hPos) * 20, mol.y + Math.sin(mol.hPos) * 20, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(mol.x + Math.cos(mol.hPos + Math.PI) * 20, mol.y + Math.sin(mol.hPos + Math.PI) * 20, 6, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Dibujar moléculas de H₂ producidas
    h2Molecules.forEach(mol => {
        ctx.fillStyle = '#00BFFF';
        ctx.beginPath();
        ctx.arc(mol.x - 10, mol.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(mol.x + 10, mol.y, 8, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Mostrar mensaje si la energía es baja
    if (energy < 10) {
        ctx.fillStyle = '#e74c3c';
        ctx.font = '20px Arial';
        ctx.fillText('¡Energía baja! Espera a que se recupere (energía renovable)', 100, 90);
    }
}

// Actualizar juego
function update() {
    gameTime++;
    
    // Generar nuevas moléculas
    generateWater();
    
    // Mover moléculas de agua
    waterMolecules.forEach(mol => {
        mol.y += mol.speed;
        mol.hPos += 0.05;
    });
    
    // Eliminar moléculas fuera de pantalla
    for (let i = waterMolecules.length - 1; i >= 0; i--) {
        if (waterMolecules[i].y > canvas.height + 30) {
            waterMolecules.splice(i, 1);
        }
    }
    
    // Mover moléculas de H₂ hacia arriba
    for (let i = h2Molecules.length - 1; i >= 0; i--) {
        h2Molecules[i].y -= 2;
        if (h2Molecules[i].y < -20) {
            h2Molecules.splice(i, 1);
        }
    }
    
    // Regenerar energía (fuente renovable)
    energy = Math.min(100, energy + 0.05);
}

// Event listener para clic
canvas.addEventListener('click', (e) => {
    if (energy < 10) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    for (let i = waterMolecules.length - 1; i >= 0; i--) {
        const mol = waterMolecules[i];
        
        if (mouseY > mol.y - 30 && mouseY < mol.y + 30 &&
            mouseX > mol.x - 30 && mouseX < mol.x + 30) {
            
            // Verificar si los hidrógenos están alineados horizontalmente (para facilidad del juego)
            const h1x = mol.x + Math.cos(mol.hPos) * 20;
            const h2x = mol.x + Math.cos(mol.hPos + Math.PI) * 20;
            
            if (Math.abs(h1x - h2x) > 35) { // Están bastante alineados
                score++;
                h2Molecules.push({ x: mol.x, y: mol.y });
                waterMolecules.splice(i, 1);
                energy -= 10;
            } else {
                energy -= 5; // Penalización por intento fallido
            }
            
            break;
        }
    }
});

// Bucle del juego
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Iniciar el juego
gameLoop();