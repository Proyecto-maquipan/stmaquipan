// Componente de Gestión de Repuestos - Versión Optimizada con Ordenamiento por Nombre
const repuestosComponent = {
    datosTemporales: [],
    currentPage: 1,
    itemsPerPage: 50,
    totalItems: 0,
    lastVisible: null,
    searchTerm: '',
    searchTimeout: null,
    ordenamiento: 'nombre', // Por defecto ordenar por nombre
    direccionOrden: 'asc', // Por defecto ascendente
    
    async render(container) {
        try {
            container.innerHTML = `
                <div class="container-fluid">
                    <div class="row mb-4">
                        <div class="col-12">
                            <h2><i class="fas fa-tools me-2"></i>Gestión de Repuestos</h2>
                        </div>
                    </div>

                    <!-- Barra de búsqueda y botones -->
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="input-group">
                                <input type="text" class="form-control" id="searchInput" placeholder="Buscar por código o nombre...">
                                <button class="btn btn-outline-secondary" type="button" onclick="repuestosComponent.buscarRepuestos()">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <select class="form-select" id="ordenamiento" onchange="repuestosComponent.cambiarOrdenamiento()">
                                <option value="nombre-asc" selected>Nombre (A-Z)</option>
                                <option value="nombre-desc">Nombre (Z-A)</option>
                                <option value="codigo-asc">Código (A-Z)</option>
                                <option value="codigo-desc">Código (Z-A)</option>
                                <option value="precio-asc">Precio (menor a mayor)</option>
                                <option value="precio-desc">Precio (mayor a menor)</option>
                            </select>
                        </div>
                        <div class="col-md-6 text-end">
                            <button class="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target="#addRepuestoModal">
                                <i class="fas fa-plus me-2"></i>Agregar Repuesto
                            </button>
                            <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#uploadModal">
                                <i class="fas fa-upload me-2"></i>Carga Masiva
                            </button>
                        </div>
                    </div>

                    <!-- Información de registros -->
                    <div class="row mb-3">
                        <div class="col-12">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                Total de repuestos: <strong id="totalRepuestos">Cargando...</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla de repuestos -->
                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover" id="repuestosTable">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Nombre del Artículo</th>
                                            <th>Precio</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="repuestosTableBody">
                                        <!-- Los datos se cargarán dinámicamente -->
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- Paginación -->
                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <div class="d-flex align-items-center">
                                        <span>Mostrando </span>
                                        <select class="form-select mx-2" style="width: auto;" id="itemsPerPageSelect" onchange="repuestosComponent.cambiarItemsPorPagina(this.value)">
                                            <option value="20">20</option>
                                            <option value="50" selected>50</option>
                                            <option value="100">100</option>
                                            <option value="200">200</option>
                                        </select>
                                        <span> registros por página</span>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <nav aria-label="Paginación de repuestos">
                                        <ul class="pagination justify-content-end" id="pagination">
                                            <!-- Botones de paginación se generarán dinámicamente -->
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal para agregar repuesto -->
                <div class="modal fade" id="addRepuestoModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Agregar Nuevo Repuesto</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addRepuestoForm">
                                    <div class="mb-3">
                                        <label for="codigo" class="form-label">Código del Objeto</label>
                                        <input type="text" class="form-control" id="codigo" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="nombre" class="form-label">Nombre del Artículo</label>
                                        <input type="text" class="form-control" id="nombre" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="precio" class="form-label">Precio</label>
                                        <input type="number" class="form-control" id="precio" step="0.01" required>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="repuestosComponent.guardarRepuesto()">Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal para carga masiva -->
                <div class="modal fade" id="uploadModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Carga Masiva de Repuestos</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="alert alert-info">
                                    <strong>Formato requerido:</strong> Archivo CSV o Excel con las columnas: Código, Nombre, Precio
                                </div>
                                <div class="file-upload-area" onclick="document.getElementById('fileInput').click()">
                                    <i class="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                                    <p>Arrastra y suelta tu archivo aquí o haz clic para seleccionar</p>
                                    <input type="file" id="fileInput" accept=".csv,.xlsx,.xls" style="display: none;" onchange="repuestosComponent.procesarArchivo(this)">
                                </div>
                                <div id="previewArea" class="mt-3" style="display: none;">
                                    <h6>Vista previa de datos:</h6>
                                    <div class="table-responsive">
                                        <table class="table table-sm" id="previewTable">
                                            <thead>
                                                <tr>
                                                    <th>Código</th>
                                                    <th>Nombre</th>
                                                    <th>Precio</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <!-- Datos de preview -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="repuestosComponent.cargarRepuestosMasivo()" disabled id="uploadBtn">Cargar Datos</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Cargar estilos personalizados
            this.agregarEstilos();
            
            try {
                // Contar total de repuestos
                await this.contarTotalRepuestos();
            } catch (error) {
                console.error('Error contando repuestos:', error);
                document.getElementById('totalRepuestos').textContent = 'Error al cargar';
            }
            
            try {
                // Cargar primera página
                await this.cargarRepuestosPaginados();
            } catch (error) {
                console.error('Error cargando repuestos paginados:', error);
                const tbody = document.getElementById('repuestosTableBody');
                if (tbody) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center">
                                Error al cargar los repuestos. <button onclick="repuestosComponent.cargarRepuestosPaginados()" class="btn btn-sm btn-primary">Reintentar</button>
                            </td>
                        </tr>
                    `;
                }
            }
            
            // Inicializar eventos
            this.inicializarEventos();
            
        } catch (error) {
            console.error('Error en repuestos:', error);
            container.innerHTML = `
                <div class="error">
                    <h3>Error al cargar el módulo de repuestos</h3>
                    <p>No se pudieron cargar los datos. Por favor, verifica tu conexión.</p>
                    <button class="btn btn-primary" onclick="router.navigate('dashboard')">Volver al Dashboard</button>
                </div>
            `;
        }
    },

    agregarEstilos() {
        if (!document.getElementById('repuestos-styles')) {
            const style = document.createElement('style');
            style.id = 'repuestos-styles';
            style.textContent = `
                .file-upload-area {
                    border: 2px dashed #ddd;
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .file-upload-area:hover {
                    border-color: #007bff;
                    background-color: #f8f9fa;
                }
                .btn-action {
                    padding: 0.25rem 0.5rem;
                    margin: 0 0.25rem;
                }
                .table-responsive {
                    min-height: 400px;
                }
                #repuestosTableBody {
                    min-height: 350px;
                }
            `;
            document.head.appendChild(style);
        }
    },

    async contarTotalRepuestos() {
        try {
            // Agregar tiempo de espera máximo para evitar bloqueos
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000)
            );
            
            const fetchPromise = firebase.firestore().collection('repuestos').get();
            
            // Usar Promise.race para limitar el tiempo de espera
            const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
            
            this.totalItems = snapshot.size;
            const totalElement = document.getElementById('totalRepuestos');
            if (totalElement) {
                totalElement.textContent = this.totalItems.toLocaleString();
            }
        } catch (error) {
            console.error('Error contando repuestos:', error);
            // No propagar el error, manejar graciosamente
            const totalElement = document.getElementById('totalRepuestos');
            if (totalElement) {
                totalElement.textContent = 'Error al cargar';
            }
        }
    },

    // Continúa con los demás métodos del componente...
};

    async cargarRepuestosPaginados(page = 1) {
        try {
            const tbody = document.getElementById('repuestosTableBody');
            if (!tbody) {
                console.error('Elemento tbody no encontrado');
                return;
            }
            
            tbody.innerHTML = '<tr><td colspan="4" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';
            
            // Verificar que firebase esté inicializado
            if (typeof firebase === 'undefined' || typeof firebase.firestore !== 'function') {
                throw new Error('Firebase no está disponible');
            }
            
            let query = firebase.firestore().collection('repuestos')
                .orderBy(this.ordenamiento, this.direccionOrden)
                .limit(this.itemsPerPage);
            
            // Si no es la primera página, usar el último documento visible
            if (page > 1 && this.lastVisible) {
                query = query.startAfter(this.lastVisible);
            }
            
            // Agregar tiempo de espera máximo
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000)
            );
            
            const fetchPromise = query.get();
            
            // Usar Promise.race para limitar el tiempo de espera
            const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
            
            // Guardar el último documento para la siguiente página
            if (!snapshot.empty) {
                this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
            }
            
            // Renderizar datos
            tbody.innerHTML = '';
            
            if (snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron repuestos</td></tr>';
                return;
            }
            
            snapshot.forEach(doc => {
                const repuesto = doc.data();
                tbody.innerHTML += `
                    <tr>
                        <td>${repuesto.codigo || ''}</td>
                        <td>${repuesto.nombre || ''}</td>
                        <td>$${(repuesto.precio || 0).toFixed(2)}</td>
                        <td>
                            <button class="btn btn-sm btn-info btn-action" onclick="repuestosComponent.editarRepuesto('${doc.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="repuestosComponent.eliminarRepuesto('${doc.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            this.currentPage = page;
            this.actualizarPaginacion();
            
        } catch (error) {
            console.error('Error al cargar repuestos paginados:', error);
            
            const tbody = document.getElementById('repuestosTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">
                            Error al cargar los repuestos. <button onclick="repuestosComponent.cargarRepuestosPaginados()" class="btn btn-sm btn-primary">Reintentar</button>
                        </td>
                    </tr>
                `;
            }
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar los repuestos. ¿Deseas reintentar?',
                    icon: 'error',
                    showCancelButton: true,
                    confirmButtonText: 'Reintentar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.cargarRepuestosPaginados();
                    }
                });
            }
        }
    },

    cambiarOrdenamiento() {
        const ordenamientoSelect = document.getElementById('ordenamiento');
        if (!ordenamientoSelect) return;
        
        const [campo, direccion] = ordenamientoSelect.value.split('-');
        
        this.ordenamiento = campo;
        this.direccionOrden = direccion;
        this.currentPage = 1;
        this.lastVisible = null;
        
        this.cargarRepuestosPaginados();
    },

    actualizarPaginacion() {
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        pagination.innerHTML = '';
        
        // Botón anterior
        pagination.innerHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="event.preventDefault(); repuestosComponent.cambiarPagina(${this.currentPage - 1}); return false;">Anterior</a>
            </li>
        `;
        
        // Páginas
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pagination.innerHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="event.preventDefault(); repuestosComponent.cambiarPagina(${i}); return false;">${i}</a>
                </li>
            `;
        }
        
        // Botón siguiente
        pagination.innerHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="event.preventDefault(); repuestosComponent.cambiarPagina(${this.currentPage + 1}); return false;">Siguiente</a>
            </li>
        `;
    },

    cambiarPagina(page) {
        if (page < 1 || page > Math.ceil(this.totalItems / this.itemsPerPage)) return;
        this.cargarRepuestosPaginados(page);
    },

    cambiarItemsPorPagina(value) {
        this.itemsPerPage = parseInt(value);
        this.currentPage = 1;
        this.lastVisible = null;
        this.cargarRepuestosPaginados();
    },

    async buscarRepuestos() {
        const searchTerm = document.getElementById('searchInput')?.value?.trim()?.toLowerCase() || '';
        
        if (searchTerm === '') {
            // Si no hay término de búsqueda, volver a la vista normal
            this.currentPage = 1;
            this.lastVisible = null;
            this.cargarRepuestosPaginados();
            return;
        }
        
        try {
            const tbody = document.getElementById('repuestosTableBody');
            if (!tbody) return;
            
            tbody.innerHTML = '<tr><td colspan="4" class="text-center"><i class="fas fa-spinner fa-spin"></i> Buscando...</td></tr>';
            
            // Verificar que firebase esté inicializado
            if (typeof firebase === 'undefined' || typeof firebase.firestore !== 'function') {
                throw new Error('Firebase no está disponible');
            }
            
            // Agregar tiempo de espera máximo
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Tiempo de espera agotado')), 15000)
            );
            
            // Buscar por código exacto primero
            const queryPromise = firebase.firestore().collection('repuestos')
                .where('codigo', '==', searchTerm.toUpperCase())
                .limit(50)
                .get();
            
            // Usar Promise.race para limitar el tiempo de espera
            const snapshot = await Promise.race([queryPromise, timeoutPromise]);
            
            // Si no se encuentra por código, buscar en nombre
            if (snapshot.empty) {
                // Firebase no soporta búsquedas de texto completo, así que necesitamos obtener todos los documentos
                // y filtrar en el cliente. Para optimizar, limitamos la búsqueda.
                const allSnapshotPromise = firebase.firestore().collection('repuestos')
                    .orderBy('nombre')
                    .limit(500) // Limitar a 500 para evitar problemas de rendimiento
                    .get();
                
                const allSnapshot = await Promise.race([allSnapshotPromise, timeoutPromise]);
                
                const results = [];
                allSnapshot.forEach(doc => {
                    const repuesto = doc.data();
                    const nombre = (repuesto.nombre || '').toLowerCase();
                    const codigo = (repuesto.codigo || '').toLowerCase();
                    
                    if (nombre.includes(searchTerm) || codigo.includes(searchTerm)) {
                        results.push({ id: doc.id, ...repuesto });
                    }
                });
                
                // Limitar a los primeros 50 resultados
                const limitedResults = results.slice(0, 50);
                
                tbody.innerHTML = '';
                
                if (limitedResults.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron resultados</td></tr>';
                    return;
                }
                
                limitedResults.forEach(repuesto => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${repuesto.codigo || ''}</td>
                            <td>${repuesto.nombre || ''}</td>
                            <td>$${(repuesto.precio || 0).toFixed(2)}</td>
                            <td>
                                <button class="btn btn-sm btn-info btn-action" onclick="repuestosComponent.editarRepuesto('${repuesto.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger btn-action" onclick="repuestosComponent.eliminarRepuesto('${repuesto.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                // Deshabilitar paginación durante búsqueda
                const pagination = document.getElementById('pagination');
                if (pagination) {
                    pagination.innerHTML = '';
                }
            } else {
                // Mostrar resultados de búsqueda por código
                tbody.innerHTML = '';
                snapshot.forEach(doc => {
                    const repuesto = doc.data();
                    tbody.innerHTML += `
                        <tr>
                            <td>${repuesto.codigo || ''}</td>
                            <td>${repuesto.nombre || ''}</td>
                            <td>$${(repuesto.precio || 0).toFixed(2)}</td>
                            <td>
                                <button class="btn btn-sm btn-info btn-action" onclick="repuestosComponent.editarRepuesto('${doc.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger btn-action" onclick="repuestosComponent.eliminarRepuesto('${doc.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                // Deshabilitar paginación durante búsqueda
                const pagination = document.getElementById('pagination');
                if (pagination) {
                    pagination.innerHTML = '';
                }
            }
            
        } catch (error) {
            console.error('Error en búsqueda:', error);
            
            const tbody = document.getElementById('repuestosTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">
                            Error al realizar la búsqueda. <button onclick="repuestosComponent.buscarRepuestos()" class="btn btn-sm btn-primary">Reintentar</button>
                        </td>
                    </tr>
                `;
            }
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'Error al realizar la búsqueda: ' + (error.message || ''), 'error');
            }
        }
    },

    async guardarRepuesto() {
        try {
            const codigo = document.getElementById('codigo')?.value;
            const nombre = document.getElementById('nombre')?.value;
            const precioElement = document.getElementById('precio');
            const precio = precioElement ? parseFloat(precioElement.value) : 0;
            
            if (!codigo || !nombre || isNaN(precio)) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'Todos los campos son requeridos y el precio debe ser un número', 'error');
                } else {
                    alert('Todos los campos son requeridos y el precio debe ser un número');
                }
                return;
            }
            
            // Verificar que firebase esté inicializado
            if (typeof firebase === 'undefined' || typeof firebase.firestore !== 'function') {
                throw new Error('Firebase no está disponible');
            }
            
            // Mostrar indicador de carga
            let loadingSwal;
            if (typeof Swal !== 'undefined') {
                loadingSwal = Swal.fire({
                    title: 'Guardando...',
                    text: 'Espere por favor',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }
            
            // Agregar tiempo de espera máximo
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000)
            );
            
            const savePromise = firebase.firestore().collection('repuestos').add({
                codigo,
                nombre,
                precio,
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Usar Promise.race para limitar el tiempo de espera
            await Promise.race([savePromise, timeoutPromise]);
            
            // Intentar cerrar el modal de manera segura
            try {
                const modalElement = document.getElementById('addRepuestoModal');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    } else {
                        // Fallback si no se puede obtener la instancia
                        modalElement.style.display = 'none';
                        modalElement.classList.remove('show');
                        document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                    }
                }
                
                // Limpiar formulario
                const form = document.getElementById('addRepuestoForm');
                if (form) {
                    form.reset();
                }
            } catch (modalError) {
                console.error('Error al cerrar modal:', modalError);
                // Limpiar modal backdrop manualmente
                document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
            }
            
            if (loadingSwal) {
                loadingSwal.close();
            }
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Éxito',
                    text: 'Repuesto agregado correctamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                alert('Repuesto agregado correctamente');
            }
            
            // Actualizar contador y recargar
            try {
                await this.contarTotalRepuestos();
                this.currentPage = 1;
                this.lastVisible = null;
                await this.cargarRepuestosPaginados();
            } catch (refreshError) {
                console.error('Error al actualizar lista:', refreshError);
            }
            
        } catch (error) {
            console.error('Error al guardar repuesto:', error);
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo guardar el repuesto. ' + (error.message || ''),
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            } else {
                alert('Error al guardar el repuesto: ' + (error.message || ''));
            }
            
            // Limpiar modal backdrop manualmente en caso de error
            document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        }
    },

    procesarArchivo(input) {
        if (!input || !input.files || !input.files[0]) return;
        
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = e.target.result;
                let parsedData = [];
                
                if (file.name.endsWith('.csv')) {
                    // Procesar CSV
                    const lines = data.split('\n');
                    
                    // Procesar encabezados para encontrar índices de columnas
                    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
                    const codigoIndex = headers.findIndex(h => h.includes('código') || h.includes('codigo'));
                    const nombreIndex = headers.findIndex(h => h.includes('nombre'));
                    const precioIndex = headers.findIndex(h => h.includes('precio'));
                    
                    if (codigoIndex === -1 || nombreIndex === -1 || precioIndex === -1) {
                        throw new Error('El archivo CSV no tiene las columnas requeridas');
                    }
                    
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line) {
                            const columns = line.split(',');
                            
                            // Validar que el registro tenga datos válidos
                            const codigo = columns[codigoIndex]?.trim();
                            const nombre = columns[nombreIndex]?.trim();
                            const precio = parseFloat(columns[precioIndex]);
                            
                            if (codigo && nombre && !isNaN(precio)) {
                                parsedData.push({
                                    codigo: codigo,
                                    nombre: nombre,
                                    precio: precio
                                });
                            }
                        }
                    }
                } else {
                    // Procesar Excel
                    if (typeof XLSX === 'undefined') {
                        throw new Error('Librería XLSX no encontrada');
                    }
                    
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);
                    
                    parsedData = jsonData.map(row => {
                        // Intentar múltiples variaciones de nombres de columna
                        const codigo = row['Código'] || row['codigo'] || row['CODIGO'] || '';
                        const nombre = row['Nombre'] || row['nombre'] || row['NOMBRE'] || '';
                        const precio = parseFloat(row['Precio'] || row['precio'] || row['PRECIO'] || 0);
                        
                        return {
                            codigo: codigo.toString().trim(),
                            nombre: nombre.toString().trim(),
                            precio: isNaN(precio) ? 0 : precio
                        };
                    }).filter(item => item.codigo && item.nombre && item.precio > 0);
                }
                
                if (parsedData.length === 0) {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire('Error', 'No se encontraron datos válidos en el archivo', 'error');
                    } else {
                        alert('No se encontraron datos válidos en el archivo');
                    }
                    return;
                }
                
                this.datosTemporales = parsedData;
                this.mostrarPreview(parsedData);
            } catch (error) {
                console.error('Error procesando archivo:', error);
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'Error al procesar el archivo. ' + (error.message || ''), 'error');
                } else {
                    alert('Error al procesar el archivo: ' + (error.message || ''));
                }
            }
        };
        
        reader.onerror = (error) => {
            console.error('Error leyendo archivo:', error);
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'Error al leer el archivo', 'error');
            } else {
                alert('Error al leer el archivo');
            }
        };
        
        if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            reader.readAsBinaryString(file);
        }
    },

    mostrarPreview(datos) {
        const previewArea = document.getElementById('previewArea');
        const previewTable = document.querySelector('#previewTable tbody');
        const uploadBtn = document.getElementById('uploadBtn');
        
        if (!previewArea || !previewTable || !uploadBtn) {
            console.error('Elementos de preview no encontrados');
            return;
        }
        
        previewTable.innerHTML = '';
        datos.slice(0, 5).forEach(item => {
            previewTable.innerHTML += `
                <tr>
                    <td>${item.codigo}</td>
                    <td>${item.nombre}</td>
                    <td>$${item.precio.toFixed(2)}</td>
                </tr>
            `;
        });
        
        if (datos.length > 5) {
            previewTable.innerHTML += `
                <tr>
                    <td colspan="3" class="text-center">...y ${datos.length - 5} más</td>
                </tr>
            `;
        }
        
        previewArea.style.display = 'block';
        uploadBtn.disabled = false;
    },

    async cargarRepuestosMasivo() {
        if (!this.datosTemporales || this.datosTemporales.length === 0) {
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'No hay datos para cargar', 'error');
            } else {
                alert('No hay datos para cargar');
            }
            return;
        }
        
        try {
            // Verificar que firebase esté inicializado
            if (typeof firebase === 'undefined' || typeof firebase.firestore !== 'function') {
                throw new Error('Firebase no está disponible');
            }
            
            const totalRegistros = this.datosTemporales.length;
            const batchSize = 500; // Procesar en lotes de 500
            let procesados = 0;
            let actualizados = 0;
            let nuevos = 0;
            
            // Mostrar indicador de progreso
            let progressSwal;
            if (typeof Swal !== 'undefined') {
                progressSwal = Swal.fire({
                    title: 'Analizando repuestos...',
                    html: `Preparando datos...`,
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }
            
            // Primero, obtener todos los códigos de repuestos existentes
            const snapshot = await firebase.firestore().collection('repuestos').get();
            const repuestosExistentes = {};
            snapshot.forEach(doc => {
                const repuesto = doc.data();
                repuestosExistentes[repuesto.codigo] = {
                    id: doc.id,
                    ...repuesto
                };
            });
            
            if (progressSwal) {
                Swal.update({
                    title: 'Cargando repuestos...',
                    html: `Procesando: <b>0</b> de ${totalRegistros}`
                });
            }
            
            // Procesar en lotes para evitar sobrecargar Firebase
            for (let i = 0; i < totalRegistros; i += batchSize) {
                const batch = firebase.firestore().batch();
                const lote = this.datosTemporales.slice(i, i + batchSize);
                
                lote.forEach(repuesto => {
                    if (repuesto.codigo && repuesto.nombre && repuesto.precio) {
                        // Verificar si el repuesto ya existe
                        if (repuestosExistentes[repuesto.codigo]) {
                            // Actualizar repuesto existente
                            const docRef = firebase.firestore().collection('repuestos').doc(repuestosExistentes[repuesto.codigo].id);
                            batch.update(docRef, {
                                nombre: repuesto.nombre,
                                precio: repuesto.precio,
                                fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
                            });
                            actualizados++;
                        } else {
                            // Crear nuevo repuesto
                            const docRef = firebase.firestore().collection('repuestos').doc();
                            batch.set(docRef, {
                                codigo: repuesto.codigo,
                                nombre: repuesto.nombre,
                                precio: repuesto.precio,
                                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
                            });
                            nuevos++;
                        }
                    }
                });
                
                // Añadir un timeout para evitar bloqueos
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Tiempo de espera agotado')), 15000)
                );
                
                const batchPromise = batch.commit();
                
                // Usar Promise.race para limitar el tiempo de espera
                await Promise.race([batchPromise, timeoutPromise]);
                
                procesados += lote.length;
                
                // Actualizar progreso
                if (progressSwal) {
                    Swal.update({
                        html: `Procesando: <b>${procesados}</b> de ${totalRegistros}`
                    });
                }
            }
            
            // Cerrar modal en forma segura
            try {
                const modalElement = document.getElementById('uploadModal');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    } else {
                        // Fallback si no se puede obtener la instancia
                        modalElement.style.display = 'none';
                        modalElement.classList.remove('show');
                        document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                    }
                }
            } catch (modalError) {
                console.error('Error al cerrar modal:', modalError);
                // Limpiar modal backdrop manualmente
                document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
            }
            
            if (progressSwal) {
                progressSwal.close();
            }
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Éxito', `Proceso completado con éxito.\nNuevos repuestos: ${nuevos}\nRepuestos actualizados: ${actualizados}`, 'success');
            } else {
                alert(`Proceso completado con éxito.\nNuevos repuestos: ${nuevos}\nRepuestos actualizados: ${actualizados}`);
            }
            
            // Actualizar vista
            await this.contarTotalRepuestos();
            this.currentPage = 1;
            this.lastVisible = null;
            await this.cargarRepuestosPaginados();
            
            // Resetear
            this.datosTemporales = [];
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.value = '';
            }
            const previewArea = document.getElementById('previewArea');
            if (previewArea) {
                previewArea.style.display = 'none';
            }
            const uploadBtn = document.getElementById('uploadBtn');
            if (uploadBtn) {
                uploadBtn.disabled = true;
            }
            
        } catch (error) {
            console.error('Error en carga masiva:', error);
            
            // Limpiar modal backdrop manualmente en caso de error
            document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', `No se pudieron cargar los repuestos: ${error.message}`, 'error');
            } else {
                alert(`Error en carga masiva: ${error.message}`);
            }
        }
    },

    async eliminarRepuesto(id) {
        if (!id) return;
        
        try {
            // Pedir confirmación
            let confirmed = false;
            if (typeof Swal !== 'undefined') {
                const result = await Swal.fire({
                    title: '¿Estás seguro?',
                    text: "Esta acción no se puede deshacer",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                });
                
                confirmed = result.isConfirmed;
            } else {
                confirmed = confirm("¿Estás seguro de que deseas eliminar este repuesto?");
            }
            
            if (!confirmed) return;
            
            // Verificar que firebase esté inicializado
            if (typeof firebase === 'undefined' || typeof firebase.firestore !== 'function') {
                throw new Error('Firebase no está disponible');
            }
            
            // Mostrar indicador de carga
            let loadingSwal;
            if (typeof Swal !== 'undefined') {
                loadingSwal = Swal.fire({
                    title: 'Eliminando...',
                    text: 'Espere por favor',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }
            
            // Agregar tiempo de espera máximo
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000)
            );
            
            const deletePromise = firebase.firestore().collection('repuestos').doc(id).delete();
            
            // Usar Promise.race para limitar el tiempo de espera
            await Promise.race([deletePromise, timeoutPromise]);
            
            if (loadingSwal) {
                loadingSwal.close();
            }
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Eliminado',
                    text: 'El repuesto ha sido eliminado',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                alert('Repuesto eliminado correctamente');
            }
            
            // Actualizar contador y recargar
            try {
                await this.contarTotalRepuestos();
                await this.cargarRepuestosPaginados(this.currentPage);
            } catch (refreshError) {
                console.error('Error al actualizar lista:', refreshError);
            }
            
        } catch (error) {
            console.error('Error al eliminar:', error);
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'No se pudo eliminar el repuesto: ' + (error.message || ''), 'error');
            } else {
                alert('Error al eliminar el repuesto: ' + (error.message || ''));
            }
        }
    },
    
    async editarRepuesto(id) {
        if (!id) return;
        
        try {
            // Verificar que firebase esté inicializado
            if (typeof firebase === 'undefined' || typeof firebase.firestore !== 'function') {
                throw new Error('Firebase no está disponible');
            }
            
            // Mostrar indicador de carga
            let loadingSwal;
            if (typeof Swal !== 'undefined') {
                loadingSwal = Swal.fire({
                    title: 'Cargando repuesto...',
                    text: 'Espere por favor',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }
            
            // Agregar tiempo de espera máximo
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000)
            );
            
            const docPromise = firebase.firestore().collection('repuestos').doc(id).get();
            
            // Usar Promise.race para limitar el tiempo de espera
            const doc = await Promise.race([docPromise, timeoutPromise]);
            
            if (loadingSwal) {
                loadingSwal.close();
            }
            
            if (!doc.exists) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'El repuesto no existe', 'error');
                } else {
                    alert('El repuesto no existe');
                }
                return;
            }
            
            const repuesto = doc.data();
            
            // Crear modal de edición dinámicamente
            const modalHtml = `
                <div class="modal fade" id="editRepuestoModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Editar Repuesto</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="editRepuestoForm">
                                    <div class="mb-3">
                                        <label for="editCodigo" class="form-label">Código del Objeto</label>
                                        <input type="text" class="form-control" id="editCodigo" value="${repuesto.codigo || ''}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="editNombre" class="form-label">Nombre del Artículo</label>
                                        <input type="text" class="form-control" id="editNombre" value="${repuesto.nombre || ''}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="editPrecio" class="form-label">Precio</label>
                                        <input type="number" class="form-control" id="editPrecio" value="${repuesto.precio || 0}" step="0.01" required>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="repuestosComponent.actualizarRepuesto('${id}')">Actualizar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Eliminar modal anterior si existe
            const existingModal = document.getElementById('editRepuestoModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Agregar nuevo modal al DOM
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Mostrar modal
            try {
                const modalElement = document.getElementById('editRepuestoModal');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            } catch (modalError) {
                console.error('Error al mostrar modal:', modalError);
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'No se pudo mostrar el formulario de edición', 'error');
                } else {
                    alert('Error al mostrar el formulario de edición');
                }
            }
            
        } catch (error) {
            console.error('Error al editar repuesto:', error);
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'No se pudo cargar el repuesto para editar: ' + (error.message || ''), 'error');
            } else {
                alert('Error al cargar el repuesto para editar: ' + (error.message || ''));
            }
        }
    },

    async actualizarRepuesto(id) {
        if (!id) return;
        
        try {
            const codigo = document.getElementById('editCodigo')?.value;
            const nombre = document.getElementById('editNombre')?.value;
            const precioElement = document.getElementById('editPrecio');
            const precio = precioElement ? parseFloat(precioElement.value) : 0;
            
            if (!codigo || !nombre || isNaN(precio)) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'Todos los campos son requeridos y el precio debe ser un número', 'error');
                } else {
                    alert('Todos los campos son requeridos y el precio debe ser un número');
                }
                return;
            }
            
            // Verificar que firebase esté inicializado
            if (typeof firebase === 'undefined' || typeof firebase.firestore !== 'function') {
                throw new Error('Firebase no está disponible');
            }
            
            // Mostrar indicador de carga
            let loadingSwal;
            if (typeof Swal !== 'undefined') {
                loadingSwal = Swal.fire({
                    title: 'Actualizando...',
                    text: 'Espere por favor',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }
            
            // Agregar tiempo de espera máximo
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000)
            );
            
            const updatePromise = firebase.firestore().collection('repuestos').doc(id).update({
                codigo,
                nombre,
                precio,
                fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Usar Promise.race para limitar el tiempo de espera
            await Promise.race([updatePromise, timeoutPromise]);
            
            // Intentar cerrar el modal de manera segura
            try {
                const modalElement = document.getElementById('editRepuestoModal');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    } else {
                        // Fallback si no se puede obtener la instancia
                        modalElement.style.display = 'none';
                        modalElement.classList.remove('show');
                        document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                    }
                }
            } catch (modalError) {
                console.error('Error al cerrar modal:', modalError);
                // Limpiar modal backdrop manualmente
                document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
            }
            
            if (loadingSwal) {
                loadingSwal.close();
            }
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Éxito',
                    text: 'Repuesto actualizado correctamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                alert('Repuesto actualizado correctamente');
            }
            
            // Recargar la página actual
            try {
                await this.cargarRepuestosPaginados(this.currentPage);
            } catch (refreshError) {
                console.error('Error al actualizar lista:', refreshError);
            }
            
        } catch (error) {
            console.error('Error al actualizar repuesto:', error);
            
            // Limpiar modal backdrop manualmente en caso de error
            document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'No se pudo actualizar el repuesto: ' + (error.message || ''), 'error');
            } else {
                alert('Error al actualizar el repuesto: ' + (error.message || ''));
            }
        }
    },

    inicializarEventos() {
        // Búsqueda con debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.buscarRepuestos();
                }, 500); // Esperar 500ms después de que el usuario deje de escribir
            });
            
            // Buscar al presionar Enter
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.buscarRepuestos();
                }
            });
        }
        
        // Drag and drop
        const uploadArea = document.querySelector('.file-upload-area');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.backgroundColor = '#e9ecef';
            });
            
            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.style.backgroundColor = '';
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.backgroundColor = '';
                
                if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files[0]) return;
                
                const file = e.dataTransfer.files[0];
                if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                    const fileInput = document.getElementById('fileInput');
                    if (fileInput) {
                        fileInput.files = e.dataTransfer.files;
                        this.procesarArchivo(fileInput);
                    }
                } else {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire('Error', 'Por favor selecciona un archivo CSV o Excel', 'error');
                    } else {
                        alert('Por favor selecciona un archivo CSV o Excel');
                    }
                }
            });
        }
    }
};
