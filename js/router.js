// Sistema de enrutamiento simple
const router = {
    routes: {},
    navigating: false, // Flag para prevenir navegaciones simultáneas
    
    // Registrar una ruta
    register(path, component) {
        console.log(`Registrando ruta: ${path}`);
        this.routes[path] = component;
    },
    
    // Navegar a una ruta
    async navigate(path, isRecursiveCall = false) {
        // Prevenir navegaciones recursivas
        if (this.navigating) {
            console.warn('Navegación en progreso, ignorando llamada adicional');
            return;
        }
        
        this.navigating = true;
        console.log(`Navegando a: ${path}, recursivo: ${isRecursiveCall}`);
        
        try {
            // Si no está autenticado y no es la página de login, redirigir a login
            if (!auth.isAuthenticated() && path !== 'login') {
                if (!isRecursiveCall) {
                    console.log('Usuario no autenticado, redirigiendo a login');
                    this.navigating = false; // Resetear flag antes de llamada recursiva
                    this.navigate('login', true);
                    return;
                } else {
                    console.error('Error de autenticación: No se puede redirigir a login');
                    document.getElementById('app').innerHTML = `
                        <div style="max-width: 400px; margin: 50px auto; padding: 20px;">
                            <h2>Error de Autenticación</h2>
                            <p>No se puede acceder sin iniciar sesión.</p>
                        </div>
                    `;
                    this.navigating = false;
                    return;
                }
            }
            
            const component = this.routes[path];
            const app = document.getElementById('app');
            
            if (!component) {
                console.error(`Ruta no encontrada: ${path}`);
                
                // Si estamos tratando de navegar a una ruta no encontrada y no es un bucle
                if (!isRecursiveCall) {
                    // Si la ruta que no existe es dashboard o login, mostrar error
                    if (path === 'dashboard' || path === 'login') {
                        console.error(`Error crítico: Ruta ${path} no encontrada`);
                        app.innerHTML = `
                            <div style="max-width: 400px; margin: 50px auto; padding: 20px;">
                                <h2>Error de Navegación</h2>
                                <p>La ruta "${path}" no está disponible.</p>
                                <p>Verifique que todos los componentes estén correctamente registrados.</p>
                            </div>
                        `;
                    } else if (path !== 'dashboard') {
                        // Para cualquier otra ruta no encontrada, mostrar mensaje y no redirigir
                        app.innerHTML = `
                            <div style="max-width: 400px; margin: 50px auto; padding: 20px;">
                                <h2>Ruta no encontrada</h2>
                                <p>La página "${path}" no existe.</p>
                                <button onclick="router.navigateToHome()">Ir a Inicio</button>
                            </div>
                        `;
                    }
                }
                
                this.navigating = false;
                return;
            }
            
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
                console.log(`Renderizando componente para: ${path}`);
                
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
                        <p>Ha ocurrido un error al cargar esta sección: ${error.message}</p>
                        <button class="btn btn-primary" onclick="router.navigateToHome()">Volver al Inicio</button>
                    </div>
                `;
            }
        } finally {
            // Asegurarse de resetear el flag al finalizar
            this.navigating = false;
        }
    },
    
    // Método seguro para navegar al inicio
    navigateToHome() {
        // Comprobar si dashboard existe
        if (this.routes['dashboard']) {
            this.navigate('dashboard', true);
        } else if (this.routes['login']) {
            this.navigate('login', true);
        } else {
            document.getElementById('app').innerHTML = `
                <div style="max-width: 400px; margin: 50px auto; padding: 20px;">
                    <h2>Error Crítico</h2>
                    <p>No se encontraron las rutas principales.</p>
                </div>
            `;
        }
    },
    
    // Inicializar router
    init() {
        console.log('Inicializando router');
        console.log('Rutas registradas:', Object.keys(this.routes));
        
        // Verificar rutas críticas
        if (!this.routes['dashboard']) {
            console.error('ADVERTENCIA: La ruta dashboard no está registrada');
        }
        if (!this.routes['login']) {
            console.error('ADVERTENCIA: La ruta login no está registrada');
        }
        
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
