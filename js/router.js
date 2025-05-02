// Sistema de enrutamiento simple
const router = {
    routes: {},
    
    // Registrar una ruta
    register(path, component) {
        this.routes[path] = component;
    },
    
    // Navegar a una ruta
    async navigate(path) {
        // Si no está autenticado y no es la página de login, redirigir a login
        if (!auth.isAuthenticated() && path !== 'login') {
            this.navigate('login');
            return;
        }
        
        // Comprobar si es una ruta con parámetros
        let component;
        let params = {};
        
        if (path.includes('/')) {
            // Ejemplo: 'locales-cliente/123' -> ruta='locales-cliente', id='123'
            const pathParts = path.split('/');
            const basePath = pathParts[0];
            
            // Manejar 'locales-cliente/:id'
            if (basePath === 'locales-cliente' && pathParts.length > 1) {
                component = localesComponent;
                params.clienteId = pathParts[1];
            }
        } else {
            component = this.routes[path];
        }
        
        const app = document.getElementById('app');
        
        if (component) {
            try {
                // Actualizar menú activo
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                document.querySelectorAll('.sidebar-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Encontrar y activar el link correspondiente
                const activeLink = document.querySelector(`[onclick*="'${path.split('/')[0]}'"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                
                // Renderizar componente con parámetros
                if (component.render.constructor.name === 'AsyncFunction') {
                    // Componente asíncrono
                    await component.render(app, params);
                } else {
                    // Componente síncrono
                    component.render(app, params);
                }
                
                // Actualizar URL (sin recargar la página)
                history.pushState({ path }, '', `#${path}`);
            } catch (error) {
                console.error('Error renderizando componente:', error);
                app.innerHTML = `
                    <div class="error">
                        <h3>Error al cargar la página</h3>
                        <p>Ha ocurrido un error al cargar esta sección.</p>
                        <button class="btn btn-primary" onclick="router.navigate('dashboard')">Volver al Dashboard</button>
                    </div>
                `;
            }
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
