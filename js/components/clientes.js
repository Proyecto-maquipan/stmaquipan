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

    // Función para abrir modal de agregar cliente - MODIFICADA para usar ModalManager
    abrirModalAgregarCliente() {
        try {
            ModalManager.show('addClienteModal');
        } catch (error) {
            console.error('Error al abrir modal:', error);
            // Si hay error, limpiar UI
            window.resetUIState();
        }
    },

    // Función para abrir modal de carga masiva - MODIFICADA para usar ModalManager
    abrirModalCargaMasiva() {
        try {
            ModalManager.show('uploadModal');
        } catch (error) {
            console.error('Error al abrir modal:', error);
            // Si hay error, limpiar UI
            window.resetUIState();
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
            
            // IMPORTANTE: Cerrar modal ANTES de operaciones asíncronas - MODIFICADO
            ModalManager.hide('addClienteModal');
            
            // Verificar si el RUT ya existe
            try {
                // Agregar tiempo de espera máximo
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Tiempo de espera agotado al verificar RUT')), 8000)
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
            }
        } catch (error) {
            console.error('Error al procesar guardado de cliente:', error);
            
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'Error al procesar la solicitud: ' + (error.message || ''), 'error');
            } else {
                alert('Error al procesar la solicitud: ' + (error.message || ''));
            }
            
            // Limpiar manualmente en caso de error
            window.resetUIState();
        }
    },
