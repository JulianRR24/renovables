/**
 * 3D Model Viewer
 * Carga y muestra modelos 3D interactivos usando Three.js
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const container = document.getElementById('model3d-viewer');
    const loadingOverlay = document.getElementById('loading-overlay');
    const resetCameraBtn = document.getElementById('reset-camera');
    const toggleWireframeBtn = document.getElementById('toggle-wireframe');
    const toggleLightsBtn = document.getElementById('toggle-lights');
    
    // Variables de Three.js
    let scene, camera, renderer, controls, model, ambientLight, directionalLight, pointLight;
    let isWireframe = false;
    let lightsOn = true;
    
    // Inicializar la escena 3D
    function init() {
        // Crear la escena
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        
        // Configurar la cámara
        camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        camera.position.y = 2;
        
        // Configurar el renderizador
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        // Configurar controles de órbita
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 1;
        controls.maxDistance = 20;
        controls.maxPolarAngle = Math.PI / 1.5;
        
        // Invertir la dirección del zoom
        controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        
        controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };
        
        // Invertir la dirección del zoom con la rueda del ratón
        controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
        };
        
        // Invertir la dirección del zoom
        controls.zoomSpeed = -0.5; // Valor negativo para invertir
        
        // Configurar luces
        setupLights();
        
        // Cargar el modelo
        loadModel();
        
        // Manejar eventos de la ventana
        window.addEventListener('resize', onWindowResize);
        
        // Configurar botones
        if (resetCameraBtn) resetCameraBtn.addEventListener('click', resetCamera);
        if (toggleWireframeBtn) toggleWireframeBtn.addEventListener('click', toggleWireframe);
        if (toggleLightsBtn) toggleLightsBtn.addEventListener('click', toggleLights);
        
        // Iniciar el bucle de renderizado
        animate();
    }
    
    // Configurar las luces de la escena
    function setupLights() {
        // Luz ambiental (iluminación general)
        ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        // Luz direccional (simula el sol)
        directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Luz puntual adicional para resaltar detalles
        pointLight = new THREE.PointLight(0xffffff, 0.5, 10);
        pointLight.position.set(2, 3, 4);
        scene.add(pointLight);
    }
    
    // Cargar el modelo 3D
    function loadModel() {
        const mtlLoader = new THREE.MTLLoader();
        const objLoader = new THREE.OBJLoader();
        
        // Configuración por defecto
        const defaultConfig = {
            basePath: '../../assets/3d-models/solarpanel/',
            mtlFile: '10781_Solar-Panels_V1.mtl',
            objFile: '10781_Solar-Panels_V1.obj',
            scale: 0.01,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        };

        // Combinar configuración por defecto con la personalizada
        const config = { ...defaultConfig, ...(window.modelConfig || {}) };
        
        // Primero cargar los materiales
        mtlLoader.setPath(config.basePath);
        mtlLoader.load(config.mtlFile, function(materials) {
            materials.preload();
            
            // Configurar el cargador OBJ para usar los materiales cargados
            objLoader.setMaterials(materials);
            objLoader.setPath(config.basePath);
            
            // Cargar el modelo OBJ
            objLoader.load(config.objFile, function(object) {
                model = object;
                
                // Ajustar la escala y posición del modelo según la configuración
                model.scale.set(config.scale, config.scale, config.scale);
                model.position.set(config.position.x, config.position.y, config.position.z);
                model.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);
                
                // Añadir el modelo a la escena
                scene.add(model);
                
                // Ocultar el indicador de carga
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                }
                
                console.log('Modelo 3D cargado correctamente');
                
            }, onProgress, onError);
            
        }, onProgress, onError);
    }
    
    // Manejar progreso de carga
    function onProgress(xhr) {
        if (xhr.lengthComputable) {
            const percentComplete = (xhr.loaded / xhr.total) * 100;
            console.log(Math.round(percentComplete) + '% cargado');
        }
    }
    
    // Manejar errores de carga
    function onError(error) {
        console.error('Error al cargar el modelo 3D:', error);
        if (loadingOverlay) {
            loadingOverlay.innerHTML = '<p style="color: red;">Error al cargar el modelo 3D. Por favor, recarga la página.</p>';
        }
    }
    
    // Reiniciar la cámara a la posición inicial
    function resetCamera() {
        if (camera && controls) {
            camera.position.set(0, 2, 5);
            camera.lookAt(0, 0, 0);
            controls.reset();
        }
    }
    
    // Alternar entre modo alámbrico y sólido
    function toggleWireframe() {
        if (!model) return;
        
        isWireframe = !isWireframe;
        
        // Recorrer todos los objetos del modelo
        model.traverse(function(child) {
            if (child.isMesh) {
                child.material.wireframe = isWireframe;
            }
        });
        
        // Actualizar el texto del botón
        if (toggleWireframeBtn) {
            toggleWireframeBtn.textContent = isWireframe ? 'Modo Sólido' : 'Modo Alámbrico';
        }
    }
    
    // Alternar luces
    function toggleLights() {
        lightsOn = !lightsOn;
        
        // Alternar todas las luces
        ambientLight.visible = lightsOn;
        directionalLight.visible = lightsOn;
        pointLight.visible = lightsOn;
        
        // Actualizar el texto del botón
        if (toggleLightsBtn) {
            toggleLightsBtn.textContent = lightsOn ? 'Apagar Luces' : 'Encender Luces';
        }
    }
    
    // Manejar cambio de tamaño de la ventana
    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
    
    // Bucle de animación
    function animate() {
        requestAnimationFrame(animate);
        
        // Actualizar controles
        if (controls) {
            controls.update();
        }
        
        // Rotación automática suave cuando no se está interactuando
        if (model && !controls.enabled) {
            model.rotation.y += 0.005;
        }
        
        // Renderizar la escena
        renderer.render(scene, camera);
    }
    
    // Inicializar el visor 3D
    init();
});
