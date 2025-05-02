```javascript
// Variables globales para Firebase
window.db = null;
window.firebaseInitialized = false;

// Inicializar Firestore
function initFirebase() {
    try {
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            window.db = firebase.firestore();
            window.firebaseInitialized = true;
            console.log('Firebase inicializado correctamente en storage.js');
        } else {
            console.log('Firebase aún no está disponible, reintentando...');
            setTimeout(initFirebase, 1000);
        }
    } catch (error) {
        console.error('Error inicializando Firebase:', error);
        setTimeout(initFirebase, 1000);
    }
}

// Sistema de almacenamiento simplificado
const storage = {
    // Método para verificar si está inicializado
    isInitialized() {
        return window.firebaseInitialized;
    },
    
    // Requerimientos
    async getRequerimientos() {
        if (!window.firebaseInitialized) {
            console.log('Firebase no inicializado en getRequerimientos');
            return [];
        }
        
        try {
            const snapshot = await window.db.collection('requerimientos').get();
            const requerimientos = [];
            snapshot.forEach(doc => {
                requerimientos.push({ ...doc.data(), id: doc.id });
            });
            return requerimientos;
        } catch (error) {
            console.error('Error obteniendo requerimientos:', error);
            return [];
        }
    },
    
    async saveRequerimiento(requerimiento) {
        if (!window.firebaseInitialized) {
            console.error('Firebase no inicializado en saveRequerimiento');
            return Promise.reject(new Error('Firebase no inicializado'));
        }
        
        try {
            // Generar número secuencial
            let nextNumber = 1000;
            try {
                const counterRef = window.db.collection('counters').doc('requerimiento');
                const counterDoc = await counterRef.get();
                
                if (counterDoc.exists) {
                    nextNumber = counterDoc.data().value + 1;
                    await counterRef.update({ value: nextNumber });
                } else {
                    await counterRef.set({ value: nextNumber });
                }
            } catch (counterError) {
                console.warn('Error con contador, usando valor por defecto:', counterError);
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
    
    // Clientes
    async getClientes() {
        if (!window.firebaseInitialized) {
            console.log('Firebase no inicializado en getClientes');
            return [];
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
        if (!window.firebaseInitialized) {
            console.error('Firebase no inicializado en saveCliente');
            return Promise.reject(new Error('Firebase no inicializado'));
        }
        
        try {
            // Generar código secuencial
            let nextNumber = 1000;
            try {
                const counterRef = window.db.collection('counters').doc('cliente');
                const counterDoc = await counterRef.get();
                
                if (counterDoc.exists) {
                    nextNumber = counterDoc.data().value + 1;
                    await counterRef.update({ value: nextNumber });
                } else {
                    await counterRef.set({ value: nextNumber });
                }
            } catch (counterError) {
                console.warn('Error con contador, usando valor por defecto:', counterError);
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
    }
    
    // Implementa los demás métodos según sea necesario
};

// Exponer storage globalmente
window.storage = storage;

// Inicializar Firebase
setTimeout(initFirebase, 500);
