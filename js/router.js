// Sistema de enrutamiento simple
const router = {
    routes: {},
    
    // Registrar una ruta
    register(path, component) {
        this.routes[path] = component;
    },
    
    // Navegar a una ruta
    navigate(path) {
        // Si no está autenticado y no es la página de login, redirigir a login
        if (!auth.isAuthenticated() && path !== 'login') {
            this.navigate('login');
            return;
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
            component.render(app);
            
            // Actualizar URL (sin recargar la página)
            history.pushState({ path }, '', `#${path}`);
        } else if (path !== 'dashboard') {
            // Si la ruta no existe y no es dashboard, ir al dashboard
            this.navigate('dashboard');
        }
    },
    
    // Inicializar router
    init() {
        // Manejar el botón atrás del navegador
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.path) {
                this.navigate(event.state.path);
            }
        });
        
        // Cargar ruta inicial
        const hash = window.location.hash.slice(1);
        this.navigate(hash || 'dashboard');
    }
};
