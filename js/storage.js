// Storage.js - Sistema de almacenamiento con Firebase

// Variables globales para Firebase (usando window para evitar redeclaraciones)
window.db = window.db || null;
window.firebaseInitialized = window.firebaseInitialized || false;

// Sistema de almacenamiento con Firebase
const storage = {
    // Inicializar Firebase y configurar listeners
    async init() {
        try {
            if (!window.db && typeof firebase !== 'undefined') {
                window.db = firebase.firestore();
                window.firebaseInitialized = true;
                console.log('Storage con Firebase inicializado correctamente');
                
                // Verificar si existen usuarios administradores
                const usuariosSnapshot = await window.db.collection('usuarios').where('rol', '==', 'admin').get();
                
                // Si no hay usuarios, crear uno por defecto
                if (usuariosSnapshot.empty) {
                    await window.db.collection('usuarios').add({
                        username: 'admin',
                        password: 'admin123',
                        nombre: 'Cristian Andrés Pimentel Mancilla',
                        rol: 'admin',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('Usuario administrador por defecto creado');
                }
                
                // Notificar que storage está listo
                if (typeof window.onStorageReady === 'function') {
                    window.onStorageReady();
                }
            }
        } catch (error) {
            console.error('Error al inicializar storage:', error);
            
            // Intentar nuevamente en 1 segundo
            setTimeout(() => this.init(), 1000);
        }
    },

    // Método de compatibilidad para app.js
    async getAll() {
        if (!window.firebaseInitialized) return {
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

    // Verificar si Firebase está inicializado
    isInitialized() {
        return window.firebaseInitialized;
    },

    // Esperar a que Firebase esté inicializado
    waitForInitialization() {
        return new Promise((resolve) => {
            if (window.firebaseInitialized) {
                resolve();
            } else {
                // Definir una función que se llamará cuando storage esté listo
                window.onStorageReady = function() {
                    resolve();
                };
            }
        });
    },

    // Requerimientos
    async getRequerimientos() {
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            const snapshot = await window.db.collection('requerimientos').get();
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
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Generar número secuencial
            const counterRef = window.db.collection('counters').doc('requerimiento');
            const counterDoc = await counterRef.get();
            
            let nextNumber = 1000;
            if (counterDoc.exists) {
                nextNumber = counterDoc.data().value + 1;
                await counterRef.update({ value: nextNumber });
            } else {
                await counterRef.set({ value: nextNumber });
            }
            
            requerimiento.numero = `REQ-${nextNumber}`;
            requerimiento.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            const docRef = await window.db.collection('requerimientos').add(requerimiento);
            
            // Actualizar con el ID
            await docRef.update({ id: docRef.id });
            
            return requerimiento.numero;
        } catch (error) {
            console.error('Error guardando requerimiento:', error);
            return Promise.reject(error);
        }
    },

    async updateRequerimiento(id, requerimiento) {
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            requerimiento.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await window.db.collection('requerimientos').doc(id).update(requerimiento);
            return true;
        } catch (error) {
            console.error('Error actualizando requerimiento:', error);
            return Promise.reject(error);
        }
    },

    // Cotizaciones
    async getCotizaciones() {
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            const snapshot = await window.db.collection('cotizaciones').get();
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
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Generar número secuencial
            const counterRef = window.db.collection('counters').doc('cotizacion');
            const counterDoc = await counterRef.get();
            
            let nextNumber = 1000;
            if (counterDoc.exists) {
                nextNumber = counterDoc.data().value + 1;
                await counterRef.update({ value: nextNumber });
            } else {
                await counterRef.set({ value: nextNumber });
            }
            
            cotizacion.numero = `COT-${nextNumber}`;
            cotizacion.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            const docRef = await window.db.collection('cotizaciones').add(cotizacion);
            
            // Actualizar con el ID
            await docRef.update({ id: docRef.id });
            
            return cotizacion.numero;
        } catch (error) {
            console.error('Error guardando cotización:', error);
            return Promise.reject(error);
        }
    },

    async updateCotizacion(id, cotizacion) {
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            cotizacion.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await window.db.collection('cotizaciones').doc(id).update(cotizacion);
            return true;
        } catch (error) {
            console.error('Error actualizando cotización:', error);
            return Promise.reject(error);
        }
    },

    // Clientes
    async getClientes() {
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            const snapshot = await window.db.collection('clientes').get();
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
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            // Generar código secuencial
            const counterRef = window.db.collection('counters').doc('cliente');
            const counterDoc = await counterRef.get();
            
            let nextNumber = 1000;
            if (counterDoc.exists) {
                nextNumber = counterDoc.data().value + 1;
                await counterRef.update({ value: nextNumber });
            } else {
                await counterRef.set({ value: nextNumber });
            }
            
            cliente.codigo = `CLI-${nextNumber}`;
            cliente.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            
            const docRef = await window.db.collection('clientes').add(cliente);
            
            // Actualizar con el ID
            await docRef.update({ id: docRef.id });
            
            return cliente.codigo;
        } catch (error) {
            console.error('Error guardando cliente:', error);
            return Promise.reject(error);
        }
    },

    async updateCliente(id, cliente) {
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            cliente.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await window.db.collection('clientes').doc(id).update(cliente);
            return true;
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            return Promise.reject(error);
        }
    },

    async deleteCliente(id) {
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            await window.db.collection('clientes').doc(id).delete();
            return true;
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            return Promise.reject(error);
        }
    },

    // Búsqueda
    async search(type, query) {
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
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
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            const requerimientosSnapshot = await window.db.collection('requerimientos').get();
            const cotizacionesSnapshot = await window.db.collection('cotizaciones').get();
            const clientesSnapshot = await window.db.collection('clientes').get();
            
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
        // Esperar a que Firebase esté inicializado
        if (!window.firebaseInitialized) {
            await this.waitForInitialization();
        }
        
        try {
            const snapshot = await window.db.collection('usuarios').get();
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

// Inicializar storage
storage.init();
