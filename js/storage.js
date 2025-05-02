// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD7wclJeO6O-9E2N3CiIFKXb_SyDgxBJdk",
    authDomain: "portal-maquipan.firebaseapp.com",
    projectId: "portal-maquipan",
    storageBucket: "portal-maquipan.firebasestorage.app",
    messagingSenderId: "186278901553",
    appId: "1:186278901553:web:67caaee4ebb6279d5ee210"
};

// Inicializar Firebase
let db;
let firebaseInitialized = false;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseInitialized = true;
    console.log('Firebase inicializado correctamente');
} catch (error) {
    console.error('Error inicializando Firebase:', error);
}

// Sistema de almacenamiento híbrido
const storage = {
    // Inicializar datos si no existen
    init() {
        if (!localStorage.getItem('maquipan_data')) {
            const initialData = {
                requerimientos: [],
                cotizaciones: [],
                clientes: [],
                usuarios: [
                    {
                        id: 1,
                        username: 'admin',
                        password: 'admin123',
                        nombre: 'Cristian Andrés Pimentel Mancilla',
                        rol: 'admin'
                    }
                ],
                config: {
                    ultimoRequerimiento: 0,
                    ultimaCotizacion: 0,
                    ultimoCliente: 0
                }
            };
            localStorage.setItem('maquipan_data', JSON.stringify(initialData));
        }
        
        // Si Firebase está disponible, sincronizar datos
        if (firebaseInitialized) {
            this.syncLocalToFirebase();
        }
    },

    // Obtener todos los datos
    async getAll() {
        if (firebaseInitialized) {
            try {
                // Obtener datos de Firebase
                const requerimientos = await this.getRequerimientosFromFirebase();
                const cotizaciones = await this.getCotizacionesFromFirebase();
                const clientes = await this.getClientesFromFirebase();
                
                // Mantener usuarios y config en local
                const localData = JSON.parse(localStorage.getItem('maquipan_data'));
                
                const data = {
                    requerimientos,
                    cotizaciones,
                    clientes,
                    usuarios: localData.usuarios,
                    config: localData.config
                };
                
                // Actualizar localStorage con datos de Firebase
                localStorage.setItem('maquipan_data', JSON.stringify(data));
                return data;
            } catch (error) {
                console.error('Error obteniendo datos de Firebase:', error);
            }
        }
        
        const data = localStorage.getItem('maquipan_data');
        return data ? JSON.parse(data) : null;
    },

    // Guardar todos los datos
    saveAll(data) {
        localStorage.setItem('maquipan_data', JSON.stringify(data));
    },

    // Requerimientos
getRequerimientos() {
    const data = JSON.parse(localStorage.getItem('maquipan_data'));
    return data ? data.requerimientos : [];
},

    async getRequerimientosFromFirebase() {
        try {
            const snapshot = await db.collection('requerimientos').get();
            const requerimientos = [];
            snapshot.forEach(doc => {
                requerimientos.push({ ...doc.data(), firebaseId: doc.id });
            });
            return requerimientos.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        } catch (error) {
            console.error('Error obteniendo requerimientos de Firebase:', error);
            return [];
        }
    },

    async saveRequerimiento(requerimiento) {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        data.config.ultimoRequerimiento++;
        requerimiento.id = 'REQ' + data.config.ultimoRequerimiento.toString().padStart(6, '0');
        data.requerimientos.unshift(requerimiento);
        this.saveAll(data);
        
        // Guardar en Firebase
        if (firebaseInitialized) {
            try {
                const docRef = await db.collection('requerimientos').add(requerimiento);
                console.log('Requerimiento guardado en Firebase:', docRef.id);
            } catch (error) {
                console.error('Error guardando requerimiento en Firebase:', error);
            }
        }
        
        return requerimiento.id;
    },

    async updateRequerimiento(id, requerimiento) {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        const index = data.requerimientos.findIndex(r => r.id === id);
        if (index !== -1) {
            data.requerimientos[index] = { ...data.requerimientos[index], ...requerimiento };
            this.saveAll(data);
            
            // Actualizar en Firebase
            if (firebaseInitialized) {
                try {
                    const snapshot = await db.collection('requerimientos')
                        .where('id', '==', id)
                        .get();
                    
                    if (!snapshot.empty) {
                        const docRef = snapshot.docs[0].ref;
                        await docRef.update(requerimiento);
                        console.log('Requerimiento actualizado en Firebase');
                    }
                } catch (error) {
                    console.error('Error actualizando requerimiento en Firebase:', error);
                }
            }
            
            return true;
        }
        return false;
    },

    // Cotizaciones
getCotizaciones() {
    const data = JSON.parse(localStorage.getItem('maquipan_data'));
    return data ? data.cotizaciones : [];
},

    async getCotizacionesFromFirebase() {
        try {
            const snapshot = await db.collection('cotizaciones').get();
            const cotizaciones = [];
            snapshot.forEach(doc => {
                cotizaciones.push({ ...doc.data(), firebaseId: doc.id });
            });
            return cotizaciones.sort((a, b) => (b.numero || '').localeCompare(a.numero || ''));
        } catch (error) {
            console.error('Error obteniendo cotizaciones de Firebase:', error);
            return [];
        }
    },

    async saveCotizacion(cotizacion) {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        data.config.ultimaCotizacion++;
        cotizacion.numero = data.config.ultimaCotizacion.toString().padStart(6, '0');
        data.cotizaciones.unshift(cotizacion);
        this.saveAll(data);
        
        // Guardar en Firebase
        if (firebaseInitialized) {
            try {
                const docRef = await db.collection('cotizaciones').add(cotizacion);
                console.log('Cotización guardada en Firebase:', docRef.id);
            } catch (error) {
                console.error('Error guardando cotización en Firebase:', error);
            }
        }
        
        return cotizacion.numero;
    },

    // Clientes
getClientes() {
    const data = JSON.parse(localStorage.getItem('maquipan_data'));
    return data ? data.clientes : [];
},

    async getClientesFromFirebase() {
        try {
            const snapshot = await db.collection('clientes').get();
            const clientes = [];
            snapshot.forEach(doc => {
                clientes.push({ ...doc.data(), firebaseId: doc.id });
            });
            return clientes;
        } catch (error) {
            console.error('Error obteniendo clientes de Firebase:', error);
            return [];
        }
    },

    async saveCliente(cliente) {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        data.config.ultimoCliente++;
        cliente.id = data.config.ultimoCliente;
        data.clientes.push(cliente);
        this.saveAll(data);
        
        // Guardar en Firebase
        if (firebaseInitialized) {
            try {
                const docRef = await db.collection('clientes').add(cliente);
                console.log('Cliente guardado en Firebase:', docRef.id);
            } catch (error) {
                console.error('Error guardando cliente en Firebase:', error);
            }
        }
        
        return cliente.id;
    },

    // Sincronizar datos locales a Firebase
    async syncLocalToFirebase() {
        if (!firebaseInitialized) return;
        
        try {
            const data = JSON.parse(localStorage.getItem('maquipan_data'));
            
            // Sincronizar requerimientos
            for (const req of data.requerimientos) {
                const snapshot = await db.collection('requerimientos')
                    .where('id', '==', req.id)
                    .get();
                
                if (snapshot.empty) {
                    await db.collection('requerimientos').add(req);
                }
            }
            
            // Sincronizar cotizaciones
            for (const cot of data.cotizaciones) {
                const snapshot = await db.collection('cotizaciones')
                    .where('numero', '==', cot.numero)
                    .get();
                
                if (snapshot.empty) {
                    await db.collection('cotizaciones').add(cot);
                }
            }
            
            // Sincronizar clientes
            for (const cli of data.clientes) {
                const snapshot = await db.collection('clientes')
                    .where('id', '==', cli.id)
                    .get();
                
                if (snapshot.empty) {
                    await db.collection('clientes').add(cli);
                }
            }
            
            console.log('Datos sincronizados con Firebase');
        } catch (error) {
            console.error('Error sincronizando con Firebase:', error);
        }
    },

    // Métodos restantes sin cambios...
    updateCotizacion(numero, cotizacion) {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        const index = data.cotizaciones.findIndex(c => c.numero === numero);
        if (index !== -1) {
            data.cotizaciones[index] = { ...data.cotizaciones[index], ...cotizacion };
            this.saveAll(data);
            return true;
        }
        return false;
    },

    updateCliente(id, cliente) {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        const index = data.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            data.clientes[index] = { ...data.clientes[index], ...cliente };
            this.saveAll(data);
            return true;
        }
        return false;
    },

    getUsuarios() {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        return data ? data.usuarios : [];
    },

    search(type, query) {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        query = query.toLowerCase();
        
        switch(type) {
            case 'requerimiento':
                return data.requerimientos.filter(r => 
                    r.id.toLowerCase().includes(query) ||
                    r.cliente.toLowerCase().includes(query) ||
                    r.tecnico.toLowerCase().includes(query)
                );
            case 'cotizacion':
                return data.cotizaciones.filter(c => 
                    c.numero.toLowerCase().includes(query) ||
                    c.cliente.toLowerCase().includes(query)
                );
            case 'cliente':
                return data.clientes.filter(c => 
                    c.rut.toLowerCase().includes(query) ||
                    c.razonSocial.toLowerCase().includes(query)
                );
            default:
                return [];
        }
    },

    getDashboardStats() {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        return {
            requerimientosPendientes: data.requerimientos.filter(r => r.estado === 'Pendiente').length,
            cotizacionesActivas: data.cotizaciones.filter(c => c.estado === 'Activa').length,
            serviciosCompletados: data.requerimientos.filter(r => r.estado === 'Completado').length,
            clientesActivos: data.clientes.length
        };
    }
};

// Inicializar storage cuando se carga el script
storage.init();

// Hacer storage disponible globalmente
window.storage = storage;

console.log('Storage con Firebase inicializado correctamente');
