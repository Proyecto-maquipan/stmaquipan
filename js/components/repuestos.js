// Componente de Gestión de Repuestos
const repuestosComponent = {
    datosTemporales: [],
    
    async render(container) {
        try {
            container.innerHTML = `
                <div class="container-fluid">
                    <div class="row mb-4">
                        <div class="col-12">
                            <h2><i class="fas fa-tools me-2"></i>Gestión de Repuestos</h2>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="row mb-4">
                        <div class="col-12">
                            <button class="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target="#addRepuestoModal">
                                <i class="fas fa-plus me-2"></i>Agregar Repuesto
                            </button>
                            <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#uploadModal">
                                <i class="fas fa-upload me-2"></i>Carga Masiva
                            </button>
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
                                    <tbody>
                                        <!-- Los datos se cargarán dinámicamente -->
                                    </tbody>
                                </table>
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
            
            // Cargar datos
            await this.cargarRepuestos();
            
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
            `;
            document.head.appendChild(style);
        }
    },

    async cargarRepuestos() {
        try {
            const repuestosSnapshot = await firebase.firestore().collection('repuestos').get();
            const tbody = document.querySelector('#repuestosTable tbody');
            tbody.innerHTML = '';
            
            repuestosSnapshot.forEach(doc => {
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
        } catch (error) {
            console.error('Error al cargar repuestos:', error);
            Swal.fire('Error', 'No se pudieron cargar los repuestos', 'error');
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
            this.cargarRepuestos();
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
                
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line) {
                        const [codigo, nombre, precio] = line.split(',');
                        parsedData.push({
                            codigo: codigo.trim(),
                            nombre: nombre.trim(),
                            precio: parseFloat(precio)
                        });
                    }
                }
            } else {
                // Procesar Excel
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                
                parsedData = jsonData.map(row => ({
                    codigo: row['Código'] || row['codigo'],
                    nombre: row['Nombre'] || row['nombre'],
                    precio: parseFloat(row['Precio'] || row['precio'])
                }));
            }
            
            this.datosTemporales = parsedData;
            this.mostrarPreview(parsedData);
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
            Swal.fire({
                title: 'Cargando repuestos...',
                text: 'Por favor espere',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            const batch = firebase.firestore().batch();
            
            this.datosTemporales.forEach(repuesto => {
                const docRef = firebase.firestore().collection('repuestos').doc();
                batch.set(docRef, {
                    ...repuesto,
                    fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
                });
            });
            
            await batch.commit();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
            modal.hide();
            
            Swal.fire('Éxito', `${this.datosTemporales.length} repuestos cargados correctamente`, 'success');
            this.cargarRepuestos();
            
            // Resetear
            this.datosTemporales = [];
            document.getElementById('fileInput').value = '';
            document.getElementById('previewArea').style.display = 'none';
            document.getElementById('uploadBtn').disabled = true;
            
        } catch (error) {
            console.error('Error en carga masiva:', error);
            Swal.fire('Error', 'No se pudieron cargar los repuestos', 'error');
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
                this.cargarRepuestos();
            } catch (error) {
                console.error('Error al eliminar:', error);
                Swal.fire('Error', 'No se pudo eliminar el repuesto', 'error');
            }
        }
    },

    inicializarEventos() {
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
