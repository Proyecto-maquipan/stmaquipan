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
            
            // Contar total de repuestos
            await this.contarTotalRepuestos();
            
            // Cargar primera página
            await this.cargarRepuestosPaginados();
            
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
            const snapshot = await firebase.firestore().collection('repuestos').get();
            this.totalItems = snapshot.size;
            document.getElementById('totalRepuestos').textContent = this.totalItems.toLocaleString();
        } catch (error) {
            console.error('Error contando repuestos:', error);
        }
    },

    async cargarRepuestosPaginados(page = 1) {
        try {
            const tbody = document.getElementById('repuestosTableBody');
            tbody.innerHTML = '<tr><td colspan="4" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';
            
            let query = firebase.firestore().collection('repuestos')
                .orderBy(this.ordenamiento, this.direccionOrden)
                .limit(this.itemsPerPage);
            
            // Si no es la primera página, usar el último documento visible
            if (page > 1 && this.lastVisible) {
                query = query.startAfter(this.lastVisible);
            }
            
            const snapshot = await query.get();
            
            // Guardar el último documento para la siguiente página
            if (!snapshot.empty) {
                this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
            }
            
            // Renderizar datos
            tbody.innerHTML = '';
            snapshot.forEach(doc => {
                const repuesto = doc.data();
                tbody.innerHTML += `
                    <tr>
                        <td>${repuesto.codigo}</td>
                        <td>${repuesto.nombre}</td>
                        <td>$${repuesto.precio.toFixed(2)}</td>
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
            
            if (snapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron repuestos</td></tr>';
            }
            
            this.currentPage = page;
            this.actualizarPaginacion();
            
        } catch (error) {
            console.error('Error al cargar repuestos paginados:', error);
            Swal.fire('Error', 'No se pudieron cargar los repuestos', 'error');
        }
    },

    cambiarOrdenamiento() {
        const ordenamientoSelect = document.getElementById('ordenamiento');
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
        pagination.innerHTML = '';
        
        // Botón anterior
        pagination.innerHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="repuestosComponent.cambiarPagina(${this.currentPage - 1}); return false;">Anterior</a>
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
                    <a class="page-link" href="#" onclick="repuestosComponent.cambiarPagina(${i}); return false;">${i}</a>
                </li>
            `;
        }
        
        // Botón siguiente
        pagination.innerHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="repuestosComponent.cambiarPagina(${this.currentPage + 1}); return false;">Siguiente</a>
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
        const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
        
        if (searchTerm === '') {
            // Si no hay término de búsqueda, volver a la vista normal
            this.currentPage = 1;
            this.lastVisible = null;
            this.cargarRepuestosPaginados();
            return;
        }
        
        try {
            const tbody = document.getElementById('repuestosTableBody');
            tbody.innerHTML = '<tr><td colspan="4" class="text-center"><i class="fas fa-spinner fa-spin"></i> Buscando...</td></tr>';
            
            // Buscar por código exacto primero
            let query = firebase.firestore().collection('repuestos')
                .where('codigo', '==', searchTerm.toUpperCase())
                .limit(50);
            
            let snapshot = await query.get();
            
            // Si no se encuentra por código, buscar en nombre
            if (snapshot.empty) {
                // Firebase no soporta búsquedas de texto completo, así que necesitamos obtener todos los documentos
                // y filtrar en el cliente. Para optimizar, limitamos la búsqueda.
                const allSnapshot = await firebase.firestore().collection('repuestos')
                    .orderBy('nombre')
                    .get();
                
                const results = [];
                allSnapshot.forEach(doc => {
                    const repuesto = doc.data();
                    if (repuesto.nombre.toLowerCase().includes(searchTerm)) {
                        results.push({ id: doc.id, ...repuesto });
                    }
                });
                
                // Limitar a los primeros 50 resultados
                const limitedResults = results.slice(0, 50);
                
                tbody.innerHTML = '';
                limitedResults.forEach(repuesto => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${repuesto.codigo}</td>
                            <td>${repuesto.nombre}</td>
                            <td>$${repuesto.precio.toFixed(2)}</td>
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
                
                if (limitedResults.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron resultados</td></tr>';
                }
                
                // Deshabilitar paginación durante búsqueda
                document.getElementById('pagination').innerHTML = '';
            } else {
                // Mostrar resultados de búsqueda por código
                tbody.innerHTML = '';
                snapshot.forEach(doc => {
                    const repuesto = doc.data();
                    tbody.innerHTML += `
                        <tr>
                            <td>${repuesto.codigo}</td>
                            <td>${repuesto.nombre}</td>
                            <td>$${repuesto.precio.toFixed(2)}</td>
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
                document.getElementById('pagination').innerHTML = '';
            }
            
        } catch (error) {
            console.error('Error en búsqueda:', error);
            Swal.fire('Error', 'Error al realizar la búsqueda', 'error');
        }
    },

    async guardarRepuesto() {
        const codigo = document.getElementById('codigo').value;
        const nombre = document.getElementById('nombre').value;
        const precio = parseFloat(document.getElementById('precio').value);
        
        if (!codigo || !nombre || !precio) {
            Swal.fire('Error', 'Todos los campos son requeridos', 'error');
            return;
        }
        
        try {
            await firebase.firestore().collection('repuestos').add({
                codigo,
                nombre,
                precio,
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addRepuestoModal'));
            modal.hide();
            document.getElementById('addRepuestoForm').reset();
            
            Swal.fire('Éxito', 'Repuesto agregado correctamente', 'success');
            
            // Actualizar contador y recargar
            await this.contarTotalRepuestos();
            this.currentPage = 1;
            this.lastVisible = null;
            this.cargarRepuestosPaginados();
        } catch (error) {
            console.error('Error al guardar repuesto:', error);
            Swal.fire('Error', 'No se pudo guardar el repuesto', 'error');
        }
    },

    procesarArchivo(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
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
                Swal.fire('Error', 'No se encontraron datos válidos en el archivo', 'error');
                return;
            }
            
            this.datosTemporales = parsedData;
            this.mostrarPreview(parsedData);
        };
        
        reader.onerror = (error) => {
            console.error('Error leyendo archivo:', error);
            Swal.fire('Error', 'Error al leer el archivo', 'error');
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
        if (this.datosTemporales.length === 0) {
            Swal.fire('Error', 'No hay datos para cargar', 'error');
            return;
        }
        
        try {
            const totalRegistros = this.datosTemporales.length;
            const batchSize = 500; // Procesar en lotes de 500
            let procesados = 0;
            let actualizados = 0;
            let nuevos = 0;
            
            Swal.fire({
                title: 'Analizando repuestos...',
                html: `Preparando datos...`,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
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
            
            Swal.update({
                title: 'Cargando repuestos...',
                html: `Procesando: <b>0</b> de ${totalRegistros}`
            });
            
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
                
                await batch.commit();
                procesados += lote.length;
                
                // Actualizar progreso
                Swal.update({
                    html: `Procesando: <b>${procesados}</b> de ${totalRegistros}`
                });
            }
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
            modal.hide();
            
            Swal.fire('Éxito', `Proceso completado con éxito.\nNuevos repuestos: ${nuevos}\nRepuestos actualizados: ${actualizados}`, 'success');
            
            // Actualizar vista
            await this.contarTotalRepuestos();
            this.currentPage = 1;
            this.lastVisible = null;
            this.cargarRepuestosPaginados();
            
            // Resetear
            this.datosTemporales = [];
            document.getElementById('fileInput').value = '';
            document.getElementById('previewArea').style.display = 'none';
            document.getElementById('uploadBtn').disabled = true;
            
        } catch (error) {
            console.error('Error en carga masiva:', error);
            Swal.fire('Error', `No se pudieron cargar los repuestos: ${error.message}`, 'error');
        }
    },

    async eliminarRepuesto(id) {
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
    
    if (result.isConfirmed) {
        try {
            await firebase.firestore().collection('repuestos').doc(id).delete();
            Swal.fire('Eliminado', 'El repuesto ha sido eliminado', 'success');
            
            // Actualizar vista
            await this.contarTotalRepuestos();
            this.cargarRepuestosPaginados(this.currentPage);
        } catch (error) {
            console.error('Error al eliminar:', error);
            Swal.fire('Error', 'No se pudo eliminar el repuesto', 'error');
        }
    }
},
    async editarRepuesto(id) {
        try {
            const doc = await firebase.firestore().collection('repuestos').doc(id).get();
            
            if (!doc.exists) {
                Swal.fire('Error', 'El repuesto no existe', 'error');
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
                                        <input type="text" class="form-control" id="editCodigo" value="${repuesto.codigo}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="editNombre" class="form-label">Nombre del Artículo</label>
                                        <input type="text" class="form-control" id="editNombre" value="${repuesto.nombre}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="editPrecio" class="form-label">Precio</label>
                                        <input type="number" class="form-control" id="editPrecio" value="${repuesto.precio}" step="0.01" required>
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
            const modal = new bootstrap.Modal(document.getElementById('editRepuestoModal'));
            modal.show();
            
        } catch (error) {
            console.error('Error al editar repuesto:', error);
            Swal.fire('Error', 'No se pudo cargar el repuesto para editar', 'error');
        }
    },

    async actualizarRepuesto(id) {
        const codigo = document.getElementById('editCodigo').value;
        const nombre = document.getElementById('editNombre').value;
        const precio = parseFloat(document.getElementById('editPrecio').value);
        
        if (!codigo || !nombre || !precio) {
            Swal.fire('Error', 'Todos los campos son requeridos', 'error');
            return;
        }
        
        try {
            await firebase.firestore().collection('repuestos').doc(id).update({
                codigo,
                nombre,
                precio,
                fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('editRepuestoModal'));
            modal.hide();
            
            Swal.fire('Éxito', 'Repuesto actualizado correctamente', 'success');
            
            // Recargar la página actual
            this.cargarRepuestosPaginados(this.currentPage);
            
        } catch (error) {
            console.error('Error al actualizar repuesto:', error);
            Swal.fire('Error', 'No se pudo actualizar el repuesto', 'error');
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
                
                const file = e.dataTransfer.files[0];
                if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                    document.getElementById('fileInput').files = e.dataTransfer.files;
                    this.procesarArchivo(document.getElementById('fileInput'));
                } else {
                    Swal.fire('Error', 'Por favor selecciona un archivo CSV o Excel', 'error');
                }
            });
        }
    }
};
