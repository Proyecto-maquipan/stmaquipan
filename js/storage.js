// Sistema de almacenamiento híbrido (Local + Firebase)
import FirebaseService from './firebase-config.js';

const storage = {
    useFirebase: true,
    isOnline: navigator.onLine,
    
    // Inicializar datos si no existen
    async init() {
        // Escuchar cambios de conexión
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncToFirebase();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        // Inicializar localStorage si está vacío
        if (!localStorage.getItem('maquipan_data')) {
            const initialData = {
                requerimientos: [],
                cotizaciones: [],
                clientes: [],
                usuarios: [
                    {
                        id: 1,
                        username: 'admin',
                        password: 'admin123', // En producción, usar hash
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
            this.saveAll(initialData);
        }
        
        // Inicializar Firebase si está disponible
        if (this.useFirebase && this.isOnline) {
            try {
                await FirebaseService.initCounters();
                console.log('Firebase inicializado correctamente');
                
                // Sincronizar datos existentes con Firebase
                await this.syncToFirebase();
            } catch (error) {
                console.error('Error inicializando Firebase:', error);
                this.useFirebase = false;
            }
        }
    },

    // Obtener todos los datos
    async getAll() {
        if (this.useFirebase && this.isOnline) {
            try {
                const [requerimientos, cotizaciones, clientes] = await Promise.all([
                    FirebaseService.getRequerimientos(),
                    FirebaseService.getCotizaciones(),
                    FirebaseService.getClientes()
                ]);
                
                const firebaseData = {
                    requerimientos,
                    cotizaciones,
                    clientes,
                    usuarios: this.getUsuarios(), // Mantener usuarios en local por seguridad
                    config: this.getConfig()
                };
                
                // Actualizar localStorage con datos de Firebase
                localStorage.setItem('maquipan_data', JSON.stringify(firebaseData));
                return firebaseData;
            } catch (error) {
                console.error('Error obteniendo datos de Firebase:', error);
            }
        }
        
        // Fallback a localStorage
        const data = localStorage.getItem('maquipan_data');
        return data ? JSON.parse(data) : null;
    },

    // Guardar todos los datos
    saveAll(data) {
        localStorage.setItem('maquipan_data', JSON.stringify(data));
    },

    // Obtener configuración
    getConfig() {
        const data = localStorage.getItem('maquipan_data');
        return data ? JSON.parse(data).config : null;
    },

    // Requerimientos
    async getRequerimientos() {
        if (this.useFirebase && this.isOnline) {
            try {
                const requerimientos = await FirebaseService.getRequerimientos();
                // Actualizar localStorage
                const data = JSON.parse(localStorage.getItem('maquipan_data'));
                data.requerimientos = requerimientos;
                this.saveAll(data);
                return requerimientos;
            } catch (error) {
                console.error('Error obteniendo requerimientos de Firebase:', error);
            }
        }
        
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        return data ? data.requerimientos : [];
    },

    async saveRequerimiento(requerimiento) {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        
        if (!requerimiento.id) {
            data.config.ultimoRequerimiento++;
            requerimiento.id = 'REQ' + data.config.ultimoRequerimiento.toString().padStart(6, '0');
        }
        
        data.requerimientos.unshift(requerimiento);
        this.saveAll(data);
        
        // Sincronizar con Firebase si está disponible
        if (this.useFirebase && this.isOnline) {
            try {
                await FirebaseService.saveRequerimiento(requerimiento);
            } catch (error) {
                console.error('Error guardando en Firebase:', error);
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
            
            // Sincronizar con Firebase
            if (this.useFirebase && this.isOnline) {
                try {
                    await FirebaseService.updateRequerimiento(id, requerimiento);
                } catch (error) {
                    console.error('Error actualizando en Firebase:', error);
                }
            }
            
            return true;
        }
        return false;
    },

    // Cotizaciones
    async getCotizaciones() {
        if (this.useFirebase && this.isOnline) {
            try {
                const cotizaciones = await FirebaseService.getCotizaciones();
                // Actualizar localStorage
                const data = JSON.parse(localStorage.getItem('maquipan_data'));
                data.cotizaciones = cotizaciones;
                this.saveAll(data);
                return cotizaciones;
            } catch (error) {
                console.error('Error obteniendo cotizaciones de Firebase:', error);
            }
        }
        
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        return data ? data.cotizaciones : [];
    },

    async saveCotizacion(cotizacion) {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        
        if (!cotizacion.numero) {
            data.config.ultimaCotizacion++;
            cotizacion.numero = data.config.ultimaCotizacion.toString().padStart(6, '0');
        }
        
        data.cotizaciones.unshift(cotizacion);
        this.saveAll(data);
        
        // Sincronizar con Firebase
        if (this.useFirebase && this.isOnline) {
            try {
                await FirebaseService.saveCotizacion(cotizacion);
            } catch (error) {
                console.error('Error guardando cotización en Firebase:', error);
            }
        }
        
        return cotizacion.numero;
    },

    async updateCotizacion(numero, cotizacion) {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        const index = data.cotizaciones.findIndex(c => c.numero === numero);
        
        if (index !== -1) {
            data.cotizaciones[index] = { ...data.cotizaciones[index], ...cotizacion };
            this.saveAll(data);
            
            // Sincronizar con Firebase
            if (this.useFirebase && this.isOnline) {
                try {
                    await FirebaseService.updateCotizacion(numero, cotizacion);
                } catch (error) {
                    console.error('Error actualizando cotización en Firebase:', error);
                }
            }
            
            return true;
        }
        return false;
    },

    // Clientes
    async getClientes() {
        if (this.useFirebase && this.isOnline) {
            try {
                const clientes = await FirebaseService.getClientes();
                // Actualizar localStorage
                const data = JSON.parse(localStorage.getItem('maquipan_data'));
                data.clientes = clientes;
                this.saveAll(data);
                return clientes;
            } catch (error) {
                console.error('Error obteniendo clientes de Firebase:', error);
            }
        }
        
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        return data ? data.clientes : [];
    },

    async saveCliente(cliente) {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        
        if (!cliente.id) {
            data.config.ultimoCliente++;
            cliente.id = data.config.ultimoCliente;
        }
        
        data.clientes.push(cliente);
        this.saveAll(data);
        
        // Sincronizar con Firebase
        if (this.useFirebase && this.isOnline) {
            try {
                await FirebaseService.saveCliente(cliente);
            } catch (error) {
                console.error('Error guardando cliente en Firebase:', error);
            }
        }
        
        return cliente.id;
    },

    async updateCliente(id, cliente) {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        const index = data.clientes.findIndex(c => c.id === id);
        
        if (index !== -1) {
            data.clientes[index] = { ...data.clientes[index], ...cliente };
            this.saveAll(data);
            
            // Sincronizar con Firebase
            if (this.useFirebase && this.isOnline) {
                try {
                    await FirebaseService.updateCliente(id, cliente);
                } catch (error) {
                    console.error('Error actualizando cliente en Firebase:', error);
                }
            }
            
            return true;
        }
        return false;
    },

    // Usuarios (mantener solo en localStorage por seguridad)
    getUsuarios() {
        const data = JSON.parse(localStorage.getItem('maquipan_data'));
        return data ? data.usuarios : [];
    },

    // Búsqueda
    async search(type, query) {
        query = query.toLowerCase();
        let data;
        
        // Si estamos online, buscar en Firebase
        if (this.useFirebase && this.isOnline) {
            data = await this.getAll();
        } else {
            data = JSON.parse(localStorage.getItem('maquipan_data'));
        }
        
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

    // Estadísticas para el dashboard
    async getDashboardStats() {
        let data;
        
        if (this.useFirebase && this.isOnline) {
            data = await this.getAll();
        } else {
            data = JSON.parse(localStorage.getItem('maquipan_data'));
        }
        
        return {
            requerimientosPendientes: data.requerimientos.filter(r => r.estado === 'Pendiente').length,
            cotizacionesActivas: data.cotizaciones.filter(c => c.estado === 'Activa').length,
            serviciosCompletados: data.requerimientos.filter(r => r.estado === 'Completado').length,
            clientesActivos: data.clientes.length
        };
    },

    // Sincronización manual con Firebase
    async syncToFirebase() {
        if (!this.useFirebase || !this.isOnline) return;
        
        try {
            const data = JSON.parse(localStorage.getItem('maquipan_data'));
            
            // Sincronizar requerimientos
            for (const req of data.requerimientos) {
                await FirebaseService.saveRequerimiento(req);
            }
            
            // Sincronizar cotizaciones
            for (const cot of data.cotizaciones) {
                await FirebaseService.saveCotizacion(cot);
            }
            
            // Sincronizar clientes
            for (const cli of data.clientes) {
                await FirebaseService.saveCliente(cli);
            }
            
            console.log('Datos sincronizados con Firebase');
        } catch (error) {
            console.error('Error en sincronización con Firebase:', error);
        }
    }
};

// Inicializar storage cuando se carga el script
storage.init().catch(error => {
    console.error('Error inicializando storage:', error);
});

export default storage;
