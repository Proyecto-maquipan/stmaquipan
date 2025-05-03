// Storage.js - Sistema de almacenamiento con Firebase

// Usar la instancia de Firebase ya inicializada
// En lugar de declarar nuevamente 'db', usamos firebase.firestore() directamente
let firebaseInitialized = false;
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 5;

// Intentamos obtener la instancia de Firestore
function initStorage() {
    try {
        // Verificar que Firebase y Firestore estén disponibles
        if (typeof firebase !== 'undefined' && 
            typeof firebase.firestore === 'function' &&
            firebase.apps && firebase.apps.length > 0) {
            
            firebaseInitialized = true;
            console.log('Storage con Firebase inicializado correctamente');
            
            // Ahora que Firebase está inicializado, podemos inicializar el storage
            storage.init();
        } else {
            initAttempts++;
            if (initAttempts <= MAX_INIT_ATTEMPTS) {
                console.warn(`Intento ${initAttempts}/${MAX_INIT_ATTEMPTS}: Firebase no está completamente disponible, reintentando...`);
                setTimeout(initStorage, 1000);
            } else {
                console.error('No se pudo inicializar Firebase después de múltiples intentos. Ejecutando en modo offline.');
                // Mostrar mensaje al usuario
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Error de conexión',
                        text: 'No se pudo conectar con la base de datos. Algunas funciones estarán limitadas.',
                        icon: 'warning',
                        confirmButtonText: 'Entendido'
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error accediendo a Firebase en storage.js:', error);
        initAttempts++;
        if (initAttempts <= MAX_INIT_ATTEMPTS) {
            setTimeout(initStorage, 1000);
        } else {
            console.error('No se pudo inicializar Firebase después de múltiples intentos debido a errores.');
        }
    }
}

// Sistema de almacenamiento con Firebase
const storage = {
    // Inicializar datos si es necesario
    async init() {
        if (!firebaseInitialized) {
            console.error('Firebase no está inicializado correctamente');
            return;
        }
        
        try {
            // Verificar si existen usuarios administradores
            const usuariosSnapshot = await firebase.firestore().collection('usuarios').where('rol', '==', 'admin').get();
            
            // Si no hay usuarios, crear uno por defecto
            if (usuariosSnapshot.empty) {
                await firebase.firestore().collection('usuarios').add({
                    username: 'admin',
                    password: 'admin123',
                    nombre: 'Cristian Andrés Pimentel Mancilla',
                    rol: 'admin',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('Usuario administrador por defecto creado');
            }
        } catch (error) {
            console.error('Error en storage.init:', error);
        }
    },

    // Método de compatibilidad para app.js
    async getAll() {
        if (!firebaseInitialized) return {
            requerimientos: [],
            cotizaciones: [],
            clientes: [],
            usuarios: [{
                id: 1,
                username: 'admin',
                password: 'admin123',
                nombre: 'Cristian Andrés Pimentel Mancilla',
                rol: 'admin'
            }],
            config: {
                ultimoRequerimiento: 0,
                ultimaCotizacion: 0,
                ultimoCliente: 0
            }
        };
        
        try {
            const requerimientos = await this.getRequerimientos();
            const cotizaciones = await this.getCotizaciones();
            const clientes = await this.getClientes();
            const usuarios = await this.getUsuarios();
            
            return {
                requerimientos,
                cotizaciones, 
                clientes,
                usuarios,
                config: {
                    ultimoRequerimiento: 1000,
                    ultimaCotizacion: 1000,
                    ultimoCliente: 1000
                }
            };
        } catch (error) {
            console.error('Error en getAll:', error);
            return {
                requerimientos: [],
                cotizaciones: [],
                clientes: [],
                usuarios: [{
                    id: 1,
                    username: 'admin',
                    password: 'admin123',
                    nombre: 'Cristian Andrés Pimentel Mancilla',
                    rol: 'admin'
                }],
                config: {
                    ultimoRequerimiento: 0,
                    ultimaCotizacion: 0,
                    ultimoCliente: 0
                }
            };
        }
    },

    // Requerimientos
    async getRequerimientos() {
        if (!firebaseInitialized) return [];
        
        try {
            const snapshot = await firebase.firestore().collection('requerimientos').get();
            const requerimientos = [];
            snapshot.forEach(doc => {
                requerimientos.push({ ...doc.data(), id: doc.id });
            });
            return requerimientos.sort((a, b) => (b.numero || '').localeCompare(a.numero || ''));
        } catch (error) {
            console.error('Error obteniendo requerimientos:', error);
            return [];
        }
    },

    async saveRequerimiento(requerimiento) {
        if (!firebaseInitialized) return null;
        
        try {
            // Generar número secuencial
            const counterRef = firebase.firestore().collection('counters').doc('requerimiento');
            const counterDoc = await counterRef.get();
            
            let nextNumber = 1000;
            if (counterDoc.exists) {
                nextNumber = counterDoc.data().value + 1;
                await counterRef.update({ value: nextNumber });
            } else {
                await counterRef.set({ value: nextNumber });
            }
            
            // Cambio: usar concatenación regular en lugar de template literals
            requerimiento.numero = "REQ-" + nextNumber;
            requerimiento.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            const docRef = await firebase.firestore().collection('requerimientos').add(requerimiento);
            
            // Actualizar con el ID
            await docRef.update({ id: docRef.id });
            
            return requerimiento.numero;
        } catch (error) {
            console.error('Error guardando requerimiento:', error);
            return null;
        }
    },

    async updateRequerimiento(id, requerimiento) {
        if (!firebaseInitialized) return false;
        
        try {
            requerimiento.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await firebase.firestore().collection('requerimientos').doc(id).update(requerimiento);
            return true;
        } catch (error) {
            console.error('Error actualizando requerimiento:', error);
            return false;
        }
    },

    // Cotizaciones
    async getCotizaciones() {
        if (!firebaseInitialized) return [];
        
        try {
            const snapshot = await firebase.firestore().collection('cotizaciones').get();
            const cotizaciones = [];
            snapshot.forEach(doc => {
                cotizaciones.push({ ...doc.data(), id: doc.id });
            });
            return cotizaciones.sort((a, b) => (b.numero || '').localeCompare(a.numero || ''));
        } catch (error) {
            console.error('Error obteniendo cotizaciones:', error);
            return [];
        }
    },

    async saveCotizacion(cotizacion) {
        if (!firebaseInitialized) return null;
        
        try {
            // Generar número secuencial
            const counterRef = firebase.firestore().collection('counters').doc('cotizacion');
            const counterDoc = await counterRef.get();
            
            let nextNumber = 1000;
            if (counterDoc.exists) {
                nextNumber = counterDoc.data().value + 1;
                await counterRef.update({ value: nextNumber });
            } else {
                await counterRef.set({ value: nextNumber });
            }
            
            // Cambio: usar concatenación regular en lugar de template literals
            cotizacion.numero = "COT-" + nextNumber;
            cotizacion.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            const docRef = await firebase.firestore().collection('cotizaciones').add(cotizacion);
            
            // Actualizar con el ID
            await docRef.update({ id: docRef.id });
            
            return cotizacion.numero;
        } catch (error) {
            console.error('Error guardando cotización:', error);
            return null;
        }
    },

    async updateCotizacion(id, cotizacion) {
        if (!firebaseInitialized) return false;
        
        try {
            cotizacion.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await firebase.firestore().collection('cotizaciones').doc(id).update(cotizacion);
            return true;
        } catch (error) {
            console.error('Error actualizando cotización:', error);
            return false;
        }
    },

    // Clientes
    async getClientes() {
        if (!firebaseInitialized) return [];
        
        try {
            const snapshot = await firebase.firestore().collection('clientes').get();
            const clientes = [];
            snapshot.forEach(doc => {
                clientes.push({ ...doc.data(), id: doc.id });
            });
            return clientes;
        } catch (error) {
            console.error('Error obteniendo clientes:', error);
            return [];
        }
    },

    async saveCliente(cliente) {
        if (!firebaseInitialized) return null;
        
        try {
            // Generar código secuencial
            const counterRef = firebase.firestore().collection('counters').doc('cliente');
            const counterDoc = await counterRef.get();
            
            let nextNumber = 1000;
            if (counterDoc.exists) {
                nextNumber = counterDoc.data().value + 1;
                await counterRef.update({ value: nextNumber });
            } else {
                await counterRef.set({ value: nextNumber });
            }
            
            // Cambio: usar concatenación regular en lugar de template literals
            cliente.codigo = "CLI-" + nextNumber;
            cliente.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            const docRef = await firebase.firestore().collection('clientes').add(cliente);
            
            // Actualizar con el ID
            await docRef.update({ id: docRef.id });
            
            return cliente.codigo;
        } catch (error) {
            console.error('Error guardando cliente:', error);
            return null;
        }
    },

    async updateCliente(id, cliente) {
        if (!firebaseInitialized) return false;
        
        try {
            cliente.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await firebase.firestore().collection('clientes').doc(id).update(cliente);
            return true;
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            return false;
        }
    },

    async deleteCliente(id) {
        if (!firebaseInitialized) return false;
        
        try {
            await firebase.firestore().collection('clientes').doc(id).delete();
            return true;
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            return false;
        }
    },

    // Búsqueda
    async search(type, query) {
        if (!firebaseInitialized) return [];
        
        try {
            query = query.toLowerCase();
            let results = [];
            
            switch(type) {
                case 'requerimiento':
                    const requerimientos = await this.getRequerimientos();
                    results = requerimientos.filter(r => 
                        (r.numero && r.numero.toLowerCase().includes(query)) ||
                        (r.cliente && r.cliente.toLowerCase().includes(query)) ||
                        (r.tecnico && r.tecnico.toLowerCase().includes(query))
                    );
                    break;
                    
                case 'cotizacion':
                    const cotizaciones = await this.getCotizaciones();
                    results = cotizaciones.filter(c => 
                        (c.numero && c.numero.toLowerCase().includes(query)) ||
                        (c.cliente && c.cliente.toLowerCase().includes(query))
                    );
                    break;
                    
                case 'cliente':
                    const clientes = await this.getClientes();
                    results = clientes.filter(c => 
                        (c.rut && c.rut.toLowerCase().includes(query)) ||
                        (c.razonSocial && c.razonSocial.toLowerCase().includes(query)) ||
                        (c.contacto && c.contacto.toLowerCase().includes(query))
                    );
                    break;
            }
            
            return results;
        } catch (error) {
            console.error('Error realizando búsqueda:', error);
            return [];
        }
    },

    // Estadísticas para el dashboard
    async getDashboardStats() {
        if (!firebaseInitialized) return {};
        
        try {
            const requerimientosSnapshot = await firebase.firestore().collection('requerimientos').get();
            const cotizacionesSnapshot = await firebase.firestore().collection('cotizaciones').get();
            const clientesSnapshot = await firebase.firestore().collection('clientes').get();
            
            const requerimientos = [];
            requerimientosSnapshot.forEach(doc => requerimientos.push(doc.data()));
            
            const cotizaciones = [];
            cotizacionesSnapshot.forEach(doc => cotizaciones.push(doc.data()));
            
            return {
                requerimientosPendientes: requerimientos.filter(r => r.estado === 'Pendiente').length,
                cotizacionesActivas: cotizaciones.filter(c => c.estado === 'Activa').length,
                serviciosCompletados: requerimientos.filter(r => r.estado === 'Completado').length,
                clientesActivos: clientesSnapshot.size
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                requerimientosPendientes: 0,
                cotizacionesActivas: 0,
                serviciosCompletados: 0,
                clientesActivos: 0
            };
        }
    },

    // Usuarios
    async getUsuarios() {
        if (!firebaseInitialized) return [];
        
        try {
            const snapshot = await firebase.firestore().collection('usuarios').get();
            const usuarios = [];
            snapshot.forEach(doc => {
                usuarios.push({ ...doc.data(), id: doc.id });
            });
            return usuarios;
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            return [];
        }
    }
};

// Hacer storage disponible globalmente
window.storage = storage;

// Inicializar storage cuando Firebase esté disponible
setTimeout(initStorage, 500);
