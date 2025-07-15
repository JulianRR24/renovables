console.log('Script mobile-menu.js cargado correctamente');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente cargado');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const leftSidebar = document.querySelector('.left-sidebar');
    const menuLinks = document.querySelectorAll('.menu-item');
    const logoComp = document.querySelector('.logo-comp');
    const MOBILE_BREAKPOINT = 1200;

    // Función para abrir/cerrar menú
    function toggleMenu(open = null) {
        const isOpen = open !== null ? open : !menuToggle.classList.contains('active');
        
        menuToggle.classList.toggle('active', isOpen);
        leftSidebar.classList.toggle('mobile-visible', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        
        // Ajustar posición del logo cuando el menú está abierto
        if (window.innerWidth <= MOBILE_BREAKPOINT) {
            if (isOpen) {
                logoComp.style.left = '300px';
            } else {
                logoComp.style.left = '70px';
            }
        }
    }

    // Toggle menu visibility
    menuToggle.addEventListener('click', function() {
        const isOpening = !this.classList.contains('active');
        toggleMenu(isOpening);
    });

    // Cerrar menú al hacer clic en un enlace
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= MOBILE_BREAKPOINT) {
                toggleMenu(false);
            }
        });
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= MOBILE_BREAKPOINT && 
            !leftSidebar.contains(event.target) && 
            !menuToggle.contains(event.target) &&
            leftSidebar.classList.contains('mobile-visible')) {
            
            toggleMenu(false);
        }
    });

    // Manejar cambio de tamaño de ventana
    function handleResize() {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            // Resetear estado del menú en desktop
            toggleMenu(false);
            leftSidebar.style.transform = '';
            logoComp.style.left = '70px';
        } else {
            // Asegurarse de que el menú esté cerrado al cambiar a móvil
            if (leftSidebar.classList.contains('mobile-visible')) {
                leftSidebar.style.transform = 'translateX(0)';
                logoComp.style.left = '300px';
            } else {
                logoComp.style.left = '70px';
            }
        }
    }

    // Inicializar el menú según el tamaño de pantalla
    handleResize();
    window.addEventListener('resize', handleResize);
});
