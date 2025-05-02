// Sistema de enrutamiento simple
const router = {
    routes: {},
    
    // Variable para evitar recursión infinita
    navigating: false,
    
    // Registrar una ruta
    register(path, component) {
        this.routes[path] = component;
    },
    
    // Navegar a una ruta
    async navigate(path) {
        // Prevenir recursión infinita
        if (this.navigating) {
            console.log("Navegación en progreso, evitando recursión");
            return;
        }
        
        this.navigating = true;
        
        try {
            // Si no está autenticado y no es la página de login, redirigir a login
            if (!auth.isAuthenticated() && path !== 'login') {
                console.log("Usuario no autenticado, redirigiendo a login");
                path = 'login';
            }
            
            const component = this.routes[path];
            const app = document.getElementById('app');
            
            if (component) {
                // Actualizar menú activo
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                document.querySelectorAll('.sidebar-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Encontrar y activar el link correspondiente
                const activeLink = document.querySelector(`[onclick*="'${path}'"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                
                // Renderizar componente
                if (typeof component.render === 'function') {
                    // Verificar si el componente es asíncrono
                    if (component.render.constructor.name === 'AsyncFunction') {
                        // Componente asíncrono
                        await component.render(app);
                    } else {
                        // Componente síncrono
                        component.render(app);
                    }
                    
                    // Actualizar URL (sin recargar la página)
                    history.pushState({ path }, '', `#${path}`);
                } else {
                    console.error('El componente para la ruta', path, 'no tiene método render');
                }
            } else if (path !== 'dashboard') {
                // Si la ruta no existe y no es dashboard, ir al dashboard
                console.log("Ruta no encontrada:", path, "- redirigiendo a dashboard");
                
                // Usamos setTimeout para evitar recursión directa
                setTimeout(() => {
                    this.navigating = false; // Liberamos el bloqueo
                    this.navigate('dashboard');
                }, 0);
                return;
            } else {
                console.error("¡Componente dashboard no registrado!");
                app.innerHTML = '<div class="error">Error: Ruta dashboard no registrada</div>';
            }
        } catch (error) {
            console.error('Error de navegación:', error);
        } finally {
            // Siempre liberar el bloqueo de navegación
            this.navigating = false;
        }
    },
    
    // Inicializar router
    init() {
        // Manejar el botón atrás del navegador
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.path) {
                console.log("Navegación por popstate a:", event.state.path);
                this.navigate(event.state.path);
            }
        });
        
        // Cargar ruta inicial
        const hash = window.location.hash.slice(1);
        console.log("Ruta inicial:", hash || 'dashboard');
        this.navigate(hash || 'dashboard');
    }
};

// Exponer router globalmente
window.router = router;
