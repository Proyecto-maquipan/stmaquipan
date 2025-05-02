// firebase-config.js
// Configuración de Firebase para Portal Maquipan

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
firebase.initializeApp(firebaseConfig);

// Referencias a la base de datos
const db = firebase.firestore();

// Colecciones
const COLLECTIONS = {
    REQUERIMIENTOS: 'requerimientos',
    COTIZACIONES: 'cotizaciones',
    CLIENTES: 'clientes',
    USERS: 'users',
    COUNTERS: 'counters'
};

// Servicio de sincronización con Firebase
const FirebaseService = {
    // Inicializar contadores
    async initCounters() {
        const counters = ['requerimiento', 'cliente', 'cotizacion'];
        
        for (const counter of counters) {
            const doc = await db.collection(COLLECTIONS.COUNTERS).doc(counter).get();
            if (!doc.exists) {
                await db.collection(COLLECTIONS.COUNTERS).doc(counter).set({ value: 1000 });
            }
        }
    },

    // Obtener siguiente número de contador
    async getNextCounter(type) {
        const counterRef = db.collection(COLLECTIONS.COUNTERS).doc(type);
        
        try {
            const result = await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(counterRef);
                if (!doc.exists) {
                    throw new Error('Counter does not exist!');
                }
                
                const newValue = doc.data().value + 1;
                transaction.update(counterRef, { value: newValue });
                return newValue;
            });
            
            return result;
        } catch (error) {
            console.error('Error getting next counter:', error);
            throw error;
        }
    },

    // CRUD para Requerimientos
    async saveRequerimiento(requerimiento) {
        try {
            if (!requerimiento.numero) {
                const nextNumber = await this.getNextCounter('requerimiento');
                requerimiento.numero = `REQ-${nextNumber}`;
            }
            
            const docRef = await db.collection(COLLECTIONS.REQUERIMIENTOS).add(requerimiento);
            requerimiento.id = docRef.id;
            
            // Actualizar con el ID
            await docRef.update({ id: docRef.id });
            
            return requerimiento;
        } catch (error) {
            console.error('Error saving requerimiento:', error);
            throw error;
        }
    },

    async getRequerimientos() {
        try {
            const snapshot = await db.collection(COLLECTIONS.REQUERIMIENTOS).get();
            return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } catch (error) {
            console.error('Error getting requerimientos:', error);
            throw error;
        }
    },

    async updateRequerimiento(id, data) {
        try {
            await db.collection(COLLECTIONS.REQUERIMIENTOS).doc(id).update(data);
            return { ...data, id };
        } catch (error) {
            console.error('Error updating requerimiento:', error);
            throw error;
        }
    },

    async deleteRequerimiento(id) {
        try {
            await db.collection(COLLECTIONS.REQUERIMIENTOS).doc(id).delete();
        } catch (error) {
            console.error('Error deleting requerimiento:', error);
            throw error;
        }
    },

    // CRUD para Cotizaciones
    async saveCotizacion(cotizacion) {
        try {
            if (!cotizacion.numero) {
                const nextNumber = await this.getNextCounter('cotizacion');
                cotizacion.numero = `COT-${nextNumber}`;
            }
            
            const docRef = await db.collection(COLLECTIONS.COTIZACIONES).add(cotizacion);
            cotizacion.id = docRef.id;
            
            await docRef.update({ id: docRef.id });
            
            return cotizacion;
        } catch (error) {
            console.error('Error saving cotizacion:', error);
            throw error;
        }
    },

    async getCotizaciones() {
        try {
            const snapshot = await db.collection(COLLECTIONS.COTIZACIONES).get();
            return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } catch (error) {
            console.error('Error getting cotizaciones:', error);
            throw error;
        }
    },

    async updateCotizacion(id, data) {
        try {
            await db.collection(COLLECTIONS.COTIZACIONES).doc(id).update(data);
            return { ...data, id };
        } catch (error) {
            console.error('Error updating cotizacion:', error);
            throw error;
        }
    },

    async deleteCotizacion(id) {
        try {
            await db.collection(COLLECTIONS.COTIZACIONES).doc(id).delete();
        } catch (error) {
            console.error('Error deleting cotizacion:', error);
            throw error;
        }
    },

    // CRUD para Clientes
    async saveCliente(cliente) {
        try {
            if (!cliente.codigo) {
                const nextNumber = await this.getNextCounter('cliente');
                cliente.codigo = `CLI-${nextNumber}`;
            }
            
            const docRef = await db.collection(COLLECTIONS.CLIENTES).add(cliente);
            cliente.id = docRef.id;
            
            await docRef.update({ id: docRef.id });
            
            return cliente;
        } catch (error) {
            console.error('Error saving cliente:', error);
            throw error;
        }
    },

    async getClientes() {
        try {
            const snapshot = await db.collection(COLLECTIONS.CLIENTES).get();
            return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } catch (error) {
            console.error('Error getting clientes:', error);
            throw error;
        }
    },

    async updateCliente(id, data) {
        try {
            await db.collection(COLLECTIONS.CLIENTES).doc(id).update(data);
            return { ...data, id };
        } catch (error) {
            console.error('Error updating cliente:', error);
            throw error;
        }
    },

    async deleteCliente(id) {
        try {
            await db.collection(COLLECTIONS.CLIENTES).doc(id).delete();
        } catch (error) {
            console.error('Error deleting cliente:', error);
            throw error;
        }
    },

    // Sincronización con localStorage
    async syncFromLocalStorage() {
        try {
            // Sincronizar requerimientos
            const localRequerimientos = JSON.parse(localStorage.getItem('requerimientos') || '[]');
            for (const req of localRequerimientos) {
                await this.saveRequerimiento(req);
            }

            // Sincronizar cotizaciones
            const localCotizaciones = JSON.parse(localStorage.getItem('cotizaciones') || '[]');
            for (const cot of localCotizaciones) {
                await this.saveCotizacion(cot);
            }

            // Sincronizar clientes
            const localClientes = JSON.parse(localStorage.getItem('clientes') || '[]');
            for (const cli of localClientes) {
                await this.saveCliente(cli);
            }

            console.log('Sincronización desde localStorage completada');
        } catch (error) {
            console.error('Error syncing from localStorage:', error);
            throw error;
        }
    },

    // Escuchar cambios en tiempo real
    listenToChanges(collection, callback) {
        return db.collection(collection).onSnapshot((snapshot) => {
            const changes = snapshot.docChanges().map(change => ({
                type: change.type,
                data: { ...change.doc.data(), id: change.doc.id }
            }));
            callback(changes);
        });
    }
};

// Exportar el servicio
export default FirebaseService;
