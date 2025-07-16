// Solar Panel Game - Módulo principal
class SolarGame {
    constructor(canvasId, startBtnId, resetBtnId, scoreElementId, energyElementId) {
        // Elementos del DOM
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById(startBtnId);
        this.resetBtn = document.getElementById(resetBtnId);
        this.scoreElement = document.getElementById(scoreElementId);
        this.energyElement = document.getElementById(energyElementId);
        
        // Estado del juego
        this.solarPanelAngle = 0;
        this.sunPosition = { x: 300, y: 50 };
        this.gameRunning = false;
        this.score = 0;
        this.totalEnergy = 0;
        this.lastUpdateTime = 0;
        this.sunMoveInterval = null;
        this.energyUpdateInterval = null;
        
        // Inicialización
        this.initialize();
    }
    
    initialize() {
        // Configuración inicial
        this.energyElement.textContent = '0.00';
        
        // Event listeners
        this.setupEventListeners();
        
        // Dibujar estado inicial
        this.draw();
    }
    
    setupEventListeners() {
        // Control con el mouse
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Control táctil
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleTouchMove(e);
        }, { passive: false });
        
        // Botones
        this.startBtn.addEventListener('click', () => this.toggleGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
    }
    
    handleMouseMove(e) {
        if (!this.gameRunning) return;
        this.updatePanelAngle(e.clientX, e.clientY);
    }
    
    handleTouchMove(e) {
        if (!this.gameRunning) return;
        const touch = e.touches[0];
        this.updatePanelAngle(touch.clientX, touch.clientY);
    }
    
    updatePanelAngle(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        
        const panelCenterX = 300;
        const panelCenterY = 300;
        
        const angleRad = Math.atan2(mouseY - panelCenterY, mouseX - panelCenterX);
        this.solarPanelAngle = (angleRad * (180 / Math.PI) + 90 + 360) % 360;
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar fondo
        this.ctx.fillStyle = '#e0f7fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar sol
        this.drawSun();
        
        // Dibujar panel solar
        this.drawSolarPanel();
        
        // Dibujar puntuación
        this.drawScore();
        
        // Continuar el bucle de animación si el juego está en ejecución
        if (this.gameRunning) {
            requestAnimationFrame(() => this.draw());
            this.calculateScore();
        }
    }
    
    drawSun() {
        // Gradiente para el sol
        const gradient = this.ctx.createRadialGradient(
            this.sunPosition.x, this.sunPosition.y, 0,
            this.sunPosition.x, this.sunPosition.y, 30
        );
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(1, '#ffcc00');
        
        // Dibujar sol
        this.ctx.beginPath();
        this.ctx.arc(this.sunPosition.x, this.sunPosition.y, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Rayos del sol
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        this.ctx.lineWidth = 3;
        
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30) * Math.PI / 180;
            const startX = this.sunPosition.x + Math.cos(angle) * 30;
            const startY = this.sunPosition.y + Math.sin(angle) * 30;
            const endX = this.sunPosition.x + Math.cos(angle) * 50;
            const endY = this.sunPosition.y + Math.sin(angle) * 50;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
    }
    
    drawSolarPanel() {
        this.ctx.save();
        this.ctx.translate(300, 300);
        this.ctx.rotate(this.solarPanelAngle * Math.PI / 180);
        
        // Base del panel
        this.ctx.fillStyle = '#1a237e';
        this.ctx.fillRect(-100, -20, 200, 40);
        
        // Superficie del panel
        const panelGradient = this.ctx.createLinearGradient(-90, -15, 90, 15);
        panelGradient.addColorStop(0, '#3f51b5');
        panelGradient.addColorStop(1, '#1a237e');
        this.ctx.fillStyle = panelGradient;
        this.ctx.fillRect(-90, -15, 180, 30);
        
        // Marco del panel
        this.ctx.strokeStyle = '#0d47a1';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-100, -20, 200, 40);
        
        this.ctx.restore();
    }
    
    drawScore() {
        this.ctx.fillStyle = 'black';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Puntuación: ${this.score}%`, 20, 30);
    }
    
    calculateScore() {
        // Calcular el ángulo óptimo para mirar al sol
        const dx = this.sunPosition.x - 300;
        const dy = this.sunPosition.y - 300;
        let optimalAngle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
        optimalAngle = (optimalAngle + 360) % 360;
        
        // Calcular diferencia de ángulo (0-180 grados)
        let angleDiff = Math.abs(this.solarPanelAngle - optimalAngle);
        angleDiff = Math.min(angleDiff, 360 - angleDiff);
        
        // Calcular puntuación (100% a 0° de diferencia, 0% a 90°+ de diferencia)
        this.score = Math.max(0, 100 - Math.floor(angleDiff / 0.9));
        this.scoreElement.textContent = `Eficiencia: ${this.score}% (Ángulo óptimo: ${Math.round(optimalAngle)}°)`;
        
        // Actualizar color según la eficiencia
        if (this.score > 75) {
            this.scoreElement.style.color = '#2e7d32'; // Verde oscuro
        } else if (this.score > 50) {
            this.scoreElement.style.color = '#ef6c00'; // Naranja
        } else {
            this.scoreElement.style.color = '#c62828'; // Rojo
        }
    }
    
    moveSunRandomly() {
        // Mover el sol a una posición aleatoria
        this.sunPosition.x = 100 + Math.random() * 400;  // Mantener dentro del ancho del canvas
        this.sunPosition.y = 30 + Math.random() * 100;   // Mantener cerca de la parte superior
    }
    
    updateEnergyCounter() {
        if (!this.gameRunning) return;
        
        const now = Date.now();
        if (this.lastUpdateTime === 0) {
            this.lastUpdateTime = now;
            return;
        }
        
        const deltaTime = (now - this.lastUpdateTime) / 1000; // Convertir a segundos
        this.lastUpdateTime = now;
        
        // Calcular energía generada (kWh) - usando la puntuación como porcentaje de eficiencia
        // Tasa base: 1 kWh por segundo al 100% de eficiencia
        const energyGenerated = (this.score / 100) * 1 * (deltaTime / 5);
        this.totalEnergy += energyGenerated;
        
        // Actualizar visualización (formato a 2 decimales)
        this.energyElement.textContent = this.totalEnergy.toFixed(2);
    }
    
    toggleGame() {
        if (!this.gameRunning) {
            // Iniciar juego
            this.gameRunning = true;
            this.startBtn.textContent = 'Pausar Juego';
            this.resetBtn.disabled = true;
            
            // Inicializar temporizadores
            this.lastUpdateTime = Date.now();
            
            // Mover el sol cada 3 segundos
            if (this.sunMoveInterval) clearInterval(this.sunMoveInterval);
            this.sunMoveInterval = setInterval(() => this.moveSunRandomly(), 3000);
            
            // Iniciar contador de energía
            if (this.energyUpdateInterval) clearInterval(this.energyUpdateInterval);
            this.energyUpdateInterval = setInterval(() => this.updateEnergyCounter(), 100);
            
            // Posición inicial del sol
            this.moveSunRandomly();
            
            // Iniciar bucle de juego
            requestAnimationFrame(() => this.draw());
        } else {
            // Pausar juego
            this.gameRunning = false;
            this.startBtn.textContent = 'Continuar';
            this.resetBtn.disabled = false;
            
            // Limpiar intervalos
            clearInterval(this.sunMoveInterval);
            clearInterval(this.energyUpdateInterval);
        }
    }
    
    resetGame() {
        // Reiniciar estado del juego
        this.gameRunning = false;
        this.startBtn.textContent = 'Comenzar Juego';
        this.solarPanelAngle = 0;
        this.sunPosition = { x: 300, y: 50 };
        this.score = 0;
        this.totalEnergy = 0;
        this.lastUpdateTime = 0;
        
        // Actualizar UI
        this.energyElement.textContent = '0.00';
        this.scoreElement.textContent = '¡Alinea el panel solar con el sol para maximizar la producción de energía!';
        this.scoreElement.style.color = '#0d47a1';
        
        // Limpiar intervalos
        if (this.sunMoveInterval) clearInterval(this.sunMoveInterval);
        if (this.energyUpdateInterval) clearInterval(this.energyUpdateInterval);
        
        // Redibujar estado inicial
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw();
    }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const game = new SolarGame(
        'solarGame',        // ID del canvas
        'solarStartBtn',    // ID del botón de inicio/pausa
        'solarResetBtn',    // ID del botón de reinicio
        'solarGameScore',   // ID del elemento de puntuación
        'energyValue'       // ID del elemento de energía
    );
});
