// Componente de Gestión de Clientes
const clientesComponent = {
async render(container) {
    try {
        const appContainer = container || document.getElementById('app');
        appContainer.innerHTML = `
                <div class="container-fluid">
                    <div class="row mb-4">
                        <div class="col-12">
                            <h2><i class="fas fa-users me-2"></i>Gestión de Clientes</h2>
                        </div>
                    </div>

                    <!-- Barra de búsqueda y botones -->
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="input-group">
                                <input type="text" class="form-control" id="searchInput" placeholder="Buscar cliente...">
                                <button class="btn btn-outline-secondary" type="button" onclick="clientesComponent.buscarClientes()">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-8 text-end">
                            <button class="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target="#addClienteModal">
                                <i class="fas fa-plus me-2"></i>Agregar Cliente
                            </button>
                            <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#uploadModal">
                                <i class="fas fa-upload me-2"></i>Carga Masiva
                            </button>
                        </div>
                    </div>

                    <!-- Tabla de clientes -->
                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover" id="clientesTable">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>RUT</th>
                                            <th>Razón Social</th>
                                            <th>Contacto</th>
                                            <th>Teléfono</th>
                                            <th>Email</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="clientesTableBody">
                                        <tr>
                                            <td colspan="7" class="text-center">
                                                <i class="fas fa-spinner fa-spin"></i> Cargando clientes...
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal para agregar cliente -->
                <div class="modal fade" id="addClienteModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Agregar Nuevo Cliente</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addClienteForm">
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label for="rut" class="form-label">RUT:</label>
                                            <input type="text" class="form-control" id="rut" required pattern="[0-9]{1,8}-[0-9kK]{1}" placeholder="12345678-9">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="razonSocial" class="form-label">Razón Social:</label>
                                            <input type="text" class="form-control" id="razonSocial" required>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-3">
                                        <div class="col-md-8">
                                            <label for="direccion" class="form-label">Dirección:</label>
                                            <input type="text" class="form-control" id="direccion" required>
                                        </div>
                                        <div class="col-md-4">
                                            <label for="ciudad" class="form-label">Ciudad:</label>
                                            <input type="text" class="form-control" id="ciudad" required>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label for="contacto" class="form-label">Contacto:</label>
                                            <input type="text" class="form-control" id="contacto" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label for="telefono" class="form-label">Teléfono:</label>
                                            <input type="tel" class="form-control" id="telefono" required>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="email" class="form-label">Email:</label>
                                        <input type="email" class="form-control" id="email">
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="clientesComponent.guardarCliente()">Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal para carga masiva -->
                <div class="modal fade" id="uploadModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Carga Masiva de Clientes</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="alert alert-info">
                                    <strong>Formato requerido:</strong> Archivo CSV o Excel con las columnas: RUT; Razón Social; Dirección; Ciudad; Contacto; Teléfono; Email
                                </div>
                                <div class="file-upload-area" onclick="document.getElementById('fileInput').click()">
                                    <i class="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                                    <p>Arrastra y suelta tu archivo aquí o haz clic para seleccionar</p>
                                    <input type="file" id="fileInput" accept=".csv,.xlsx,.xls" style="display: none;" onchange="clientesComponent.procesarArchivo(this)">
                                </div>
                                <div id="previewArea" class="mt-3" style="display: none;">
                                    <h6>Vista previa de datos:</h6>
                                    <div class="table-responsive">
                                        <table class="table table-sm" id="previewTable">
                                            <thead>
                                                <tr>
                                                    <th>RUT</th>
                                                    <th>Razón Social</th>
                                                    <th>Dirección</th>
                                                    <th>Ciudad</th>
                                                    <th>Contacto</th>
                                                    <th>Teléfono</th>
                                                    <th>Email</th>
                                                </tr>
                                            </thead>
                                            <tbody id="previewTableBody">
                                                <!-- Datos de preview -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="clientesComponent.cargarClientesMasivo()" disabled id="uploadBtn">Cargar Datos</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Cargar estilos personalizados
            this.agregarEstilos();
            
            // Cargar datos iniciales
            await this.cargarClientes();
            
            // Inicializar eventos
            this.inicializarEventos();
            
       } catch (error) {
        console.error('Error al renderizar clientes:', error);
        const appContainer = container || document.getElementById('app');
        appContainer.innerHTML = `
                <div class="alert alert-danger">
                    <h3>Error al cargar el módulo de clientes</h3>
                    <p>No se pudieron cargar los datos. Por favor, verifica tu conexión.</p>
                    <button class="btn btn-primary" onclick="router.navigate('dashboard')">Volver al Dashboard</button>
                </div>
            `;
        }
    },
    
    agregarEstilos() {
        if (!document.getElementById('clientes-styles')) {
            const style = document.createElement('style');
            style.id = 'clientes-styles';
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
            `;
            document.head.appendChild(style);
        }
    },
    
    async cargarClientes() {
        try {
            const clientes = await FirebaseService.getClientes();
            
            const tbody = document.getElementById('clientesTableBody');
            tbody.innerHTML = '';
            
            if (clientes.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">No se encontraron clientes registrados</td>
                    </tr>
                `;
                return;
            }
            
            clientes.forEach(cliente => {
                tbody.innerHTML += `
                    <tr>
                        <td>${cliente.codigo || ''}</td>
                        <td>${cliente.rut || ''}</td>
                        <td>${cliente.razonSocial || ''}</td>
                        <td>${cliente.contacto || ''}</td>
                        <td>${cliente.telefono || ''}</td>
                        <td>${cliente.email || ''}</td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="clientesComponent.editarCliente('${cliente.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="clientesComponent.eliminarCliente('${cliente.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="router.navigate('locales-cliente/${cliente.id}')">
                                <i class="fas fa-store"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
        }
    },
    
    async guardarCliente() {
        try {
            const rut = document.getElementById('rut').value;
            const razonSocial = document.getElementById('razonSocial').value;
            const direccion = document.getElementById('direccion').value;
            const ciudad = document.getElementById('ciudad').value;
            const contacto = document.getElementById('contacto').value;
            const telefono = document.getElementById('telefono').value;
            const email = document.getElementById('email').value;
            
            if (!rut || !razonSocial || !direccion || !ciudad || !contacto || !telefono) {
                Swal.fire('Error', 'Todos los campos obligatorios deben ser completados', 'error');
                return;
            }
            
            // Validar formato RUT
            const rutPattern = /^[0-9]{1,8}-[0-9kK]{1}$/;
            if (!rutPattern.test(rut)) {
                Swal.fire('Error', 'El RUT debe tener el formato correcto (ej: 12345678-9)', 'error');
                return;
            }
            
            // Datos del cliente
            const cliente = {
                rut,
                razonSocial,
                direccion,
                ciudad,
                contacto,
                telefono,
                email,
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Verificar si el RUT ya existe
            const clientes = await FirebaseService.getClientes();
            const clienteExistente = clientes.find(c => c.rut === rut);
            if (clienteExistente) {
                Swal.fire('Error', 'Ya existe un cliente con ese RUT', 'error');
                return;
            }
            
            // Guardar en Firebase
            await FirebaseService.saveCliente(cliente);
            
            // Cerrar modal y resetear formulario
            const modal = bootstrap.Modal.getInstance(document.getElementById('addClienteModal'));
            modal.hide();
            document.getElementById('addClienteForm').reset();
            
            Swal.fire('Éxito', 'Cliente agregado correctamente', 'success');
            
            // Recargar datos
            await this.cargarClientes();
            
        } catch (error) {
            console.error('Error al guardar cliente:', error);
            Swal.fire('Error', 'No se pudo guardar el cliente', 'error');
        }
    },
    
    procesarArchivo(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const data = e.target.result;
            let parsedData = [];
            
            try {
                if (file.name.endsWith('.csv')) {
                    // Procesar CSV
                    parsedData = this.procesarCSV(data);
                } else {
                    // Procesar Excel
                    parsedData = this.procesarExcel(data);
                }
                
                if (parsedData.length === 0) {
                    Swal.fire('Error', 'No se encontraron datos válidos en el archivo', 'error');
                    return;
                }
                
                this.datosTemporales = parsedData;
                this.mostrarPreview(parsedData);
                
            } catch (error) {
                console.error('Error procesando archivo:', error);
                Swal.fire('Error', 'Error al procesar el archivo. Verifique el formato.', 'error');
            }
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
    
    procesarCSV(data) {
        const lines = data.split('\n');
        if (lines.length < 2) return [];
        
        // Procesar encabezados
        const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
        
        // Validar encabezados
        const requiredHeaders = ['rut', 'razón social', 'dirección', 'ciudad', 'contacto', 'teléfono', 'email'];
        if (!this.validarEncabezados(headers, requiredHeaders)) {
            throw new Error('Formato de encabezados incorrecto');
        }
        
        // Procesar datos
        const parsedData = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = line.split(';').map(v => v.trim());
            
            if (values.length >= 7) {
                parsedData.push({
                    rut: values[0],
                    razonSocial: values[1],
                    direccion: values[2],
                    ciudad: values[3],
                    contacto: values[4],
                    telefono: values[5],
                    email: values[6]
                });
            }
        }
        
        return parsedData;
    },
    
    procesarExcel(data) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (jsonData.length < 2) return [];
        
        // Procesar encabezados
        const headers = jsonData[0].map(h => h.toString().trim().toLowerCase());
        
        // Validar encabezados
        const requiredHeaders = ['rut', 'razón social', 'dirección', 'ciudad', 'contacto', 'teléfono', 'email'];
        if (!this.validarEncabezados(headers, requiredHeaders)) {
            throw new Error('Formato de encabezados incorrecto');
        }
        
        // Procesar datos
        const parsedData = [];
        
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;
            
            if (row.length >= 7) {
                parsedData.push({
                    rut: row[0]?.toString() || '',
                    razonSocial: row[1]?.toString() || '',
                    direccion: row[2]?.toString() || '',
                    ciudad: row[3]?.toString() || '',
                    contacto: row[4]?.toString() || '',
                    telefono: row[5]?.toString() || '',
                    email: row[6]?.toString() || ''
                });
            }
        }
        
        return parsedData;
    },
    
    validarEncabezados(headers, requiredHeaders) {
        // Simplificar verificación: todos los encabezados requeridos deben estar presentes
        const simplifiedHeaders = headers.map(h => h.toLowerCase().replace(/[°\s]/g, ''));
        const simplifiedRequired = requiredHeaders.map(h => h.toLowerCase().replace(/[°\s]/g, ''));
        
        return simplifiedRequired.every(req => 
            simplifiedHeaders.some(h => h.includes(req))
        );
    },
    
    mostrarPreview(datos) {
        const previewArea = document.getElementById('previewArea');
        const previewTableBody = document.getElementById('previewTableBody');
        const uploadBtn = document.getElementById('uploadBtn');
        
        previewTableBody.innerHTML = '';
        datos.slice(0, 5).forEach(item => {
            previewTableBody.innerHTML += `
                <tr>
                    <td>${item.rut || ''}</td>
                    <td>${item.razonSocial || ''}</td>
                    <td>${item.direccion || ''}</td>
                    <td>${item.ciudad || ''}</td>
                    <td>${item.contacto || ''}</td>
                    <td>${item.telefono || ''}</td>
                    <td>${item.email || ''}</td>
                </tr>
            `;
        });
        
        if (datos.length > 5) {
            previewTableBody.innerHTML += `
                <tr>
                    <td colspan="7" class="text-center">...y ${datos.length - 5} más</td>
                </tr>
            `;
        }
        
        previewArea.style.display = 'block';
        uploadBtn.disabled = false;
    },
    
    async cargarClientesMasivo() {
        if (!this.datosTemporales || this.datosTemporales.length === 0) {
            Swal.fire('Error', 'No hay datos para cargar', 'error');
            return;
        }
        
        try {
            const totalRegistros = this.datosTemporales.length;
            const batchSize = 100; // Procesar en lotes de 100
            let procesados = 0;
            let errores = 0;
            
            // Obtener clientes existentes para verificar RUTs duplicados
            const clientesExistentes = await FirebaseService.getClientes();
            const rutsExistentes = new Set(clientesExistentes.map(c => c.rut));
            
            Swal.fire({
                title: 'Cargando clientes...',
                html: `Procesando: <b>0</b> de ${totalRegistros}`,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            // Procesar en lotes para evitar sobrecargar Firebase
            for (let i = 0; i < totalRegistros; i += batchSize) {
                const batch = firebase.firestore().batch();
                const lote = this.datosTemporales.slice(i, i + batchSize);
                
                for (const cliente of lote) {
                    // Verificar RUT duplicado
                    if (rutsExistentes.has(cliente.rut)) {
                        console.warn(`RUT duplicado: ${cliente.rut}`);
                        errores++;
                        continue; // Saltar este registro
                    }
                    
                    // Validar formato RUT
                    const rutPattern = /^[0-9]{1,8}-[0-9kK]{1}$/;
                    if (!rutPattern.test(cliente.rut)) {
                        console.warn(`Formato RUT inválido: ${cliente.rut}`);
                        errores++;
                        continue; // Saltar este registro
                    }
                    
                    // Agregar RUT a la lista de existentes para verificar duplicados en el mismo lote
                    rutsExistentes.add(cliente.rut);
                    
                    const docRef = firebase.firestore().collection('clientes').doc();
                    
                    batch.set(docRef, {
                        ...cliente,
                        id: docRef.id,
                        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                await batch.commit();
                procesados += lote.length - errores;
                
                // Actualizar progreso
                Swal.update({
                    html: `Procesando: <b>${procesados}</b> de ${totalRegistros} (${errores} errores)`
                });
            }
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('uploadModal'));
            modal.hide();
            
            if (errores > 0) {
                Swal.fire('Completado con advertencias', `${procesados} clientes cargados correctamente. ${errores} registros no pudieron procesarse debido a datos incompletos o RUTs duplicados.`, 'warning');
            } else {
                Swal.fire('Éxito', `${procesados} clientes cargados correctamente`, 'success');
            }
            
            // Recargar datos
            await this.cargarClientes();
            
            // Resetear
            this.datosTemporales = [];
            document.getElementById('fileInput').value = '';
            document.getElementById('previewArea').style.display = 'none';
            document.getElementById('uploadBtn').disabled = true;
            
        } catch (error) {
            console.error('Error en carga masiva:', error);
            Swal.fire('Error', `No se pudieron cargar los clientes: ${error.message}`, 'error');
        }
    },
    
    async eliminarCliente(id) {
        // Verificar si el cliente tiene locales asociados
        try {
            const locales = await FirebaseService.getLocalesByCliente(id);
            
            if (locales.length > 0) {
                Swal.fire('Error', `No se puede eliminar el cliente porque tiene ${locales.length} locales asociados. Elimine primero los locales.`, 'error');
                return;
            }
            
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
                await FirebaseService.deleteCliente(id);
                Swal.fire('Eliminado', 'El cliente ha sido eliminado', 'success');
                
                // Recargar datos
                await this.cargarClientes();
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            Swal.fire('Error', 'No se pudo eliminar el cliente', 'error');
        }
    },
    
    async editarCliente(id) {
        try {
            const cliente = await FirebaseService.getClienteById(id);
            
            if (!cliente) {
                Swal.fire('Error', 'No se encontró el cliente', 'error');
                return;
            }
            
            // Crear modal de edición dinámicamente
            const modalHtml = `
                <div class="modal fade" id="editClienteModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Editar Cliente</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="editClienteForm">
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label for="editRut" class="form-label">RUT:</label>
                                            <input type="text" class="form-control" id="editRut" value="${cliente.rut || ''}" required pattern="[0-9]{1,8}-[0-9kK]{1}" placeholder="12345678-9">
                                        </div>
                                        <div class="col-md-6">
                                            <label for="editRazonSocial" class="form-label">Razón Social:</label>
                                            <input type="text" class="form-control" id="editRazonSocial" value="${cliente.razonSocial || ''}" required>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-3">
                                        <div class="col-md-8">
                                            <label for="editDireccion" class="form-label">Dirección:</label>
                                            <input type="text" class="form-control" id="editDireccion" value="${cliente.direccion || ''}" required>
                                        </div>
                                        <div class="col-md-4">
                                            <label for="editCiudad" class="form-label">Ciudad:</label>
                                            <input type="text" class="form-control" id="editCiudad" value="${cliente.ciudad || ''}" required>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-3">
                                        <div class="col-md-6">
                                            <label for="editContacto" class="form-label">Contacto:</label>
                                            <input type="text" class="form-control" id="editContacto" value="${cliente.contacto || ''}" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label for="editTelefono" class="form-label">Teléfono:</label>
                                            <input type="tel" class="form-control" id="editTelefono" value="${cliente.telefono || ''}" required>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-3">
                                        <label for="editEmail" class="form-label">Email:</label>
                                        <input type="email" class="form-control" id="editEmail" value="${cliente.email || ''}">
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="clientesComponent.actualizarCliente('${cliente.id}')">Guardar Cambios</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Eliminar modal anterior si existe
            const existingModal = document.getElementById('editClienteModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Agregar nuevo modal al DOM
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('editClienteModal'));
            modal.show();
            
        } catch (error) {
            console.error('Error al editar cliente:', error);
            Swal.fire('Error', 'No se pudo cargar el cliente para editar', 'error');
        }
    },
    
    async actualizarCliente(id) {
        try {
            const rut = document.getElementById('editRut').value;
            const razonSocial = document.getElementById('editRazonSocial').value;
            const direccion = document.getElementById('editDireccion').value;
            const ciudad = document.getElementById('editCiudad').value;
            const contacto = document.getElementById('editContacto').value;
            const telefono = document.getElementById('editTelefono').value;
            const email = document.getElementById('editEmail').value;
            
            if (!rut || !razonSocial || !direccion || !ciudad || !contacto || !telefono) {
                Swal.fire('Error', 'Todos los campos obligatorios deben ser completados', 'error');
                return;
            }
            
            // Validar formato RUT
            const rutPattern = /^[0-9]{1,8}-[0-9kK]{1}$/;
            if (!rutPattern.test(rut)) {
                Swal.fire('Error', 'El RUT debe tener el formato correcto (ej: 12345678-9)', 'error');
                return;
            }
            
            // Verificar RUT duplicado (solo si se cambió el RUT)
            const clienteActual = await FirebaseService.getClienteById(id);
            if (rut !== clienteActual.rut) {
                const clientes = await FirebaseService.getClientes();
                const clienteExistente = clientes.find(c => c.rut === rut && c.id !== id);
                if (clienteExistente) {
                    Swal.fire('Error', 'Ya existe otro cliente con ese RUT', 'error');
                    return;
                }
            }
            
            // Datos del cliente
            const clienteData = {
                rut,
                razonSocial,
                direccion,
                ciudad,
                contacto,
                telefono,
                email,
                fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Actualizar en Firebase
            await FirebaseService.updateCliente(id, clienteData);
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editClienteModal'));
            modal.hide();
            
            Swal.fire('Éxito', 'Cliente actualizado correctamente', 'success');
            
            // Recargar datos
            await this.cargarClientes();
            
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            Swal.fire('Error', 'No se pudo actualizar el cliente', 'error');
        }
    },
    
    async buscarClientes() {
        const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
        
        if (!searchTerm) {
            await this.cargarClientes();
            return;
        }
        
        try {
            const tbody = document.getElementById('clientesTableBody');
            tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Buscando clientes...</td></tr>';
            
            // Obtener todos los clientes (en una aplicación real, se debería implementar búsqueda en servidor)
            const clientes = await FirebaseService.getClientes();
            
            // Filtrar clientes por término de búsqueda
            const resultados = clientes.filter(cliente => 
                (cliente.rut && cliente.rut.toLowerCase().includes(searchTerm)) ||
                (cliente.razonSocial && cliente.razonSocial.toLowerCase().includes(searchTerm)) ||
                (cliente.contacto && cliente.contacto.toLowerCase().includes(searchTerm)) ||
                (cliente.email && cliente.email.toLowerCase().includes(searchTerm))
            );
            
            tbody.innerHTML = '';
            
            if (resultados.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">No se encontraron clientes que coincidan con la búsqueda</td>
                    </tr>
                `;
                return;
            }
            
            resultados.forEach(cliente => {
                tbody.innerHTML += `
                    <tr>
                        <td>${cliente.codigo || ''}</td>
                        <td>${cliente.rut || ''}</td>
                        <td>${cliente.razonSocial || ''}</td>
                        <td>${cliente.contacto || ''}</td>
                        <td>${cliente.telefono || ''}</td>
                        <td>${cliente.email || ''}</td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="clientesComponent.editarCliente('${cliente.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="clientesComponent.eliminarCliente('${cliente.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="router.navigate('locales-cliente/${cliente.id}')">
                                <i class="fas fa-store"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
        } catch (error) {
            console.error('Error en búsqueda:', error);
            Swal.fire('Error', 'Error al realizar la búsqueda', 'error');
        }
    },
    
    inicializarEventos() {
        // Búsqueda con debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.buscarClientes();
                }, 500);
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

