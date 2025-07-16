/**
 * ScrollAnimation - Módulo para animaciones basadas en scroll
 * @param {Object} config - Configuración de la animación
 * @param {string} config.animationContainerId - ID del contenedor de la animación
 * @param {string} config.animationImageId - ID de la imagen de la animación
 * @param {number} [config.maxFrames=144] - Número total de frames
 * @param {string} [config.framesPath=''] - Ruta base para los frames
 * @param {string} [config.framePrefix='frame-'] - Prefijo de los nombres de archivo de los frames
 * @param {string} [config.frameExtension='.jpg'] - Extensión de los archivos de frames
 * @param {number} [config.scrollSensitivity=0.1] - Sensibilidad del scroll
 * @param {number} [config.scrollThreshold=30] - Umbral de activación del scroll
 * @param {number} [config.animationSpeed=0.1] - Velocidad de la animación
 * @param {number} [config.framePrecision=0.1] - Precisión del frame
 * @param {number} [config.opacity=0.5] - Opacidad de la imagen
 * @param {boolean} [config.enableTouch=true] - Habilitar soporte táctil
 */
class ScrollAnimation {
    constructor(config) {
        // Configuración por defecto
        this.config = {
            maxFrames: 144,
            framesPath: '',
            framePrefix: 'frame-',
            frameExtension: '.jpg',
            scrollSensitivity: 0.1,
            scrollThreshold: 30,
            animationSpeed: 0.1,
            framePrecision: 0.1,
            opacity: 0.5,
            enableTouch: true,
            ...config
        };

        // Elementos del DOM
        this.elements = {
            img: document.getElementById(this.config.animationImageId),
            container: document.getElementById(this.config.animationContainerId)
        };

        // Estado de la animación
        this.state = {
            targetFrame: 1,
            currentFrame: 1,
            scrollAccumulator: 0,
            isAnimating: false,
            animationFrameId: null
        };

        // Inicialización
        this.init();
    }

    /**
     * Inicializa la animación
     */
    init() {
        if (!this.elements.img) {
            console.error('No se encontró el elemento de animación');
            return;
        }

        this.setupContainer();
        this.setupImage();
        this.setupEventListeners();
        this.startAnimation();
        
        console.log('Animación de scroll inicializada');
    }

    /**
     * Configura el contenedor de la animación
     */
    setupContainer() {
        if (!this.elements.container) return;
        
        Object.assign(this.elements.container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '-1',
            overflow: 'hidden'
        });
    }

    /**
     * Configura la imagen de la animación
     */
    setupImage() {
        Object.assign(this.elements.img.style, {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: this.config.opacity.toString()
        });
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        window.addEventListener('wheel', this.handleWheel.bind(this), { passive: true });
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        
        if (this.config.enableTouch) {
            this.setupTouchEvents();
        }
    }

    /**
     * Configura los eventos táctiles
     */
    setupTouchEvents() {
        let touchStartY = 0;
        
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        window.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;
            this.updateTargetFrame(deltaY * 0.1);
            touchStartY = touchY;
        }, { passive: false });
    }

    /**
     * Maneja el evento de rueda del mouse
     * @param {WheelEvent} e - Evento de rueda
     */
    handleWheel(e) {
        this.state.scrollAccumulator += Math.abs(e.deltaY);
        
        if (this.state.scrollAccumulator >= this.config.scrollThreshold) {
            const direction = e.deltaY > 0 ? 1 : -1;
            const delta = direction * this.config.scrollSensitivity * (this.config.maxFrames / 10);
            this.updateTargetFrame(delta);
            this.state.scrollAccumulator = 0;
        }
    }

    /**
     * Maneja el evento de scroll de la página
     */
    handleScroll() {
        // Obtener la posición actual del scroll
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        
        // Calcular el porcentaje de scroll (0 a 1)
        const windowHeight = window.innerHeight;
        const documentHeight = Math.max(
            document.body.scrollHeight, 
            document.documentElement.scrollHeight,
            document.body.offsetHeight, 
            document.documentElement.offsetHeight,
            document.body.clientHeight, 
            document.documentElement.clientHeight
        ) - windowHeight;
        
        const scrollPercentage = Math.min(scrollPosition / documentHeight, 1);
        
        // Calcular el frame objetivo basado en el porcentaje de scroll
        const targetFrame = Math.ceil(scrollPercentage * (this.config.maxFrames - 1)) + 1;
        
        // Actualizar el frame objetivo
        if (targetFrame !== this.state.targetFrame) {
            this.state.targetFrame = Math.min(Math.max(1, targetFrame), this.config.maxFrames);
            
            if (!this.state.isAnimating) {
                this.state.isAnimating = true;
                this.state.animationFrameId = requestAnimationFrame(this.updateFrame.bind(this));
            }
        }
    }

    /**
     * Actualiza el frame objetivo
     * @param {number} delta - Cambio en el frame
     */
    updateTargetFrame(delta) {
        // Actualizar el frame objetivo
        let newTarget = this.state.targetFrame + delta;
        
        // Si supera el máximo, volver al inicio
        if (newTarget > this.config.maxFrames) {
            newTarget = 1;
        } 
        // Si es menor que 1, ir al último frame
        else if (newTarget < 1) {
            newTarget = this.config.maxFrames;
        }
        
        this.state.targetFrame = newTarget;
        
        if (!this.state.isAnimating) {
            this.state.isAnimating = true;
            this.state.animationFrameId = requestAnimationFrame(this.updateFrame.bind(this));
        }
    }

    /**
     * Actualiza el frame actual
     */
    updateFrame() {
        // Suavizar la transición
        this.state.currentFrame += (this.state.targetFrame - this.state.currentFrame) * this.config.animationSpeed;
        
        // Limitar el frame actual
        this.state.currentFrame = Math.max(1, Math.min(this.state.currentFrame, this.config.maxFrames));
        
        // Actualizar la imagen
        this.updateImage();
        
        // Continuar la animación si es necesario
        if (Math.abs(this.state.currentFrame - this.state.targetFrame) > this.config.framePrecision) {
            this.state.animationFrameId = requestAnimationFrame(this.updateFrame.bind(this));
        } else {
            this.state.isAnimating = false;
            this.state.animationFrameId = null;
        }
    }

    /**
     * Actualiza la imagen mostrada
     */
    updateImage() {
        const frameNumber = Math.round(this.state.currentFrame).toString().padStart(3, '0');
        const imagePath = `${this.config.framesPath}${this.config.framePrefix}${frameNumber}${this.config.frameExtension}`;
        
        if (!this.elements.img.src.endsWith(imagePath)) {
            this.elements.img.src = imagePath;
        }
    }

    /**
     * Inicia la animación
     */
    startAnimation() {
        if (this.state.animationFrameId) {
            cancelAnimationFrame(this.state.animationFrameId);
        }
        this.state.animationFrameId = requestAnimationFrame(this.updateFrame.bind(this));
    }

    /**
     * Detiene la animación
     */
    stopAnimation() {
        if (this.state.animationFrameId) {
            cancelAnimationFrame(this.state.animationFrameId);
            this.state.animationFrameId = null;
        }
        this.state.isAnimating = false;
    }

    /**
     * Destruye la instancia y limpia los recursos
     */
    destroy() {
        this.stopAnimation();
        window.removeEventListener('wheel', this.handleWheel);
        // Limpiar otros event listeners si es necesario
    }

    /**
     * Inicia la animación
     */
    startAnimation() {
        if (this.state.animationFrameId) {
            cancelAnimationFrame(this.state.animationFrameId);
        }
        this.state.animationFrameId = requestAnimationFrame(this.updateFrame.bind(this));
    }

    /**
     * Detiene la animación
     */
    stopAnimation() {
        if (this.state.animationFrameId) {
            cancelAnimationFrame(this.state.animationFrameId);
            this.state.animationFrameId = null;
        }
        this.state.isAnimating = false;
    }

    /**
     * Destruye la instancia y limpia los recursos
     */
    destroy() {
        this.stopAnimation();
        window.removeEventListener('wheel', this.handleWheel);
        // Limpiar otros event listeners si es necesario
    }
}

// Exportar la clase para su uso en otros módulos
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ScrollAnimation;
} else {
    window.ScrollAnimation = ScrollAnimation;
}
