// Sistema de almacenamiento local
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
    },

    // Obtener todos los datos
    getAll() {
        const data = localStorage.getItem('maquipan_data');
        return data ? JSON.parse(data) : null;
    },

    // Guardar todos los datos
    saveAll(data) {
        localStorage.setItem('maquipan_data', JSON.stringify(data));
    },

    // Requerimientos
    getRequerimientos() {
        const data = this.getAll();
        return data ? data.requerimientos : [];
    },

    saveRequerimiento(requerimiento) {
        const data = this.getAll();
        data.config.ultimoRequerimiento++;
        requerimiento.id = 'REQ' + data.config.ultimoRequerimiento.toString().padStart(6, '0');
        data.requerimientos.unshift(requerimiento);
        this.saveAll(data);
        return requerimiento.id;
    },

    updateRequerimiento(id, requerimiento) {
        const data = this.getAll();
        const index = data.requerimientos.findIndex(r => r.id === id);
        if (index !== -1) {
            data.requerimientos[index] = { ...data.requerimientos[index], ...requerimiento };
            this.saveAll(data);
            return true;
        }
        return false;
    },

    // Cotizaciones
    getCotizaciones() {
        const data = this.getAll();
        return data ? data.cotizaciones : [];
    },

    saveCotizacion(cotizacion) {
        const data = this.getAll();
        data.config.ultimaCotizacion++;
        cotizacion.numero = data.config.ultimaCotizacion.toString().padStart(6, '0');
        data.cotizaciones.unshift(cotizacion);
        this.saveAll(data);
        return cotizacion.numero;
    },

    updateCotizacion(numero, cotizacion) {
        const data = this.getAll();
        const index = data.cotizaciones.findIndex(c => c.numero === numero);
        if (index !== -1) {
            data.cotizaciones[index] = { ...data.cotizaciones[index], ...cotizacion };
            this.saveAll(data);
            return true;
        }
        return false;
    },

    // Clientes
    getClientes() {
        const data = this.getAll();
        return data ? data.clientes : [];
    },

    saveCliente(cliente) {
        const data = this.getAll();
        data.config.ultimoCliente++;
        cliente.id = data.config.ultimoCliente;
        data.clientes.push(cliente);
        this.saveAll(data);
        return cliente.id;
    },

    updateCliente(id, cliente) {
        const data = this.getAll();
        const index = data.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            data.clientes[index] = { ...data.clientes[index], ...cliente };
            this.saveAll(data);
            return true;
        }
        return false;
    },

    // Usuarios
    getUsuarios() {
        const data = this.getAll();
        return data ? data.usuarios : [];
    },

    // Búsqueda
    search(type, query) {
        const data = this.getAll();
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

    // Estadísticas para el dashboard
    getDashboardStats() {
        const data = this.getAll();
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
