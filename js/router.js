// Sistema de enrutamiento simple
const router = {
    routes: {},
    
    // Registrar una ruta
    register(path, component) {
        this.routes[path] = component;
    },
    
    // Navegar a una ruta
    async navigate(path, isRecursiveCall = false) {
        // Si no está autenticado y no es la página de login, redirigir a login
        if (!auth.isAuthenticated() && path !== 'login') {
            if (!isRecursiveCall) {  // Evitar bucle infinito
                console.log('Usuario no autenticado, redirigiendo a login');
                this.navigate('login', true);
            } else {
                console.error('Error de autenticación: No se puede redirigir a login');
                document.getElementById('app').innerHTML = `
                    <div style="max-width: 400px; margin: 50px auto; padding: 20px;">
                        <h2>Error de Autenticación</h2>
                        <p>No se puede acceder sin iniciar sesión.</p>
                    </div>
                `;
            }
            return;
        }
        
        const component = this.routes[path];
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
                const activeLink = document.querySelector(`[onclick*="'${path}'"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
                
                // Renderizar componente
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
        } else {
            console.error(`Ruta no encontrada: ${path}`);
            
            // Si estamos tratando de navegar a una ruta no encontrada y no es un bucle
            if (!isRecursiveCall) {
                // Si la ruta que no existe es login, mostrar un mensaje de error
                if (path === 'login') {
                    console.error('Error crítico: Ruta login no encontrada');
                    app.innerHTML = `
                        <div style="max-width: 400px; margin: 50px auto; padding: 20px;">
                            <h2>Error de Navegación</h2>
                            <p>No se encuentra la página de inicio de sesión.</p>
                        </div>
                    `;
                } 
                // Si la ruta que no existe es dashboard, mostrar un mensaje de error
                else if (path === 'dashboard') {
                    console.error('Error crítico: Ruta dashboard no encontrada');
                    app.innerHTML = `
                        <div style="max-width: 400px; margin: 50px auto; padding: 20px;">
                            <h2>Error de Navegación</h2>
                            <p>No se encuentra la página principal (dashboard).</p>
                        </div>
                    `;
                }
                // Para cualquier otra ruta, intentar ir al dashboard
                else if (path !== 'dashboard') {
                    this.navigate('dashboard', true);
                }
            }
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
