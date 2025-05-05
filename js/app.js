// Archivo principal de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded: Iniciando aplicación');
    
    // Verificar que todos los objetos necesarios estén disponibles
    if (typeof storage === 'undefined') {
        console.error('Storage no está definido');
        return;
    }
    
    if (typeof auth === 'undefined') {
        console.error('Auth no está definido');
        return;
    }
    
    if (typeof router === 'undefined') {
        console.error('Router no está definido');
        return;
    }
    
    // Verificar componentes
    if (typeof dashboardComponent === 'undefined') {
        console.error('Componente dashboard no está definido');
    }
    if (typeof loginComponent === 'undefined') {
        console.error('Componente login no está definido');
    }
    
    // Registrar rutas
    console.log('Registrando rutas...');
    router.register('dashboard', dashboardComponent);
    router.register('requerimientos', requerimientosComponent);
    router.register('nuevo-requerimiento', nuevoRequerimientoComponent);
    router.register('cotizaciones', cotizacionesComponent);
    router.register('nueva-cotizacion', nuevaCotizacionComponent);
    router.register('clientes', clientesComponent);
    router.register('nuevo-cliente', nuevoClienteComponent);
    router.register('busqueda', busquedaComponent);
    router.register('login', loginComponent);
    // IMPORTANTE: Registrar las rutas de repuestos y locales
    router.register('repuestos', repuestosComponent);
    router.register('locales', localesComponent);
    router.register('locales-cliente', localesComponent);
    
    // Registrar rutas de edición/visualización con parámetros
    router.register('editar-cliente', clientesComponent);
    router.register('ver-requerimiento', requerimientosComponent);
    router.register('editar-requerimiento', requerimientosComponent);
    router.register('ver-cotizacion', cotizacionesComponent);
    router.register('editar-cotizacion', cotizacionesComponent);
    
    // Cargar datos de ejemplo
    cargarDatosEjemplo();
    
    // Inicializar router
    router.init();
    
    // Actualizar info de usuario
    auth.updateUserInfo();
});

// Componente Login (para completar el sistema)
const loginComponent = {
    render(container) {
        console.log('Renderizando componente login');
        
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
    
    // Modificado para ser async
    handleSubmit: async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Modificado para esperar (await) la resolución del login
        const loginSuccess = await auth.login(username, password);
        
        if (loginSuccess) {
            // Mostrar el layout principal
            document.querySelector('.user-section').style.display = 'block';
            document.querySelector('.sidebar').style.display = 'block';
            
            auth.updateUserInfo();
            router.navigate('dashboard');
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        }
    }
};

// Función para generar PDF de requerimiento (ejemplo básico)
// Modificada para ser async
async function generarPDF(reqId) {
    try {
        const requerimientos = await storage.getRequerimientos();
        const requerimiento = requerimientos.find(r => r.id === reqId);
        if (requerimiento) {
            // En una implementación real, aquí usaríamos una librería como jsPDF
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Generando PDF',
                    text: `Generando PDF para requerimiento ${reqId}...`,
                    icon: 'info',
                    showConfirmButton: false,
                    timer: 2000
                });
            } else {
                alert(`Generando PDF para requerimiento ${reqId}...\n` +
                    `Este es un ejemplo. En producción, se generaría un PDF real.`);
            }
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'No se encontró el requerimiento especificado', 'error');
            } else {
                alert('No se encontró el requerimiento especificado');
            }
        }
    } catch (error) {
        console.error('Error al generar PDF:', error);
        if (typeof Swal !== 'undefined') {
            Swal.fire('Error', 'No se pudo generar el PDF: ' + error.message, 'error');
        } else {
            alert('Error al generar el PDF: ' + error.message);
        }
    }
}

// Función para generar PDF de cotización (ejemplo básico)
// Modificada para ser async
async function generarPDFCotizacion(numero) {
    try {
        const cotizaciones = await storage.getCotizaciones();
        const cotizacion = cotizaciones.find(c => c.numero === numero);
        if (cotizacion) {
            // En una implementación real, aquí usaríamos la librería jsPDF
            if (typeof cotizacionPDF !== 'undefined' && typeof cotizacionPDF.generarPDF === 'function') {
                cotizacionPDF.generarPDF(cotizacion);
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Generando PDF',
                        text: `Generando PDF para cotización ${numero}...`,
                        icon: 'info',
                        showConfirmButton: false,
                        timer: 2000
                    });
                } else {
                    alert(`Generando PDF para cotización ${numero}...\n` +
                        `Este es un ejemplo. En producción, se generaría un PDF real.`);
                }
            }
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'No se encontró la cotización especificada', 'error');
            } else {
                alert('No se encontró la cotización especificada');
            }
        }
    } catch (error) {
        console.error('Error al generar PDF:', error);
        if (typeof Swal !== 'undefined') {
            Swal.fire('Error', 'No se pudo generar el PDF: ' + error.message, 'error');
        } else {
            alert('Error al generar el PDF: ' + error.message);
        }
    }
}

// Cargar algunos datos de ejemplo si no existen
async function cargarDatosEjemplo() {
    if (typeof storage === 'undefined') {
        console.error('Storage no está disponible para cargar datos de ejemplo');
        return;
    }
    
    try {
        // En lugar de usar getAll (que ahora hemos hecho compatible)
        // Preferimos usar los métodos directos
        const clientes = await storage.getClientes();
        
        // Si no hay clientes, agregar algunos de ejemplo
        if (clientes && clientes.length === 0) {
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
        }
        
        // Si existe la colección de locales, verificar si hay datos
        try {
            // Verificar si la función getLocales existe
            if (typeof storage.getLocales === 'function') {
                const locales = await storage.getLocales();
                
                // Si no hay locales y hay clientes, agregar algunos locales de ejemplo
                if (locales && locales.length === 0 && clientes && clientes.length > 0) {
                    console.log('Agregando locales de ejemplo...');
                    
                    // Buscar el cliente CENCOSUD
                    const cencosud = clientes.find(c => c.razonSocial.includes('CENCOSUD'));
                    if (cencosud) {
                        await storage.saveLocal({
                            clienteId: cencosud.id,
                            nombre: 'Jumbo Alto Las Condes',
                            direccion: 'Av. Kennedy 9001, Las Condes',
                            contacto: 'Carlos Pérez',
                            telefono: '229590111',
                            email: 'carlos.perez@cencosud.cl',
                            tipo: 'retail',
                            numeroCuenta: 'CEN-001',
                            numeroLocal: 'LC-101'
                        });
                    }
                    
                    // Buscar el cliente TOTTUS
                    const tottus = clientes.find(c => c.razonSocial.includes('TOTTUS'));
                    if (tottus) {
                        await storage.saveLocal({
                            clienteId: tottus.id,
                            nombre: 'Tottus Mall Plaza Oeste',
                            direccion: 'Mall Plaza Oeste, Cerrillos',
                            contacto: 'Ana Gómez',
                            telefono: '226547000',
                            email: 'ana.gomez@tottus.cl',
                            tipo: 'retail',
                            numeroCuenta: 'TOT-001',
                            numeroLocal: 'LC-201'
                        });
                    }
                }
            }
        } catch (localesError) {
            console.warn('No se pudieron cargar locales de ejemplo:', localesError);
            // No interrumpir el proceso si falla la carga de locales
        }
    } catch (error) {
        console.error('Error cargando datos de ejemplo:', error);
    }
}
