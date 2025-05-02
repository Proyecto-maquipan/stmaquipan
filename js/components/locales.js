// Componente de Gestión de Locales
const localesComponent = {
    datosTemporales: [],
    tiposCarga: {
        RETAIL: 'retail',
        CANAL_TRADICIONAL: 'canal_tradicional'
    },
    searchTimeout: null,
    
    async render(container, params = {}) {
        try {
            // Verificar si se está filtrando por un cliente específico
            let clienteId = params.clienteId || '';
            let tituloSeccion = 'Gestión de Locales';
            let subtitulo = '';
            
            if (clienteId) {
                const cliente = await FirebaseService.getClienteById(clienteId);
                if (cliente) {
                    tituloSeccion = `Locales de ${cliente.razonSocial}`;
                    subtitulo = `<div class="text-muted mb-3">RUT: ${cliente.rut}</div>`;
                }
            }
            
            // Cargar lista de clientes para el selector
            const clientes = await FirebaseService.getClientes();
            
            container.innerHTML = `
                <div class="container-fluid">
                    <div class="row mb-3">
                        <div class="col-12">
                            <h2><i class="fas fa-store me-2"></i>${tituloSeccion}</h2>
                            ${subtitulo}
                        </div>
                    </div>

                    <!-- Barra de búsqueda y botones -->
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="input-group">
                                <input type="text" class="form-control" id="searchInput" placeholder="Buscar local...">
                                <button class="btn btn-outline-secondary" type="button" onclick="localesComponent.buscarLocales()">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-3 ${clienteId ? 'd-none' : ''}">
                            <select class="form-select" id="clienteFilter" onchange="localesComponent.filtrarPorCliente()">
                                <option value="">Todos los clientes</option>
                                ${clientes.map(cliente => `
                                    <option value="${cliente.id}" ${cliente.id === clienteId ? 'selected' : ''}>${cliente.razonSocial}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="col-md-${clienteId ? '8' : '5'} text-end">
                            <button class="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target="#addLocalModal">
                                <i class="fas fa-plus me-2"></i>Agregar Local
                            </button>
                            <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#uploadModal">
                                <i class="fas fa-upload me-2"></i>Carga Masiva
                            </button>
                            ${clienteId ? `
                                <button class="btn btn-secondary" onclick="router.navigate('clientes')">
                                    <i class="fas fa-arrow-left me-2"></i>Volver a Clientes
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Tabla de locales -->
                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover" id="localesTable">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th ${clienteId ? 'style="display:none"' : ''}>Cliente</th>
                                            <th>Nombre del Local</th>
                                            <th>Tipo</th>
                                            <th>Dirección</th>
                                            <th>Contacto</th>
                                            <th>Teléfono</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="localesTableBody">
                                        <tr>
                                            <td colspan="${clienteId ? '7' : '8'}" class="text-center">
                                                <i class="fas fa-spinner fa-spin"></i> Cargando locales...
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal para agregar local -->
                <div class="modal fade" id="addLocalModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Agregar Nuevo Local</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="addLocalForm">
                                    <div class="mb-3">
                                        <label class="form-label">Tipo de Local</label>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="tipoLocal" id="tipoRetail" value="retail" checked onchange="localesComponent.cambiarTipoLocal()">
                                            <label class="form-check-label" for="tipoRetail">
                                                Retail
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="tipoLocal" id="tipoTradicional" value="canal_tradicional" onchange="localesComponent.cambiarTipoLocal()">
                                            <label class="form-check-label" for="tipoTradicional">
                                                Canal Tradicional
                                            </label>
                                        </div>
                                    </div>

                                    <div class="mb-3 ${clienteId ? 'd-none' : ''}">
                                        <label for="clienteSelect" class="form-label">Cliente</label>
                                        <select class="form-select" id="clienteSelect" required>
                                            <option value="">Seleccione un cliente</option>
                                            ${clientes.map(cliente => `
                                                <option value="${cliente.id}" ${cliente.id === clienteId ? 'selected' : ''}>${cliente.razonSocial}</option>
                                            `).join('')}
                                        </select>
                                    </div>

                                    <!-- Campos para Retail -->
                                    <div id="camposRetail">
                                        <div class="mb-3">
                                            <label for="numeroCuenta" class="form-label">Número de Cuenta</label>
                                            <input type="text" class="form-control" id="numeroCuenta">
                                        </div>
                                        <div class="mb-3">
                                            <label for="numeroLocal" class="form-label">Número de Local</label>
                                            <input type="text" class="form-control" id="numeroLocal">
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="nombreLocal" class="form-label">Nombre del Local</label>
                                        <input type="text" class="form-control" id="nombreLocal" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="direccionLocal" class="form-label">Dirección</label>
                                        <input type="text" class="form-control" id="direccionLocal" required>
                                    </div>

                                    <!-- Campo Dirección Facturación (Solo Canal Tradicional) -->
                                    <div id="campoDireccionFacturacion" style="display: none;">
                                        <div class="mb-3">
                                            <label for="direccionFacturacion" class="form-label">Dirección de Facturación</label>
                                            <input type="text" class="form-control" id="direccionFacturacion">
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="contactoLocal" class="form-label">Contacto</label>
                                        <input type="text" class="form-control" id="contactoLocal" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="telefonoLocal" class="form-label">Teléfono</label>
                                        <input type="tel" class="form-control" id="telefonoLocal" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="emailLocal" class="form-label">Correo Electrónico</label>
                                        <input type="email" class="form-control" id="emailLocal">
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="localesComponent.guardarLocal()">Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal para carga masiva -->
                <div class="modal fade" id="uploadModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Carga Masiva de Locales</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Tipo de Formato</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="tipoFormato" id="formatoRetail" value="retail" checked onchange="localesComponent.cambiarFormatoCarga()">
                                        <label class="form-check-label" for="formatoRetail">
                                            Retail
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="tipoFormato" id="formatoTradicional" value="canal_tradicional" onchange="localesComponent.cambiarFormatoCarga()">
                                        <label class="form-check-label" for="formatoTradicional">
                                            Canal Tradicional
                                        </label>
                                    </div>
                                </div>

                                <div class="alert alert-info" id="formatoRetailInfo">
                                    <strong>Formato requerido:</strong> Archivo CSV o Excel con las columnas: Cuenta; Cliente; N° de Local; Nombre del local; Dirección; Contacto; N° telefónico; Correo
                                </div>
                                <div class="alert alert-info" id="formatoTradicionalInfo" style="display: none;">
                                    <strong>Formato requerido:</strong> Archivo CSV o Excel con las columnas: Cliente; Contacto; N° telefónico; Correo; Dirección de facturación; Dirección del local
                                </div>

                                <div class="file-upload-area" onclick="document.getElementById('fileInput').click()">
                                    <i class="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                                    <p>Arrastra y suelta tu archivo aquí o haz clic para seleccionar</p>
                                    <input type="file" id="fileInput" accept=".csv,.xlsx,.xls" style="display: none;" onchange="localesComponent.procesarArchivo(this)">
                                </div>
                                <div id="previewArea" class="mt-3" style="display: none;">
                                    <h6>Vista previa de datos:</h6>
                                    <div class="table-responsive">
                                        <table class="table table-sm" id="previewTable">
                                            <thead id="previewTableHead">
                                                <!-- Los encabezados se generarán dinámicamente -->
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
                                <button type="button" class="btn btn-primary" onclick="localesComponent.cargarLocalesMasivo()" disabled id="uploadBtn">Cargar Datos</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Cargar estilos personalizados
            this.agregarEstilos();
            
            // Establecer cliente ID si está en modo filtrado
            this.clienteIdActual = clienteId || null;
            
            // Cargar datos iniciales
            await this.cargarLocales(clienteId);
            
            // Inicializar eventos
            this.inicializarEventos();
            
        } catch (error) {
            console.error('Error al renderizar locales:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <h3>Error al cargar el módulo de locales</h3>
                    <p>No se pudieron cargar los datos. Por favor, verifica tu conexión.</p>
                    <button class="btn btn-primary" onclick="router.navigate('dashboard')">Volver al Dashboard</button>
                </div>
            `;
        }
    },
    
    agregarEstilos() {
        if (!document.getElementById('locales-styles')) {
            const style = document.createElement('style');
            style.id = 'locales-styles';
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
                .badge-retail {
                    background-color: #0d6efd;
                    color: white;
                    padding: 0.35em 0.65em;
                    font-size: 0.75em;
                    font-weight: 700;
                    border-radius: 0.25rem;
                }
                .badge-tradicional {
                    background-color: #198754;
                    color: white;
                    padding: 0.35em 0.65em;
                    font-size: 0.75em;
                    font-weight: 700;
                    border-radius: 0.25rem;
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    async cargarLocales(clienteId = null) {
        try {
            let locales;
            
            if (clienteId) {
                // Cargar locales de un cliente específico
                locales = await FirebaseService.getLocalesByCliente(clienteId);
            } else {
                // Cargar todos los locales
                locales = await FirebaseService.getLocales();
            }
            
            // Obtener clientes para mostrar nombres
            const clientes = await FirebaseService.getClientes();
            const clientesMap = {};
            clientes.forEach(cliente => {
                clientesMap[cliente.id] = cliente.razonSocial;
            });
            
            const tbody = document.getElementById('localesTableBody');
            tbody.innerHTML = '';
            
            if (locales.length === 0) {
                const colspan = clienteId ? 7 : 8;
                tbody.innerHTML = `
                    <tr>
                        <td colspan="${colspan}" class="text-center">No se encontraron locales${clienteId ? ' para este cliente' : ''}</td>
                    </tr>
                `;
                return;
            }
            
            locales.forEach(local => {
                const clienteNombre = clientesMap[local.clienteId] || 'Cliente no encontrado';
                const tipoBadge = local.tipo === 'retail' 
                    ? '<span class="badge badge-retail">Retail</span>'
                    : '<span class="badge badge-tradicional">Canal Tradicional</span>';
                
                tbody.innerHTML += `
                    <tr>
                        <td>${local.codigo || ''}</td>
                        <td ${clienteId ? 'style="display:none"' : ''}>${clienteNombre}</td>
                        <td>${local.nombre || ''}</td>
                        <td>${tipoBadge}</td>
                        <td>${local.direccion || ''}</td>
                        <td>${local.contacto || ''}</td>
                        <td>${local.telefono || ''}</td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="localesComponent.editarLocal('${local.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="localesComponent.eliminarLocal('${local.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
        } catch (error) {
            console.error('Error al cargar locales:', error);
            Swal.fire('Error', 'No se pudieron cargar los locales', 'error');
        }
    },
    
    cambiarTipoLocal() {
        const tipoRetail = document.getElementById('tipoRetail').checked;
        const camposRetail = document.getElementById('camposRetail');
        const campoDireccionFacturacion = document.getElementById('campoDireccionFacturacion');
        
        if (tipoRetail) {
            camposRetail.style.display = 'block';
            campoDireccionFacturacion.style.display = 'none';
        } else {
            camposRetail.style.display = 'none';
            campoDireccionFacturacion.style.display = 'block';
        }
    },
    
    cambiarFormatoCarga() {
        const formatoRetail = document.getElementById('formatoRetail').checked;
        const formatoRetailInfo = document.getElementById('formatoRetailInfo');
        const formatoTradicionalInfo = document.getElementById('formatoTradicionalInfo');
        
        if (formatoRetail) {
            formatoRetailInfo.style.display = 'block';
            formatoTradicionalInfo.style.display = 'none';
        } else {
            formatoRetailInfo.style.display = 'none';
            formatoTradicionalInfo.style.display = 'block';
        }
    },
    
    async guardarLocal() {
        try {
            const tipoLocal = document.querySelector('input[name="tipoLocal"]:checked').value;
            let clienteId = this.clienteIdActual;
            
            // Si no estamos en modo filtrado por cliente, tomar del selector
            if (!clienteId) {
                clienteId = document.getElementById('clienteSelect').value;
            }
            
            const nombreLocal = document.getElementById('nombreLocal').value;
            const direccionLocal = document.getElementById('direccionLocal').value;
            const contactoLocal = document.getElementById('contactoLocal').value;
            const telefonoLocal = document.getElementById('telefonoLocal').value;
            const emailLocal = document.getElementById('emailLocal').value;
            
            if (!clienteId || !nombreLocal || !direccionLocal || !contactoLocal || !telefonoLocal) {
                Swal.fire('Error', 'Todos los campos obligatorios deben ser completados', 'error');
                return;
            }
            
            // Datos generales del local
            const local = {
                clienteId,
                nombre: nombreLocal,
                direccion: direccionLocal,
                contacto: contactoLocal,
                telefono: telefonoLocal,
                email: emailLocal,
                tipo: tipoLocal,
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Datos específicos según tipo
            if (tipoLocal === 'retail') {
                local.numeroCuenta = document.getElementById('numeroCuenta').value;
                local.numeroLocal = document.getElementById('numeroLocal').value;
            } else {
                local.direccionFacturacion = document.getElementById('direccionFacturacion').value;
            }
            
            // Guardar en Firebase
            await FirebaseService.saveLocal(local);
            
            // Cerrar modal y resetear formulario
            const modal = bootstrap.Modal.getInstance(document.getElementById('addLocalModal'));
            modal.hide();
            document.getElementById('addLocalForm').reset();
            
            Swal.fire('Éxito', 'Local agregado correctamente', 'success');
            
            // Recargar datos
            await this.cargarLocales(this.clienteIdActual);
            
        } catch (error) {
            console.error('Error al guardar local:', error);
            Swal.fire('Error', 'No se pudo guardar el local', 'error');
        }
    },
    
    procesarArchivo(input) {
        const file = input.files[0];
        if (!file) return;
        
        const tipoFormato = document.querySelector('input[name="tipoFormato"]:checked').value;
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const data = e.target.result;
            let parsedData = [];
            
            try {
                if (file.name.endsWith('.csv')) {
                    // Procesar CSV
                    parsedData = this.procesarCSV(data, tipoFormato);
                } else {
                    // Procesar Excel
                    parsedData = this.procesarExcel(data, tipoFormato);
                }
                
                if (parsedData.length === 0) {
                    Swal.fire('Error', 'No se encontraron datos válidos en el archivo', 'error');
                    return;
                }
                
                this.datosTemporales = parsedData;
                this.mostrarPreview(parsedData, tipoFormato);
                
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
    
    procesarCSV(data, tipoFormato) {
        const lines = data.split('\n');
        if (lines.length < 2) return [];
        
        // Procesar encabezados
        const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
        
        // Validar encabezados según tipo de formato
        if (tipoFormato === 'retail') {
            const requiredHeaders = ['cuenta', 'cliente', 'n° de local', 'nombre del local', 'dirección', 'contacto', 'n° telefonico', 'correo'];
            if (!this.validarEncabezados(headers, requiredHeaders)) {
                throw new Error('Formato de encabezados incorrecto para Retail');
            }
        } else {
            const requiredHeaders = ['cliente', 'contacto', 'n°telefonico', 'correo', 'dirección de facturación', 'dirección del local'];
            if (!this.validarEncabezados(headers, requiredHeaders)) {
                throw new Error('Formato de encabezados incorrecto para Canal Tradicional');
            }
        }
        
        // Procesar datos según tipo
        const parsedData = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = line.split(';').map(v => v.trim());
            
            if (tipoFormato === 'retail') {
                if (values.length >= 8) {
                    parsedData.push({
                        cuenta: values[0],
                        cliente: values[1],
                        numeroLocal: values[2],
                        nombre: values[3],
                        direccion: values[4],
                        contacto: values[5],
                        telefono: values[6],
                        email: values[7],
                        tipo: 'retail'
                    });
                }
            } else {
                if (values.length >= 6) {
                    parsedData.push({
                        cliente: values[0],
                        contacto: values[1],
                        telefono: values[2],
                        email: values[3],
                        direccionFacturacion: values[4],
                        direccion: values[5],
                        tipo: 'canal_tradicional'
                    });
                }
            }
        }
        
        return parsedData;
    },
    
    procesarExcel(data, tipoFormato) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (jsonData.length < 2) return [];
        
        // Procesar encabezados
        const headers = jsonData[0].map(h => h.toString().trim().toLowerCase());
        
        // Validar encabezados según tipo de formato
        if (tipoFormato === 'retail') {
            const requiredHeaders = ['cuenta', 'cliente', 'n° de local', 'nombre del local', 'dirección', 'contacto', 'n° telefonico', 'correo'];
            if (!this.validarEncabezados(headers, requiredHeaders)) {
                throw new Error('Formato de encabezados incorrecto para Retail');
            }
        } else {
            const requiredHeaders = ['cliente', 'contacto', 'n°telefonico', 'correo', 'dirección de facturación', 'dirección del local'];
            if (!this.validarEncabezados(headers, requiredHeaders)) {
                throw new Error('Formato de encabezados incorrecto para Canal Tradicional');
            }
        }
        
        // Procesar datos según tipo
        const parsedData = [];
        
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;
            
            if (tipoFormato === 'retail') {
                if (row.length >= 8) {
                    parsedData.push({
                        cuenta: row[0]?.toString() || '',
                        cliente: row[1]?.toString() || '',
                        numeroLocal: row[2]?.toString() || '',
                        nombre: row[3]?.toString() || '',
                        direccion: row[4]?.toString() || '',
                        contacto: row[5]?.toString() || '',
                        telefono: row[6]?.toString() || '',
                        email: row[7]?.toString() || '',
                        tipo: 'retail'
                    });
                }
            } else {
                if (row.length >= 6) {
                    parsedData.push({
                        cliente: row[0]?.toString() || '',
                        contacto: row[1]?.toString() || '',
                        telefono: row[2]?.toString() || '',
                        email: row[3]?.toString() || '',
                        direccionFacturacion: row[4]?.toString() || '',
                        direccion: row[5]?.toString() || '',
                        tipo: 'canal_tradicional'
                    });
                }
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
    
    mostrarPreview(datos, tipoFormato) {
        const previewArea = document.getElementById('previewArea');
        const previewTableHead = document.getElementById('previewTableHead');
        const previewTableBody = document.getElementById('previewTableBody');
        const uploadBtn = document.getElementById('uploadBtn');
        
        // Generar encabezados según tipo
        let headersHtml = '<tr>';
        if (tipoFormato === 'retail') {
            headersHtml += `
                <th>Cuenta</th>
                <th>Cliente</th>
                <th>N° Local</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Email</th>
            `;
        } else {
            headersHtml += `
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Dir. Facturación</th>
                <th>Dir. Local</th>
            `;
        }
        headersHtml += '</tr>';
        previewTableHead.innerHTML = headersHtml;
        
        // Mostrar datos de ejemplo
        previewTableBody.innerHTML = '';
        datos.slice(0, 5).forEach(item => {
            let rowHtml = '<tr>';
            if (tipoFormato === 'retail') {
                rowHtml += `
                    <td>${item.cuenta || ''}</td>
                    <td>${item.cliente || ''}</td>
                    <td>${item.numeroLocal || ''}</td>
                    <td>${item.nombre || ''}</td>
                    <td>${item.direccion || ''}</td>
                    <td>${item.contacto || ''}</td>
                    <td>${item.telefono || ''}</td>
                    <td>${item.email || ''}</td>
                `;
            } else {
                rowHtml += `
                    <td>${item.cliente || ''}</td>
                    <td>${item.contacto || ''}</td>
                    <td>${item.telefono || ''}</td>
                    <td>${item.email || ''}</td>
                    <td>${item.direccionFacturacion || ''}</td>
                    <td>${item.direccion || ''}</td>
                `;
            }
            rowHtml += '</tr>';
            previewTableBody.innerHTML += rowHtml;
        });
        
        if (datos.length > 5) {
            let colspan = tipoFormato === 'retail' ? 8 : 6;
            previewTableBody.innerHTML += `
                <tr>
                    <td colspan="${colspan}" class="text-center">...y ${datos.length - 5} más</td>
                </tr>
            `;
        }
        
        previewArea.style.display = 'block';
        uploadBtn.disabled = false;
    },
    
    async cargarLocalesMasivo() {
        if (this.datosTemporales.length === 0) {
            Swal.fire('Error', 'No hay datos para cargar', 'error');
            return;
        }
        
        try {
            const tipoFormato = document.querySelector('input[name="tipoFormato"]:checked').value;
            const totalRegistros = this.datosTemporales.length;
            const batchSize = 100; // Procesar en lotes de 100
            let procesados = 0;
            let errores = 0;
            
            // Obtener todos los clientes para mapeo por nombre
            const clientes = await FirebaseService.getClientes();
            const clientesPorNombre = {};
            clientes.forEach(cliente => {
                // Normalizar nombre para búsqueda insensible a case y espacios
                const nombreNormalizado = cliente.razonSocial.toLowerCase().replace(/\s+/g, '');
                clientesPorNombre[nombreNormalizado] = cliente.id;
            });
            
            Swal.fire({
                title: 'Cargando locales...',
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
                
                for (const item of lote) {
                    // Si estamos en modo filtrado por cliente, usar ese cliente
                    let clienteId = this.clienteIdActual;
                    
                    // Si no estamos en modo filtrado, buscar cliente por nombre
                    if (!clienteId) {
                        if (item.cliente) {
                            const nombreNormalizado = item.cliente.toLowerCase().replace(/\s+/g, '');
                            clienteId = clientesPorNombre[nombreNormalizado];
                            
                            if (!clienteId) {
                                console.warn(`Cliente no encontrado: ${item.cliente}`);
                                errores++;
                                continue; // Saltar este registro
                            }
                        } else {
                            errores++;
                            continue; // Saltar si no hay cliente
                        }
                    }
                    
                    const docRef = firebase.firestore().collection('locales').doc();
                    
                    // Datos comunes
                    const localData = {
                        clienteId: clienteId,
                        tipo: item.tipo,
                        nombre: item.nombre || '',
                        direccion: item.direccion || '',
                        contacto: item.contacto || '',
                        telefono: item.telefono || '',
                        email: item.email || '',
                        fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    // Datos específicos según tipo
                    if (item.tipo === 'retail') {
                        localData.numeroCuenta = item.cuenta || '';
                        localData.numeroLocal = item.numeroLocal || '';
                    } else {
                        localData.direccionFacturacion = item.direccionFacturacion || '';
                    }
                    
                    batch.set(docRef, localData);
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
                Swal.fire('Completado con advertencias', `${procesados} locales cargados correctamente. ${errores} registros no pudieron procesarse debido a datos incompletos o clientes no encontrados.`, 'warning');
            } else {
                Swal.fire('Éxito', `${procesados} locales cargados correctamente`, 'success');
            }
            
            // Recargar datos
            await this.cargarLocales(this.clienteIdActual);
            
            // Resetear
            this.datosTemporales = [];
            document.getElementById('fileInput').value = '';
            document.getElementById('previewArea').style.display = 'none';
            document.getElementById('uploadBtn').disabled = true;
            
        } catch (error) {
            console.error('Error en carga masiva:', error);
            Swal.fire('Error', `No se pudieron cargar los locales: ${error.message}`, 'error');
        }
    },
    
    async eliminarLocal(id) {
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
                await FirebaseService.deleteLocal(id);
                Swal.fire('Eliminado', 'El local ha sido eliminado', 'success');
                
                // Recargar datos
                await this.cargarLocales(this.clienteIdActual);
            } catch (error) {
                console.error('Error al eliminar local:', error);
                Swal.fire('Error', 'No se pudo eliminar el local', 'error');
            }
        }
    },
    
    async editarLocal(id) {
        try {
            const local = await FirebaseService.getLocalById(id);
            
            if (!local) {
                Swal.fire('Error', 'No se encontró el local', 'error');
                return;
            }
            
            // Obtener todos los clientes para el selector
            const clientes = await FirebaseService.getClientes();
            
            const clientesOptions = clientes.map(cliente => 
                `<option value="${cliente.id}" ${cliente.id === local.clienteId ? 'selected' : ''}>${cliente.razonSocial}</option>`
            ).join('');
            
            // Crear modal de edición dinámicamente
            const modalHtml = `
                <div class="modal fade" id="editLocalModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Editar Local</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <form id="editLocalForm">
                                    <div class="mb-3">
                                        <label class="form-label">Tipo de Local</label>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="editTipoLocal" id="editTipoRetail" value="retail" ${local.tipo === 'retail' ? 'checked' : ''} onchange="localesComponent.cambiarTipoLocalEdit()">
                                            <label class="form-check-label" for="editTipoRetail">
                                                Retail
                                            </label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="editTipoLocal" id="editTipoTradicional" value="canal_tradicional" ${local.tipo === 'canal_tradicional' ? 'checked' : ''} onchange="localesComponent.cambiarTipoLocalEdit()">
                                            <label class="form-check-label" for="editTipoTradicional">
                                                Canal Tradicional
                                            </label>
                                        </div>
                                    </div>

                                    <div class="mb-3 ${this.clienteIdActual ? 'd-none' : ''}">
                                        <label for="editClienteSelect" class="form-label">Cliente</label>
                                        <select class="form-select" id="editClienteSelect" required>
                                            <option value="">Seleccione un cliente</option>
                                            ${clientesOptions}
                                        </select>
                                    </div>

                                    <!-- Campos para Retail -->
                                    <div id="editCamposRetail" style="${local.tipo === 'retail' ? 'display:block' : 'display:none'}">
                                        <div class="mb-3">
                                            <label for="editNumeroCuenta" class="form-label">Número de Cuenta</label>
                                            <input type="text" class="form-control" id="editNumeroCuenta" value="${local.numeroCuenta || ''}">
                                        </div>
                                        <div class="mb-3">
                                            <label for="editNumeroLocal" class="form-label">Número de Local</label>
                                            <input type="text" class="form-control" id="editNumeroLocal" value="${local.numeroLocal || ''}">
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="editNombreLocal" class="form-label">Nombre del Local</label>
                                        <input type="text" class="form-control" id="editNombreLocal" value="${local.nombre || ''}" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="editDireccionLocal" class="form-label">Dirección</label>
                                        <input type="text" class="form-control" id="editDireccionLocal" value="${local.direccion || ''}" required>
                                    </div>

                                    <!-- Campo Dirección Facturación (Solo Canal Tradicional) -->
                                    <div id="editCampoDireccionFacturacion" style="${local.tipo === 'canal_tradicional' ? 'display:block' : 'display:none'}">
                                        <div class="mb-3">
                                            <label for="editDireccionFacturacion" class="form-label">Dirección de Facturación</label>
                                            <input type="text" class="form-control" id="editDireccionFacturacion" value="${local.direccionFacturacion || ''}">
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="editContactoLocal" class="form-label">Contacto</label>
                                        <input type="text" class="form-control" id="editContactoLocal" value="${local.contacto || ''}" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="editTelefonoLocal" class="form-label">Teléfono</label>
                                        <input type="tel" class="form-control" id="editTelefonoLocal" value="${local.telefono || ''}" required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="editEmailLocal" class="form-label">Correo Electrónico</label>
                                        <input type="email" class="form-control" id="editEmailLocal" value="${local.email || ''}">
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" class="btn btn-primary" onclick="localesComponent.actualizarLocal('${local.id}')">Guardar Cambios</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Eliminar modal anterior si existe
            const existingModal = document.getElementById('editLocalModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Agregar nuevo modal al DOM
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Mostrar modal
            const modal = new bootstrap.Modal(document.getElementById('editLocalModal'));
            modal.show();
            
        } catch (error) {
            console.error('Error al editar local:', error);
            Swal.fire('Error', 'No se pudo cargar el local para editar', 'error');
        }
    },
    
    cambiarTipoLocalEdit() {
        const tipoRetail = document.getElementById('editTipoRetail').checked;
        const camposRetail = document.getElementById('editCamposRetail');
        const campoDireccionFacturacion = document.getElementById('editCampoDireccionFacturacion');
        
        if (tipoRetail) {
            camposRetail.style.display = 'block';
            campoDireccionFacturacion.style.display = 'none';
        } else {
            camposRetail.style.display = 'none';
            campoDireccionFacturacion.style.display = 'block';
        }
    },
    
    async actualizarLocal(id) {
        try {
            const tipoLocal = document.querySelector('input[name="editTipoLocal"]:checked').value;
            let clienteId = this.clienteIdActual;
            
            // Si no estamos en modo filtrado por cliente, tomar del selector
            if (!clienteId) {
                clienteId = document.getElementById('editClienteSelect').value;
            }
            
            const nombreLocal = document.getElementById('editNombreLocal').value;
            const direccionLocal = document.getElementById('editDireccionLocal').value;
            const contactoLocal = document.getElementById('editContactoLocal').value;
            const telefonoLocal = document.getElementById('editTelefonoLocal').value;
            const emailLocal = document.getElementById('editEmailLocal').value;
            
            if (!clienteId || !nombreLocal || !direccionLocal || !contactoLocal || !telefonoLocal) {
                Swal.fire('Error', 'Todos los campos obligatorios deben ser completados', 'error');
                return;
            }
            
            // Datos generales del local
            const localData = {
                clienteId,
                nombre: nombreLocal,
                direccion: direccionLocal,
                contacto: contactoLocal,
                telefono: telefonoLocal,
                email: emailLocal,
                tipo: tipoLocal,
                fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Datos específicos según tipo
            if (tipoLocal === 'retail') {
                localData.numeroCuenta = document.getElementById('editNumeroCuenta').value;
                localData.numeroLocal = document.getElementById('editNumeroLocal').value;
                // Eliminar campos de canal tradicional si existen
                localData.direccionFacturacion = firebase.firestore.FieldValue.delete();
            } else {
                localData.direccionFacturacion = document.getElementById('editDireccionFacturacion').value;
                // Eliminar campos de retail si existen
                localData.numeroCuenta = firebase.firestore.FieldValue.delete();
                localData.numeroLocal = firebase.firestore.FieldValue.delete();
            }
            
            // Actualizar en Firebase
            await FirebaseService.updateLocal(id, localData);
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editLocalModal'));
            modal.hide();
            
            Swal.fire('Éxito', 'Local actualizado correctamente', 'success');
            
            // Recargar datos
            await this.cargarLocales(this.clienteIdActual);
            
        } catch (error) {
            console.error('Error al actualizar local:', error);
            Swal.fire('Error', 'No se pudo actualizar el local', 'error');
        }
    },
    
    async filtrarPorCliente() {
        const clienteId = document.getElementById('clienteFilter').value;
        this.clienteIdActual = clienteId;
        await this.cargarLocales(clienteId);
    },
    
    async buscarLocales() {
        const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
        
        if (!searchTerm) {
            await this.cargarLocales(this.clienteIdActual);
            return;
        }
        
        try {
            const tbody = document.getElementById('localesTableBody');
            tbody.innerHTML = '<tr><td colspan="8" class="text-center"><i class="fas fa-spinner fa-spin"></i> Buscando locales...</td></tr>';
            
            // Obtener locales (filtrados por cliente si corresponde)
            let locales;
            if (this.clienteIdActual) {
                locales = await FirebaseService.getLocalesByCliente(this.clienteIdActual);
            } else {
                locales = await FirebaseService.getLocales();
            }
            
            // Filtrar locales por término de búsqueda
            const resultados = locales.filter(local => 
                (local.nombre && local.nombre.toLowerCase().includes(searchTerm)) ||
                (local.direccion && local.direccion.toLowerCase().includes(searchTerm)) ||
                (local.contacto && local.contacto.toLowerCase().includes(searchTerm)) ||
                (local.codigo && local.codigo.toLowerCase().includes(searchTerm)) ||
                (local.telefono && local.telefono.toLowerCase().includes(searchTerm))
            );
            
            // Obtener clientes para mostrar nombres
            const clientes = await FirebaseService.getClientes();
            const clientesMap = {};
            clientes.forEach(cliente => {
                clientesMap[cliente.id] = cliente.razonSocial;
            });
            
            tbody.innerHTML = '';
            
            if (resultados.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center">No se encontraron locales que coincidan con la búsqueda</td>
                    </tr>
                `;
                return;
            }
            
            resultados.forEach(local => {
                const clienteNombre = clientesMap[local.clienteId] || 'Cliente no encontrado';
                const tipoBadge = local.tipo === 'retail' 
                    ? '<span class="badge badge-retail">Retail</span>'
                    : '<span class="badge badge-tradicional">Canal Tradicional</span>';
                
                tbody.innerHTML += `
                    <tr>
                        <td>${local.codigo || ''}</td>
                        <td ${this.clienteIdActual ? 'style="display:none"' : ''}>${clienteNombre}</td>
                        <td>${local.nombre || ''}</td>
                        <td>${tipoBadge}</td>
                        <td>${local.direccion || ''}</td>
                        <td>${local.contacto || ''}</td>
                        <td>${local.telefono || ''}</td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="localesComponent.editarLocal('${local.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="localesComponent.eliminarLocal('${local.id}')">
                                <i class="fas fa-trash"></i>
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
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.buscarLocales();
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

