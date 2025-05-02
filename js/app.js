```javascript
// Archivo principal de la aplicación simplificado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, esperando componentes...');
    
    // Esperar a que los componentes estén disponibles
    setTimeout(checkComponentesDisponibles, 1000);
});

// Verificar que los componentes estén disponibles
function checkComponentesDisponibles() {
    if (typeof window.router === 'undefined' || 
        typeof window.storage === 'undefined' || 
        typeof window.auth === 'undefined') {
        console.log('Esperando a que los componentes estén disponibles...');
        setTimeout(checkComponentesDisponibles, 1000);
        return;
    }
    
    console.log('Componentes disponibles, inicializando app...');
    inicializarApp();
}

// Inicializar la aplicación
function inicializarApp() {
    try {
        // Registrar rutas
        if (typeof dashboardComponent !== 'undefined')
            router.register('dashboard', dashboardComponent);
            
        if (typeof loginComponent !== 'undefined')
            router.register('login', loginComponent);
            
        if (typeof requerimientosComponent !== 'undefined')
            router.register('requerimientos', requerimientosComponent);
            
        if (typeof nuevoRequerimientoComponent !== 'undefined')
            router.register('nuevo-requerimiento', nuevoRequerimientoComponent);
        
        // Registrar otras rutas según sea necesario
        
        // Inicializar router
        router.init();
        
        // Cargar datos de ejemplo más tarde
        setTimeout(cargarDatosEjemplo, 3000);
        
        console.log('Aplicación inicializada correctamente');
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
    }
}

// Función para cargar datos de ejemplo
async function cargarDatosEjemplo() {
    try {
        console.log('Verificando si se deben cargar datos de ejemplo...');
        
        if (!window.storage.isInitialized()) {
            console.log('Firebase aún no está inicializado, posponiendo carga de datos...');
            setTimeout(cargarDatosEjemplo, 2000);
            return;
        }
        
        const clientes = await storage.getClientes();
        
        if (clientes && clientes.length === 0) {
            console.log('No hay clientes, agregando datos de ejemplo...');
            
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
                
                console.log('Cliente de ejemplo agregado correctamente');
            } catch (saveError) {
                console.error('Error guardando cliente de ejemplo:', saveError);
            }
        } else {
            console.log(`Ya existen ${clientes.length} clientes en la base de datos`);
        }
    } catch (error) {
        console.error('Error verificando datos de ejemplo:', error);
    }
}

// Función para generar PDF
async function generarPDF(reqId) {
    try {
        const requerimientos = await storage.getRequerimientos();
        const requerimiento = requerimientos.find(r => r.id === reqId);
        
        if (requerimiento) {
            alert(`Generando PDF para requerimiento ${reqId}...`);
        } else {
            alert(`No se encontró el requerimiento con ID ${reqId}`);
        }
    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('Error generando PDF');
    }
}
```
