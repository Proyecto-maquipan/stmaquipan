// Archivo principal de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que los componentes principales estén disponibles
    checkDependencies();
});

// Función para verificar que las dependencias estén cargadas
function checkDependencies() {
    if (typeof storage === 'undefined' || typeof auth === 'undefined' || typeof router === 'undefined') {
        console.log('Esperando a que se carguen todas las dependencias...');
        setTimeout(checkDependencies, 500);
        return;
    }
    
    console.log('Todas las dependencias están cargadas, iniciando aplicación');
    initApp();
}

// Inicializar la aplicación cuando todas las dependencias estén disponibles
function initApp() {
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
    // IMPORTANTE: Registrar la ruta de repuestos
    router.register('repuestos', repuestosComponent);
    
    // Cargar datos de ejemplo
    cargarDatosEjemplo();
    
    // Inicializar router
    router.init();
    
    // Actualizar info de usuario
    auth.updateUserInfo();
}

// Componente Login (para completar el sistema)
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
// CORREGIDO: Añadida la palabra clave async
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
        alert('Error al generar el PDF. Consulte la consola para más detalles.');
    }
}

// Función para generar PDF de cotización (ejemplo básico)
// CORREGIDO: Añadida la palabra clave async
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
        alert('Error al generar el PDF. Consulte la consola para más detalles.');
    }
}

// Cargar algunos datos de ejemplo si no existen
async function cargarDatosEjemplo() {
    try {
        // En lugar de usar getAll (que ahora hemos hecho compatible)
        // Preferimos usar los métodos directos
        const clientes = await storage.getClientes();
        
        // Si no hay clientes, agregar algunos de ejemplo
        if (clientes && clientes.length === 0) {
            console.log('No se encontraron clientes, agregando ejemplos...');
            
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
                
                console.log('Datos de ejemplo cargados correctamente');
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
