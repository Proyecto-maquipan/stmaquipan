// Componente de Gestión de Clientes
const clientesComponent = {
    datosTemporales: [],
    searchTimeout: null,
    
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
                            <button class="btn btn-primary me-2" onclick="clientesComponent.abrirModalAgregarCliente()">
                                <i class="fas fa-plus me-2"></i>Agregar Cliente
                            </button>
                            <button class="btn btn-success" onclick="clientesComponent.abrirModalCargaMasiva()">
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
                                <button type="button" class="btn-close" onclick="ModalManager.close('addClienteModal')"></button>
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
                                <button type="button" class="btn btn-secondary" onclick="ModalManager.close('addClienteModal')">Cancelar</button>
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
                                <button type="button" class="btn-close" onclick="ModalManager.close('uploadModal')"></button>
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
                                <button type="button" class="btn btn-secondary" onclick="ModalManager.close('uploadModal')">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="clientesComponent.cargarClientesMasivo()" disabled id="uploadBtn">Cargar Datos</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Cargar estilos personalizados
            this.agregarEstilos();
            
            try {
                // Cargar datos iniciales con manejo de errores específico
                await this.cargarClientes();
            } catch (error) {
                console.error('Error cargando clientes:', error);
                const tbody = document.getElementById('clientesTableBody');
                if (tbody) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center">
                                Error al cargar los clientes. <button onclick="clientesComponent.cargarClientes()" class="btn btn-sm btn-primary">Reintentar</button>
                            </td>
                        </tr>
                    `;
                }
            }
            
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
    
    // Métodos para manejar modales
    abrirModalAgregarCliente() {
        // Limpiar el formulario
        const form = document.getElementById('addClienteForm');
        if (form) {
            form.reset();
        }
        ModalManager.open('addClienteModal');
    },
    
    abrirModalCargaMasiva() {
        // Limpiar el área de preview
        const previewArea = document.getElementById('previewArea');
        if (previewArea) {
            previewArea.style.display = 'none';
        }
        
        // Limpiar el input de archivo
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
        }
        
        // Deshabilitar el botón de carga
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.disabled = true;
        }
        
        ModalManager.open('uploadModal');
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
            // Verificar que firebase esté inicializado
            if (typeof FirebaseService === 'undefined') {
                throw new Error('Servicio Firebase no está disponible');
            }
            
            const tbody = document.getElementById('clientesTableBody');
            if (!tbody) {
                console.error('Elemento tbody no encontrado');
                return;
            }
            
            tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando clientes...</td></tr>';
            
            // Agregar tiempo de espera máximo
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000)
            );
            
            // Intentar obtener clientes con storage primero
            let clientes = [];
            try {
                if (typeof storage !== 'undefined' && typeof storage.getClientes === 'function') {
                    const storagePromise = storage.getClientes();
                    clientes = await Promise.race([storagePromise, timeoutPromise]);
                } else {
                    // Si no está storage, usar FirebaseService
                    const firebasePromise = FirebaseService.getClientes();
                    clientes = await Promise.race([firebasePromise, timeoutPromise]);
                }
            } catch (storageError) {
                console.error('Error obteniendo clientes desde storage:', storageError);
                
                // Intentar con Firebase directamente como último recurso
                if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
                    const snapshot = await firebase.firestore().collection('clientes').get();
                    clientes = [];
                    snapshot.forEach(doc => {
                        clientes.push({ ...doc.data(), id: doc.id });
                    });
                } else {
                    throw new Error('No se pudo conectar con la base de datos');
                }
            }
            
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
            
            const tbody = document.getElementById('clientesTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">
                            Error al cargar los clientes. <button onclick="clientesComponent.cargarClientes()" class="btn btn-sm btn-primary">Reintentar</button>
                        </td>
                    </tr>
                `;
            }
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar los clientes: ' + (error.message || ''),
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
            
            throw error; // Re-lanzar para manejo en render()
        }
    },
    
    async guardarCliente() {
        try {
            // Verificar que firebase esté inicializado
            if (typeof storage === 'undefined' && typeof FirebaseService === 'undefined') {
                throw new Error('Servicio de almacenamiento no está disponible');
            }
            
            const rut = document.getElementById('rut')?.value;
            const razonSocial = document.getElementById('razonSocial')?.value;
            const direccion = document.getElementById('direccion')?.value;
            const ciudad = document.getElementById('ciudad')?.value;
            const contacto = document.getElementById('contacto')?.value;
            const telefono = document.getElementById('telefono')?.value;
            const email = document.getElementById('email')?.value || '';
            
            if (!rut || !razonSocial || !direccion || !ciudad || !contacto || !telefono) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'Todos los campos obligatorios deben ser completados', 'error');
                } else {
                    alert('Todos los campos obligatorios deben ser completados');
                }
                return;
            }
            
            // Validar formato RUT
            const rutPattern = /^[0-9]{1,8}-[0-9kK]{1}$/;
            if (!rutPattern.test(rut)) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'El RUT debe tener el formato correcto (ej: 12345678-9)', 'error');
                } else {
                    alert('El RUT debe tener el formato correcto (ej: 12345678-9)');
                }
                return;
            }
            
            // Mostrar indicador de carga
            let loadingSwal;
            if (typeof Swal !== 'undefined') {
                loadingSwal = Swal.fire({
                    title: 'Verificando y guardando...',
                    text: 'Espere por favor',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
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
            try {
                // Agregar tiempo de espera máximo
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Tiempo de espera agotado')), 8000)
                );
                
                // Intentar obtener clientes con storage primero
                let clientes = [];
                if (typeof storage !== 'undefined' && typeof storage.getClientes === 'function') {
                    const storagePromise = storage.getClientes();
                    clientes = await Promise.race([storagePromise, timeoutPromise]);
                } else if (typeof FirebaseService !== 'undefined') {
                    const fbPromise = FirebaseService.getClientes();
                    clientes = await Promise.race([fbPromise, timeoutPromise]);
                } else if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
                    const snapshot = await firebase.firestore().collection('clientes').get();
                    clientes = [];
                    snapshot.forEach(doc => {
                        clientes.push({ ...doc.data(), id: doc.id });
                    });
                }
                
                const clienteExistente = clientes.find(c => c.rut === rut);
                if (clienteExistente) {
                    if (loadingSwal) {
                        loadingSwal.close();
                    }
                    
                    if (typeof Swal !== 'undefined') {
                        Swal.fire('Error', 'Ya existe un cliente con ese RUT', 'error');
                    } else {
                        alert('Ya existe un cliente con ese RUT');
                    }
                    return;
                }
            } catch (checkError) {
                console.error('Error al verificar duplicados:', checkError);
                // Continuar con la operación a pesar del error de verificación
            }
            
            // Guardar en Firebase
            try {
                // Agregar tiempo de espera máximo
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Tiempo de espera agotado al guardar')), 10000)
                );
                
                // Intentar guardar con storage primero
                let saveResult;
                if (typeof storage !== 'undefined' && typeof storage.saveCliente === 'function') {
                    const storagePromise = storage.saveCliente(cliente);
                    saveResult = await Promise.race([storagePromise, timeoutPromise]);
                } else if (typeof FirebaseService !== 'undefined') {
                    const fbPromise = FirebaseService.saveCliente(cliente);
                    saveResult = await Promise.race([fbPromise, timeoutPromise]);
                } else if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
                    // Generar código secuencial
                    let nextNumber = 1000;
                    try {
                        const counterRef = firebase.firestore().collection('counters').doc('cliente');
                        const counterDoc = await counterRef.get();
                        
                        if (counterDoc.exists) {
                            nextNumber = counterDoc.data().value + 1;
                            await counterRef.update({ value: nextNumber });
                        } else {
                            await counterRef.set({ value: nextNumber });
                        }
                    } catch (counterError) {
                        console.error('Error al generar contador:', counterError);
                    }
                    
                    cliente.codigo = "CLI-" + nextNumber;
                    const docRef = await firebase.firestore().collection('clientes').add(cliente);
                    await docRef.update({ id: docRef.id });
                    saveResult = cliente.codigo;
                } else {
                    throw new Error('No hay método disponible para guardar');
                }
                
                // Cerrar modal
                ModalManager.close('addClienteModal');
                
                // Resetear formulario
                const form = document.getElementById('addClienteForm');
                if (form) {
                    form.reset();
                }
                
                if (loadingSwal) {
                    loadingSwal.close();
                }
                
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Éxito', 'Cliente agregado correctamente', 'success');
                } else {
                    alert('Cliente agregado correctamente');
                }
                
                // Recargar datos
                await this.cargarClientes();
                
            } catch (error) {
                console.error('Error al guardar cliente:', error);
                
                if (loadingSwal) {
                    loadingSwal.close();
                }
                
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'No se pudo guardar el cliente: ' + (error.message || ''), 'error');
                } else {
                    alert('Error al guardar el cliente: ' + (error.message || ''));
                }
                
                // Limpiar manualmente en caso de error
                ModalManager.cleanUI();
            }
        } catch (error) {
            console.error('Error al procesar guardado de cliente:', error);
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'Error al procesar la solicitud: ' + (error.message || ''), 'error');
            } else {
                alert('Error al procesar la solicitud: ' + (error.message || ''));
            }
            
            // Limpiar manualmente en caso de error global
            ModalManager.cleanUI();
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
                    parsedData = this.procesarCSV(data);
                } else {
                    // Procesar Excel
                    if (typeof XLSX === 'undefined') {
                        throw new Error('Librería XLSX no encontrada');
                    }
                    parsedData = this.procesarExcel(data);
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
        if (typeof XLSX === 'undefined') {
            throw new Error('Librería XLSX no encontrada');
        }
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (jsonData.length < 2) return [];
        
        // Procesar encabezados
        const headers = jsonData[0].map(h => h ? h.toString().trim().toLowerCase() : '');
        
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
        
        if (!previewArea || !previewTableBody || !uploadBtn) {
            console.error('Elementos de preview no encontrados');
            return;
        }
        
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
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'No hay datos para cargar', 'error');
            } else {
                alert('No hay datos para cargar');
            }
            return;
        }
        
        try {
            // Verificar que firebase esté inicializado
            if (typeof firebase === 'undefined' && typeof FirebaseService === 'undefined' && typeof storage === 'undefined') {
                throw new Error('Servicio de almacenamiento no está disponible');
            }
            
            const totalRegistros = this.datosTemporales.length;
            const batchSize = 100; // Procesar en lotes de 100
            let procesados = 0;
            let errores = 0;
            
            // Mostrar indicador de progreso
            let progressSwal;
            if (typeof Swal !== 'undefined') {
                progressSwal = Swal.fire({
                    title: 'Cargando clientes...',
                    html: `Procesando: <b>0</b> de ${totalRegistros}`,
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }
            
            // MODIFICADO: Cerrar modal usando ModalManager
            ModalManager.close('uploadModal');
            
            // Obtener clientes existentes para verificar RUTs duplicados
            let clientesExistentes = [];
            try {
                if (typeof storage !== 'undefined' && typeof storage.getClientes === 'function') {
                    clientesExistentes = await storage.getClientes();
                } else if (typeof FirebaseService !== 'undefined') {
                    clientesExistentes = await FirebaseService.getClientes();
                } else if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
                    const snapshot = await firebase.firestore().collection('clientes').get();
                    clientesExistentes = [];
                    snapshot.forEach(doc => {
                        clientesExistentes.push({ ...doc.data(), id: doc.id });
                    });
                }
            } catch (error) {
                console.error('Error al obtener clientes existentes:', error);
            }
            
            const rutsExistentes = new Set(clientesExistentes.map(c => c.rut));
            
            // Usar la API de Batch de Firebase si está disponible
            if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
                for (let i = 0; i < totalRegistros; i += batchSize) {
                    const batch = firebase.firestore().batch();
                    const lote = this.datosTemporales.slice(i, i + batchSize);
                    
                    // Generar código secuencial
                    let nextNumber = 1000;
                    try {
                        const counterRef = firebase.firestore().collection('counters').doc('cliente');
                        const counterDoc = await counterRef.get();
                        
                        if (counterDoc.exists) {
                            nextNumber = counterDoc.data().value;
                        }
                    } catch (counterError) {
                        console.error('Error al obtener contador:', counterError);
                    }
                    
                    let batchItemCount = 0;
                    
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
                        
                        nextNumber++;
                        const codigo = "CLI-" + nextNumber;
                        
                        const docRef = firebase.firestore().collection('clientes').doc();
                        
                        batch.set(docRef, {
                            ...cliente,
                            id: docRef.id,
                            codigo: codigo,
                            fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        
                        batchItemCount++;
                    }
                    
                    if (batchItemCount > 0) {
                        // Actualizar el contador para el siguiente lote
                        const counterRef = firebase.firestore().collection('counters').doc('cliente');
                        batch.update(counterRef, { value: nextNumber });
                        
                        // Ejecutar el batch
                        await batch.commit();
                    }
                    
                    procesados += batchItemCount;
                    
                    // Actualizar progreso
                    if (progressSwal) {
                        Swal.update({
                            html: `Procesando: <b>${procesados}</b> de ${totalRegistros} (${errores} errores)`
                        });
                    }
                }
            } else {
                // Versión alternativa sin Batch API
                for (let i = 0; i < totalRegistros; i += batchSize) {
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
                        
                        // Agregar RUT a la lista de existentes
                        rutsExistentes.add(cliente.rut);
                        
                        try {
                            if (typeof storage !== 'undefined' && typeof storage.saveCliente === 'function') {
                                await storage.saveCliente(cliente);
                            } else if (typeof FirebaseService !== 'undefined') {
                                await FirebaseService.saveCliente(cliente);
                            }
                            procesados++;
                        } catch (saveError) {
                            console.error('Error guardando cliente:', saveError);
                            errores++;
                        }
                        
                        // Actualizar progreso
                        if (progressSwal) {
                            Swal.update({
                                html: `Procesando: <b>${procesados}</b> de ${totalRegistros} (${errores} errores)`
                            });
                        }
                    }
                }
            }
            
            // Cerrar modal y limpiar el UI
            ModalManager.cleanUI();
            
            if (progressSwal) {
                progressSwal.close();
            }
            
            if (errores > 0) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Completado con advertencias', `${procesados} clientes cargados correctamente. ${errores} registros no pudieron procesarse debido a datos incompletos o RUTs duplicados.`, 'warning');
                } else {
                    alert(`Completado con advertencias: ${procesados} clientes cargados, ${errores} errores`);
                }
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Éxito', `${procesados} clientes cargados correctamente`, 'success');
                } else {
                    alert(`Éxito: ${procesados} clientes cargados correctamente`);
                }
            }
            
            // Recargar datos
            await this.cargarClientes();
            
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
            
            // Limpiar manualmente en caso de error
            // MODIFICADO: Usar ModalManager para limpiar el UI
            ModalManager.cleanUI();
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', `No se pudieron cargar los clientes: ${error.message}`, 'error');
            } else {
                alert(`Error en carga masiva: ${error.message}`);
            }
        }
    },
    
    async eliminarCliente(id) {
        if (!id) return;
        
        try {
            // Verificar si hay disponible algún servicio de almacenamiento
            if (typeof storage === 'undefined' && typeof FirebaseService === 'undefined' && typeof firebase === 'undefined') {
                throw new Error('Servicio de almacenamiento no está disponible');
            }
            
            // Verificar si el cliente tiene locales asociados
            let tieneLocales = false;
            try {
                if (typeof FirebaseService !== 'undefined' && typeof FirebaseService.getLocalesByCliente === 'function') {
                    const locales = await FirebaseService.getLocalesByCliente(id);
                    tieneLocales = locales && locales.length > 0;
                } else if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
                    const snapshot = await firebase.firestore().collection('locales')
                        .where('clienteId', '==', id)
                        .limit(1)
                        .get();
                    tieneLocales = !snapshot.empty;
                }
            } catch (error) {
                console.warn('Error al verificar locales asociados:', error);
                // Continuar con la eliminación a pesar del error
            }
            
            if (tieneLocales) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', `No se puede eliminar el cliente porque tiene locales asociados. Elimine primero los locales.`, 'error');
                } else {
                    alert('No se puede eliminar el cliente porque tiene locales asociados. Elimine primero los locales.');
                }
                return;
            }
            
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
                confirmed = confirm("¿Estás seguro de que deseas eliminar este cliente?");
            }
            
            if (!confirmed) return;
            
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
            
            // Eliminar cliente
            if (typeof storage !== 'undefined' && typeof storage.deleteCliente === 'function') {
                await storage.deleteCliente(id);
            } else if (typeof FirebaseService !== 'undefined' && typeof FirebaseService.deleteCliente === 'function') {
                await FirebaseService.deleteCliente(id);
            } else if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
                await firebase.firestore().collection('clientes').doc(id).delete();
            } else {
                throw new Error('No hay método disponible para eliminar');
            }
            
            if (loadingSwal) {
                loadingSwal.close();
            }
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Eliminado', 'El cliente ha sido eliminado', 'success');
            } else {
                alert('Cliente eliminado correctamente');
            }
            
            // Recargar datos
            await this.cargarClientes();
            
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'No se pudo eliminar el cliente: ' + (error.message || ''), 'error');
            } else {
                alert('Error al eliminar el cliente: ' + (error.message || ''));
            }
        }
    },
    
    async editarCliente(id) {
        if (!id) return;
        
        try {
            // Verificar si hay disponible algún servicio de almacenamiento
            if (typeof storage === 'undefined' && typeof FirebaseService === 'undefined' && typeof firebase === 'undefined') {
                throw new Error('Servicio de almacenamiento no está disponible');
            }
            
            // Mostrar indicador de carga
            let loadingSwal;
            if (typeof Swal !== 'undefined') {
                loadingSwal = Swal.fire({
                    title: 'Cargando cliente...',
                    text: 'Espere por favor',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
            }
            
            // Buscar cliente
            let cliente = null;
            
            if (typeof FirebaseService !== 'undefined' && typeof FirebaseService.getClienteById === 'function') {
                cliente = await FirebaseService.getClienteById(id);
            } else if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
                const doc = await firebase.firestore().collection('clientes').doc(id).get();
                if (doc.exists) {
                    cliente = { id: doc.id, ...doc.data() };
                }
            } else {
                // Intentar buscar en la lista de clientes cargada
                const tbody = document.getElementById('clientesTableBody');
                const rows = tbody.querySelectorAll('tr');
                
                for (const row of rows) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 7) {
                        const editButton = cells[6].querySelector('button.btn-info');
                        if (editButton && editButton.getAttribute('onclick').includes(id)) {
                            cliente = {
                                id,
                                codigo: cells[0].textContent,
                                rut: cells[1].textContent,
                                razonSocial: cells[2].textContent,
                                contacto: cells[3].textContent,
                                telefono: cells[4].textContent,
                                email: cells[5].textContent,
                                direccion: '', // No disponible en la tabla
                                ciudad: ''      // No disponible en la tabla
                            };
                            break;
                        }
                    }
                }
            }
            
            if (loadingSwal) {
                loadingSwal.close();
            }
            
            if (!cliente) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'No se encontró el cliente', 'error');
                } else {
                    alert('No se encontró el cliente');
                }
                return;
            }
            
            // Crear modal de edición dinámicamente
            const modalHtml = `
                <div class="modal fade" id="editClienteModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Editar Cliente</h5>
                                <button type="button" class="btn-close" onclick="ModalManager.close('editClienteModal')"></button>
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
                                <button type="button" class="btn btn-secondary" onclick="ModalManager.close('editClienteModal')">Cancelar</button>
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
            // MODIFICADO: Usar ModalManager para abrir el modal
            ModalManager.open('editClienteModal');
            
        } catch (error) {
            console.error('Error al editar cliente:', error);
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'No se pudo cargar el cliente para editar', 'error');
            } else {
                alert('Error al mostrar el formulario de edición');
            }
        }
    },
    
    async actualizarCliente(id) {
        if (!id) return;
        
        try {
            // Verificar si hay disponible algún servicio de almacenamiento
            if (typeof storage === 'undefined' && typeof FirebaseService === 'undefined' && typeof firebase === 'undefined') {
                throw new Error('Servicio de almacenamiento no está disponible');
            }
            
            const rut = document.getElementById('editRut')?.value;
            const razonSocial = document.getElementById('editRazonSocial')?.value;
            const direccion = document.getElementById('editDireccion')?.value;
            const ciudad = document.getElementById('editCiudad')?.value;
            const contacto = document.getElementById('editContacto')?.value;
            const telefono = document.getElementById('editTelefono')?.value;
            const email = document.getElementById('editEmail')?.value || '';
            
            if (!rut || !razonSocial || !direccion || !ciudad || !contacto || !telefono) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'Todos los campos obligatorios deben ser completados', 'error');
                } else {
                    alert('Todos los campos obligatorios deben ser completados');
                }
                return;
            }
            
            // Validar formato RUT
            const rutPattern = /^[0-9]{1,8}-[0-9kK]{1}$/;
            if (!rutPattern.test(rut)) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'El RUT debe tener el formato correcto (ej: 12345678-9)', 'error');
                } else {
                    alert('El RUT debe tener el formato correcto (ej: 12345678-9)');
                }
                return;
            }
            
            // Verificar RUT duplicado (solo si se cambió el RUT)
            try {
                // Buscar cliente actual
                let clienteActual = null;
                
                if (typeof FirebaseService !== 'undefined' && typeof FirebaseService.getClienteById === 'function') {
                    clienteActual = await FirebaseService.getClienteById(id);
                } else if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
                    const doc = await firebase.firestore().collection('clientes').doc(id).get();
                    if (doc.exists) {
                        clienteActual = { id: doc.id, ...doc.data() };
                    }
                }
                
                if (clienteActual && rut !== clienteActual.rut) {
                    // El RUT ha cambiado, verificar si ya existe
                    let clientes = [];
                    
                    if (typeof storage !== 'undefined' && typeof storage.getClientes === 'function') {
                        clientes = await storage.getClientes();
                    } else if (typeof FirebaseService !== 'undefined') {
                        clientes = await FirebaseService.getClientes();
                    } else if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
                        const snapshot = await firebase.firestore().collection('clientes').get();
                        clientes = [];
                        snapshot.forEach(doc => {
                            clientes.push({ ...doc.data(), id: doc.id });
                        });
                    }
                    
                    const clienteExistente = clientes.find(c => c.rut === rut && c.id !== id);
                    if (clienteExistente) {
                        if (typeof Swal !== 'undefined') {
                            Swal.fire('Error', 'Ya existe otro cliente con ese RUT', 'error');
                        } else {
                            alert('Ya existe otro cliente con ese RUT');
                        }
                        return;
                    }
                }
            } catch (checkError) {
                console.error('Error al verificar duplicados:', checkError);
                // Continuar con la operación a pesar del error de verificación
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
            if (typeof storage !== 'undefined' && typeof storage.updateCliente === 'function') {
                await storage.updateCliente(id, clienteData);
            } else if (typeof FirebaseService !== 'undefined' && typeof FirebaseService.updateCliente === 'function') {
                await FirebaseService.updateCliente(id, clienteData);
            } else if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
                await firebase.firestore().collection('clientes').doc(id).update(clienteData);
            } else {
                throw new Error('No hay método disponible para actualizar');
            }
            
            // Cerrar modal
            // MODIFICADO: Usar ModalManager para cerrar el modal
            ModalManager.close('editClienteModal');
            
            if (loadingSwal) {
                loadingSwal.close();
            }
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Éxito', 'Cliente actualizado correctamente', 'success');
            } else {
                alert('Cliente actualizado correctamente');
            }
            
            // Recargar datos
            await this.cargarClientes();
            
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            
            // Limpiar UI en caso de error
            // MODIFICADO: Usar ModalManager para limpiar el UI
            ModalManager.cleanUI();
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'No se pudo actualizar el cliente: ' + (error.message || ''), 'error');
            } else {
                alert('Error al actualizar el cliente: ' + (error.message || ''));
            }
        }
    },
    
    async buscarClientes() {
        const searchTerm = document.getElementById('searchInput')?.value?.trim()?.toLowerCase() || '';
        
        if (!searchTerm) {
            await this.cargarClientes();
            return;
        }
        
        try {
            const tbody = document.getElementById('clientesTableBody');
            if (!tbody) return;
            
            tbody.innerHTML = '<tr><td colspan="7" class="text-center"><i class="fas fa-spinner fa-spin"></i> Buscando clientes...</td></tr>';
            
            // Verificar si hay disponible algún servicio de almacenamiento
            if (typeof storage === 'undefined' && typeof FirebaseService === 'undefined' && typeof firebase === 'undefined') {
                throw new Error('Servicio de almacenamiento no está disponible');
            }
            
            // Agregar tiempo de espera máximo
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000)
            );
            
            // Obtener todos los clientes (en una aplicación real, se debería implementar búsqueda en servidor)
            let clientes = [];
            
            if (typeof storage !== 'undefined' && typeof storage.getClientes === 'function') {
                const storagePromise = storage.getClientes();
                clientes = await Promise.race([storagePromise, timeoutPromise]);
            } else if (typeof FirebaseService !== 'undefined') {
                const fbPromise = FirebaseService.getClientes();
                clientes = await Promise.race([fbPromise, timeoutPromise]);
            } else if (typeof firebase !== 'undefined' && typeof firebase.firestore === 'function') {
                const snapshot = await firebase.firestore().collection('clientes').get();
                clientes = [];
                snapshot.forEach(doc => {
                    clientes.push({ ...doc.data(), id: doc.id });
                });
            }
            
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
            
            const tbody = document.getElementById('clientesTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">
                            Error al realizar la búsqueda. <button onclick="clientesComponent.cargarClientes()" class="btn btn-sm btn-primary">Recargar todos</button>
                        </td>
                    </tr>
                `;
            }
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'Error al realizar la búsqueda: ' + (error.message || ''), 'error');
            }
        }
    },
    
    inicializarEventos() {
        // Búsqueda con debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.buscarClientes();
                }, 500);
            });
            
            // Buscar al presionar Enter
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.buscarClientes();
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
