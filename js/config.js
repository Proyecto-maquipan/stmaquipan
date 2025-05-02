// Configuración global de la aplicación
const config = {
    appName: 'Portal Maquipan',
    version: '1.0.0',
    
    // Opciones de estado para requerimientos
    estadosRequerimiento: ['Pendiente', 'En Proceso', 'Completado', 'Cancelado'],
    
    // Opciones de estado para cotizaciones
    estadosCotizacion: ['Activa', 'Aprobada', 'Rechazada', 'Vencida'],
    
    // Técnicos disponibles
    tecnicos: [
        'MORALES LIZAMA HUGO HERNAN',
        'JUAN PEREZ',
        'PEDRO GONZALEZ',
        'MARIA RODRIGUEZ',
        'CARLOS LOPEZ'
    ],
    
    // Configuración de IVA
    iva: 0.19,
    
    // Formato de fecha
    formatoFecha: (fecha) => {
        return new Date(fecha).toLocaleDateString('es-CL');
    },
    
    // Formato de moneda
    formatoMoneda: (valor) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(valor);
    }
};
