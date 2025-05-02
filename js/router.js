// Sistema de enrutamiento simple
const router = {
    routes: {},
    
    // Registrar una ruta
    register(path, component) {
        this.routes[path] = component;
    },
    
    // Navegar a una ruta
    async navigate(path) {
        // Verificar si la ruta existe
        const component = this.routes[path];
        
        // Si la ruta no existe, mostrar un mensaje y navegar al dashboard
        if (!component) {
            console.error(`Ruta no encontrada: ${path}`);
            
            // Si estamos tratando de ir a login y no existe, mejor ir a dashboard
            // para evitar bucles infinitos
            if (path === 'login') {
                console.warn('Ruta login no encontrada, redirigiendo a dashboard para evitar bucle');
                
                // Aquí, forzamos la carga del dashboard sin validación de autenticación
                const dashboardComponent = this.routes['dashboard'];
                if (dashboardComponent) {
                    const app = document.getElementById('app');
                    
                    try {
                        if (dashboardComponent.render.constructor.name === 'AsyncFunction') {
                            await dashboardComponent.render(app);
                        } else {
                            dashboardComponent.render(app);
                        }
                        
                        history.pushState({ path: 'dashboard' }, '', `#dashboard`);
                        return;
                    } catch (error) {
                        console.error('Error renderizando dashboard:', error);
                    }
                }
            }
            
            // Si no podemos ir a login o al dashboard, intentar otra ruta
            this.navigate('dashboard');
            return;
        }
        
        // Si no está autenticado y no es la página de login, redirigir a login
        if (!auth.isAuthenticated() && path !== 'login') {
            console.log('Usuario no autenticado, redirigiendo a login');
            
            // Verificar que la ruta login existe antes de redirigir
            if (this.routes['login']) {
                this.navigate('login');
                return;
            } else {
                console.error('No existe la ruta login para redirigir');
                // Mostrar un mensaje de error en la página
                const app = document.getElementById('app');
                app.innerHTML = `
                    <div style="max-width: 400px; margin: 50px auto; padding: 20px; text-align: center;">
                        <h2>Error de Autenticación</h2>
                        <p>No estás autenticado y no se encuentra la página de login.</p>
                        <p>Por favor, recarga la página o contacta al administrador.</p>
                    </div>
                `;
                return;
            }
        }
        
        const app = document.getElementById('app');
        
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
    },
    
    // Inicializar router
    init() {
        // Verificar si hay rutas registradas
        if (Object.keys(this.routes).length === 0) {
            console.error('No hay rutas registradas');
            return;
        }
        
        // Verificar que existe la ruta login
        if (!this.routes['login']) {
            console.warn('No se ha registrado la ruta login, esto puede causar problemas de navegación');
        }
        
        // Manejar el botón atrás del navegador
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.path) {
                this.navigate(event.state.path);
            }
        });
        
        // Cargar ruta inicial
        const hash = window.location.hash.slice(1);
        
        // Si no está autenticado, cargar login, de lo contrario cargar la ruta del hash o dashboard
        if (!auth.isAuthenticated()) {
            if (this.routes['login']) {
                this.navigate('login');
            } else {
                console.error('No existe ruta login para autenticar');
                document.getElementById('app').innerHTML = `
                    <div style="max-width: 400px; margin: 50px auto; padding: 20px; text-align: center;">
                        <h2>Error de Autenticación</h2>
                        <p>No estás autenticado y no se encuentra la página de login.</p>
                        <p>Por favor, recarga la página o contacta al administrador.</p>
                    </div>
                `;
            }
        } else {
            this.navigate(hash || 'dashboard');
        }
    }
};
