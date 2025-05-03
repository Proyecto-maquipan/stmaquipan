// Modificación a nuevoRequerimientoComponent en requerimientos.js
const nuevoRequerimientoComponent = {
    repuestos: [], // Para almacenar los repuestos seleccionados
    
    async render(container) {
        try {
            // Mostrar indicador de carga
            container.innerHTML = `
                <h2>Nuevo Requerimiento</h2>
                <div class="loading-spinner">Cargando datos...</div>
            `;
            
            // Cargar clientes desde la base de datos
            const clientes = await storage.getClientes();
            
            // Cargar formulario base
            container.innerHTML = `
                <h2>Nuevo Requerimiento</h2>
                <form id="formRequerimiento">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Cliente:</label>
                            <select id="requerimiento-cliente" required>
                                <option value="">Seleccione un cliente</option>
                                ${clientes.map(cliente => `
                                    <option value="${cliente.razonSocial}">${cliente.razonSocial}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Contrato:</label>
                            <input type="text" id="requerimiento-contrato" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Técnico:</label>
                            <select id="requerimiento-tecnico" required>
                                <option value="">Seleccione un técnico</option>
                                <option value="MORALES LIZAMA HUGO HERNAN">MORALES LIZAMA HUGO HERNAN</option>
                                <option value="JUAN PEREZ">JUAN PEREZ</option>
                                <option value="PEDRO GONZALEZ">PEDRO GONZALEZ</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Fecha:</label>
                            <input type="date" id="requerimiento-fecha" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Descripción del servicio:</label>
                        <textarea id="requerimiento-descripcion" rows="4" required></textarea>
                    </div>
                    
                    <h3>Datos del equipo</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Marca:</label>
                            <input type="text" id="equipo-marca" required>
                        </div>
                        <div class="form-group">
                            <label>Modelo:</label>
                            <input type="text" id="equipo-modelo" required>
                        </div>
                        <div class="form-group">
                            <label>Serie:</label>
                            <input type="text" id="equipo-serie" required>
                        </div>
                    </div>
                    
                    <!-- Nueva sección para repuestos -->
                    <h3>Repuestos asociados <button type="button" class="btn btn-sm btn-primary" id="btn-agregar-repuesto">
                        <i class="fas fa-plus"></i> Agregar repuesto
                    </button></h3>
                    
                    <div id="repuestos-container">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Subtotal</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="repuestos-table-body">
                                <tr id="no-repuestos-row">
                                    <td colspan="6" class="text-center">No hay repuestos agregados</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" class="text-end"><strong>Total repuestos:</strong></td>
                                    <td id="total-repuestos">$0</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Guardar Requerimiento</button>
                        <button type="button" class="btn btn-secondary" onclick="router.navigate('requerimientos')">Cancelar</button>
                    </div>
                </form>

                <!-- Modal para buscar y agregar repuestos -->
                <div class="modal fade" id="modal-buscar-repuesto" tabindex="-1" aria-labelledby="modal-buscar-repuesto-label" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="modal-buscar-repuesto-label">Buscar repuesto</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control" id="buscar-repuesto-input" placeholder="Ingrese código o nombre del repuesto">
                                    <button class="btn btn-outline-secondary" type="button" id="btn-buscar-repuesto">
                                        <i class="fas fa-search"></i> Buscar
                                    </button>
                                </div>
                                <div id="buscar-repuesto-resultados" style="max-height: 300px; overflow-y: auto;">
                                    <table class="table table-striped table-hover">
                                        <thead>
                                            <tr>
                                                <th>Código</th>
                                                <th>Nombre</th>
                                                <th>Precio</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="repuestos-search-results">
                                            <tr>
                                                <td colspan="4" class="text-center">Ingrese un criterio de búsqueda</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Inicializar eventos
            this.initEvents();
            
            // Agregar event listener al formulario
            const form = document.getElementById('formRequerimiento');
            if (form) {
                form.addEventListener('submit', this.handleSubmit.bind(this));
            }
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <h3>Error al cargar los datos</h3>
                    <p>${error.message || 'Se produjo un error inesperado'}</p>
                    <button class="btn btn-primary" onclick="router.navigate('nuevo-requerimiento')">Reintentar</button>
                </div>
            `;
        }
    },
    
    initEvents() {
        // Evento para abrir modal de búsqueda de repuestos
        const btnAgregarRepuesto = document.getElementById('btn-agregar-repuesto');
        if (btnAgregarRepuesto) {
            btnAgregarRepuesto.addEventListener('click', () => {
                const modal = new bootstrap.Modal(document.getElementById('modal-buscar-repuesto'));
                modal.show();
            });
        }
        
        // Evento para búsqueda de repuestos en el modal
        const btnBuscarRepuesto = document.getElementById('btn-buscar-repuesto');
        if (btnBuscarRepuesto) {
            btnBuscarRepuesto.addEventListener('click', this.buscarRepuestos.bind(this));
        }
        
        // Buscar al presionar Enter en el campo de búsqueda
        const buscarInput = document.getElementById('buscar-repuesto-input');
        if (buscarInput) {
            buscarInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.buscarRepuestos();
                }
            });
        }
    },
    
    async buscarRepuestos() {
        const searchTerm = document.getElementById('buscar-repuesto-input').value.trim().toLowerCase();
        const resultsContainer = document.getElementById('repuestos-search-results');
        
        if (!searchTerm) {
            resultsContainer.innerHTML = '<tr><td colspan="4" class="text-center">Ingrese un criterio de búsqueda</td></tr>';
            return;
        }
        
        resultsContainer.innerHTML = '<tr><td colspan="4" class="text-center"><i class="fas fa-spinner fa-spin"></i> Buscando...</td></tr>';
        
        try {
            // Buscar por código exacto primero
            let snapshot = await firebase.firestore().collection('repuestos')
                .where('codigo', '==', searchTerm.toUpperCase())
                .limit(10)
                .get();
            
            // Si no encontramos por código exacto, buscar por nombre
            if (snapshot.empty) {
                // Como Firebase no soporta búsquedas de texto completo, obtenemos los primeros 100 
                // repuestos ordenados por nombre y filtramos en el cliente
                snapshot = await firebase.firestore().collection('repuestos')
                    .orderBy('nombre')
                    .limit(100)
                    .get();
            }
            
            // Filtrar los resultados en el cliente
            const results = [];
            snapshot.forEach(doc => {
                const repuesto = doc.data();
                const nombre = (repuesto.nombre || '').toLowerCase();
                const codigo = (repuesto.codigo || '').toLowerCase();
                
                if (codigo.includes(searchTerm) || nombre.includes(searchTerm)) {
                    results.push({ id: doc.id, ...repuesto });
                }
            });
            
            // Mostrar resultados
            if (results.length === 0) {
                resultsContainer.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron repuestos</td></tr>';
                return;
            }
            
            resultsContainer.innerHTML = results.map(repuesto => `
                <tr>
                    <td>${repuesto.codigo || ''}</td>
                    <td>${repuesto.nombre || ''}</td>
                    <td>$${(repuesto.precio || 0).toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="nuevoRequerimientoComponent.agregarRepuesto('${repuesto.id}', '${repuesto.codigo}', '${repuesto.nombre.replace(/'/g, "\\'")}', ${repuesto.precio})">
                            <i class="fas fa-plus"></i> Agregar
                        </button>
                    </td>
                </tr>
            `).join('');
            
        } catch (error) {
            console.error('Error al buscar repuestos:', error);
            resultsContainer.innerHTML = '<tr><td colspan="4" class="text-center">Error al buscar repuestos</td></tr>';
        }
    },
    
    agregarRepuesto(id, codigo, nombre, precio) {
        // Verificar si ya existe este repuesto
        const repuestoExistente = this.repuestos.find(r => r.id === id);
        
        if (repuestoExistente) {
            // Incrementar cantidad si ya existe
            repuestoExistente.cantidad += 1;
            repuestoExistente.subtotal = repuestoExistente.cantidad * repuestoExistente.precio;
        } else {
            // Agregar nuevo repuesto
            this.repuestos.push({
                id,
                codigo,
                nombre,
                precio,
                cantidad: 1,
                subtotal: precio
            });
        }
        
        // Actualizar tabla
        this.actualizarTablaRepuestos();
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modal-buscar-repuesto'));
        if (modal) {
            modal.hide();
        }
        
        // Mostrar mensaje
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Repuesto agregado',
            showConfirmButton: false,
            timer: 1500
        });
    },
    
    eliminarRepuesto(index) {
        this.repuestos.splice(index, 1);
        this.actualizarTablaRepuestos();
    },
    
    actualizarTablaRepuestos() {
        const tableBody = document.getElementById('repuestos-table-body');
        const noRepuestosRow = document.getElementById('no-repuestos-row');
        const totalElement = document.getElementById('total-repuestos');
        
        if (this.repuestos.length === 0) {
            tableBody.innerHTML = `
                <tr id="no-repuestos-row">
                    <td colspan="6" class="text-center">No hay repuestos agregados</td>
                </tr>
            `;
            totalElement.textContent = '$0';
            return;
        }
        
        // Ocultar fila de "no hay repuestos"
        if (noRepuestosRow) {
            noRepuestosRow.style.display = 'none';
        }
        
        // Generar filas
        tableBody.innerHTML = this.repuestos.map((repuesto, index) => `
            <tr>
                <td>${repuesto.codigo}</td>
                <td>${repuesto.nombre}</td>
                <td>
                    <input type="number" class="form-control form-control-sm" min="1" value="${repuesto.cantidad}" 
                           onchange="nuevoRequerimientoComponent.actualizarCantidad(${index}, this.value)">
                </td>
                <td>$${repuesto.precio.toFixed(2)}</td>
                <td>$${repuesto.subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="nuevoRequerimientoComponent.eliminarRepuesto(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Actualizar total
        const total = this.repuestos.reduce((sum, repuesto) => sum + repuesto.subtotal, 0);
        totalElement.textContent = `$${total.toFixed(2)}`;
    },
    
    actualizarCantidad(index, cantidad) {
        cantidad = parseInt(cantidad);
        if (isNaN(cantidad) || cantidad < 1) {
            cantidad = 1;
        }
        
        this.repuestos[index].cantidad = cantidad;
        this.repuestos[index].subtotal = cantidad * this.repuestos[index].precio;
        this.actualizarTablaRepuestos();
    },
    
    async handleSubmit(e) {
        e.preventDefault();
        
        try {
            const requerimiento = {
                cliente: document.getElementById('requerimiento-cliente').value,
                contrato: document.getElementById('requerimiento-contrato').value,
                tecnico: document.getElementById('requerimiento-tecnico').value,
                fecha: document.getElementById('requerimiento-fecha').value,
                descripcion: document.getElementById('requerimiento-descripcion').value,
                equipo: {
                    marca: document.getElementById('equipo-marca').value,
                    modelo: document.getElementById('equipo-modelo').value,
                    serie: document.getElementById('equipo-serie').value
                },
                repuestos: this.repuestos.map(r => ({
                    id: r.id,
                    codigo: r.codigo,
                    nombre: r.nombre,
                    precio: r.precio,
                    cantidad: r.cantidad,
                    subtotal: r.subtotal
                })),
                total_repuestos: this.repuestos.reduce((sum, r) => sum + r.subtotal, 0),
                estado: 'Pendiente',
                fechaCreacion: new Date().toISOString()
            };
            
            // Mostrar indicador de carga
            document.querySelector('.form-actions').innerHTML = `
                <div class="loading-spinner">Guardando requerimiento...</div>
            `;
            
            const id = await storage.saveRequerimiento(requerimiento);
            
            Swal.fire({
                icon: 'success',
                title: '¡Requerimiento creado!',
                text: `Requerimiento ${id} creado exitosamente`,
                confirmButtonText: 'Aceptar'
            }).then(() => {
                router.navigate('requerimientos');
            });
        } catch (error) {
            console.error('Error al guardar requerimiento:', error);
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error al guardar el requerimiento: ${error.message || 'Se produjo un error inesperado'}`,
                confirmButtonText: 'Aceptar'
            });
            
            // Restaurar botones
            document.querySelector('.form-actions').innerHTML = `
                <button type="submit" class="btn btn-primary">Guardar Requerimiento</button>
                <button type="button" class="btn btn-secondary" onclick="router.navigate('requerimientos')">Cancelar</button>
            `;
        }
    }
};
