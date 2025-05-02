// Componente de Gestión de Clientes
const clientesComponent = {
    async render(container) {
        try {
            container.innerHTML = `
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
            container.innerHTML = `
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
                    <td>${item
