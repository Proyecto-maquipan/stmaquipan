// Archivo principal de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando aplicación...');
    
    // Inicializar la aplicación cuando todo esté listo
    initApp();
});

// Inicializar la aplicación de manera segura
async function initApp() {
    console.log('Iniciando aplicación...');
    
    try {
        // Esperar a que todas las dependencias estén disponibles
        await waitForDependencies();
        
        console.log('Todas las dependencias están disponibles, configurando la aplicación...');
        
        // Registrar rutas
        router.register('dashboard', dashboardComponent);
        router.register('requerimientos', requerimientosComponent);
        router.register('nuevo-requerimiento', nuevoRequerimientoComponent);
        router.register('cotizaciones', cotizacionesComponent);
        router.register('nueva-cotizacion', nuevaCotizacionComponent);
        router.register('clientes', clientesComponent);
        router.register('nuevo-cliente', nuevoClienteComponent);
        router.register('busqueda', busquedaComponent);
        router.register('login', loginComponent);
        router.register('repuestos', repuestosComponent);
        
        // Cargar datos de ejemplo
        await cargarDatosEjemplo();
        
        // Inicializar router
        router.init();
        
        // Actualizar info de usuario
        auth.updateUserInfo();
        
        console.log('Aplicación inicializada exitosamente');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
}

// Función para esperar a que todas las dependencias estén disponibles
function waitForDependencies() {
    return new Promise((resolve, reject) => {
        function checkDeps() {
            // Verificar que las dependencias principales estén disponibles
            if (typeof window.storage === 'undefined' || 
                typeof window.auth === 'undefined' || 
                typeof window.router === 'undefined') {
                
                console.log('Esperando dependencias...');
                setTimeout(checkDeps, 500);
                return;
            }
            
            // Verificar que Firebase esté inicializado en storage
            if (typeof window.storage.isInitialized === 'function' && !window.storage.isInitialized()) {
                console.log('Esperando inicialización de Firebase...');
                
                // Esperar a que storage termine de inicializarse
                window.storage.waitForInitialization()
                    .then(() => {
                        console.log('Firebase inicializado correctamente');
                        resolve();
                    })
                    .catch(reject);
                return;
            }
            
            // Todo está disponible
            resolve();
        }
        
        // Comenzar a verificar dependencias
        checkDeps();
    });
}

// Componente Login
const loginComponent = {
    render(container) {
        // Ocultar el layout principal si no está autenticado
        document.querySelector('.user-section').style.display = 'none';
        document.querySelector('.sidebar').style.display = 'none';
        
        container.innerHTML = `
            <div style="max-width: 400px; margin: 50px auto; padding: 20px;">
                <h2>Iniciar Sesión</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label>Usuario:</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label>Contraseña:</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Ingresar</button>
                </form>
                <p style="margin-top: 20px; color: #666;">
                    Usuario de prueba: admin / admin123
                </p>
            </div>
        `;
        
        // Agregar event listener al formulario
        setTimeout(() => {
            const form = document.getElementById('loginForm');
            if (form) {
                form.addEventListener('submit', this.handleSubmit);
            }
        }, 0);
    },
    
    handleSubmit(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (auth.login(username, password)) {
            // Mostrar el layout principal
            document.querySelector('.user-section').style.display = 'block';
            document.querySelector('.sidebar').style.display = 'block';
            
            auth.updateUserInfo();
            router.navigate('dashboard');
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    }
};

// Función para generar PDF de requerimiento (ejemplo básico)
async function generarPDF(reqId) {
    try {
        const requerimientos = await storage.getRequerimientos();
        const requerimiento = requerimientos.find(r => r.id === reqId);
        if (requerimiento) {
            // En una implementación real, aquí usaríamos una librería como jsPDF
            alert(`Generando PDF para requerimiento ${reqId}...\n` +
                  `Este es un ejemplo. En producción, se generaría un PDF real.`);
        } else {
            alert(`No se encontró el requerimiento con ID: ${reqId}`);
        }
    } catch (error) {
        console.error('Error al generar PDF de requerimiento:', error);
        alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
    }
}

// Función para generar PDF de cotización (ejemplo básico)
async function generarPDFCotizacion(numero) {
    try {
        const cotizaciones = await storage.getCotizaciones();
        const cotizacion = cotizaciones.find(c => c.numero === numero);
        if (cotizacion) {
            // En una implementación real, aquí usaríamos una librería como jsPDF
            alert(`Generando PDF para cotización ${numero}...\n` +
                  `Este es un ejemplo. En producción, se generaría un PDF real.`);
        } else {
            alert(`No se encontró la cotización con número: ${numero}`);
        }
    } catch (error) {
        console.error('Error al generar PDF de cotización:', error);
        alert('Error al generar el PDF. Por favor, inténtelo de nuevo.');
    }
}

// Cargar algunos datos de ejemplo si no existen
async function cargarDatosEjemplo() {
    console.log('Verificando si hay datos de ejemplo...');
    
    try {
        // Esperar a que Firebase esté inicializado si es necesario
        if (typeof storage.isInitialized === 'function' && !storage.isInitialized()) {
            console.log('Esperando inicialización de Firebase para cargar datos de ejemplo...');
            await storage.waitForInitialization();
        }
        
        // Obtener clientes existentes
        const clientes = await storage.getClientes();
        
        // Si no hay clientes, agregar algunos de ejemplo
        if (clientes && clientes.length === 0) {
            console.log('No se encontraron clientes, agregando datos de ejemplo...');
            
            try {
                await storage.saveCliente({
                    rut: '81201000-K',
                    razonSocial: 'CENCOSUD RETAIL S.A.',
                    direccion: 'AV. KENNEDY N°9001, 5 PISO',
                    ciudad: 'SANTIAGO',
                    contacto: 'LUIS VALENZUELA',
                    telefono: '229590555',
                    email: 'luis.valenzuela@cencosud.cl'
                });
                
                await storage.saveCliente({
                    rut: '86627700-5',
                    razonSocial: 'HIPERMERCADO TOTTUS S.A.',
                    direccion: 'MALL PLAZA OESTE',
                    ciudad: 'SANTIAGO',
                    contacto: 'MARIA GONZALEZ',
                    telefono: '226547890',
                    email: 'maria.gonzalez@tottus.cl'
                });
                
                console.log('Datos de ejemplo agregados correctamente');
            } catch (saveError) {
                console.error('Error al guardar clientes de ejemplo:', saveError);
            }
        } else {
            console.log('Ya existen clientes en la base de datos');
        }
    } catch (error) {
        console.error('Error cargando datos de ejemplo:', error);
    }
}
