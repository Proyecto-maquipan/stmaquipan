// Componente Cotizaciones
const cotizacionesComponent = {
    async render(container) {
        try {
            // Mostrar loading mientras se cargan los datos
            container.innerHTML = '<div class="loading">Cargando cotizaciones...</div>';
            
            const cotizaciones = await storage.getCotizaciones();
            
            container.innerHTML = `
                <h2>Cotizaciones</h2>
                <div style="margin-bottom: 20px;">
                    <button class="btn btn-primary" onclick="router.navigate('nueva-cotizacion')">
                        Nueva Cotización
                    </button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>N° Cotización</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cotizaciones.map(cot => `
                            <tr>
                                <td>${cot.numero}</td>
                                <td>${cot.cliente}</td>
                                <td>${cot.fecha}</td>
                                <td>$${cot.total.toLocaleString('es-CL')}</td>
                                <td>${cot.estado}</td>
                                <td>
                                    <button class="btn btn-primary" onclick="router.navigate('editar-cotizacion/${cot.numero}')">Editar</button>
                                    <button class="btn btn-success" onclick="cotizacionPDF.generarPDF(${JSON.stringify(cot).replace(/"/g, '&quot;')})">
                                        <i class="fas fa-file-pdf"></i> PDF
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error('Error al cargar cotizaciones:', error);
            container.innerHTML = '<div class="error">Error al cargar cotizaciones</div>';
        }
    }
};

// Componente Nueva Cotización
const nuevaCotizacionComponent = {
    items: [],
    
    async render(container) {
        try {
            const clientes = await storage.getClientes();
            
            container.innerHTML = `
                <h2>Nueva Cotización</h2>
                <form id="formCotizacion">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Cliente:</label>
                            <select id="cotizacion-cliente" required>
                                <option value="">Seleccione un cliente</option>
                                ${clientes.map(cliente => `
                                    <option value="${cliente.razonSocial}" data-rut="${cliente.rut}" 
                                        data-direccion="${cliente.direccion || ''}" 
                                        data-telefono="${cliente.telefono || ''}"
                                        data-contacto="${cliente.contacto || ''}">
                                        ${cliente.razonSocial}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Fecha:</label>
                            <input type="date" id="cotizacion-fecha" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Contacto:</label>
                            <input type="text" id="cotizacion-contacto" required>
                        </div>
                        <div class="form-group">
                            <label>Teléfono:</label>
                            <input type="tel" id="cotizacion-telefono">
                        </div>
                    </div>
                    
                    <h3>Items</h3>
                    <div id="cotizacion-items" style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <div class="item-row" style="display: grid; grid-template-columns: 80px 100px 1fr 120px 100px 60px; gap: 10px; margin-bottom: 10px;">
                            <input type="number" class="cantidad form-control" placeholder="Cant." value="1" min="1">
                            <input type="text" class="codigo form-control" placeholder="Código">
                            <input type="text" class="descripcion form-control" placeholder="Descripción">
                            <input type="number" class="precio form-control" placeholder="Precio" min="0">
                            <input type="number" class="descuento form-control" placeholder="% Desc" min="0" max="100" value="0">
                            <button type="button" class="btn btn-danger" onclick="nuevaCotizacionComponent.removeItem(this)">X</button>
                        </div>
                    </div>
                    <button type="button" class="btn btn-success" onclick="nuevaCotizacionComponent.addItem()">+ Agregar Item</button>
                    
                    <div class="form-group" style="margin-top: 20px;">
                        <label>Observaciones:</label>
                        <textarea id="cotizacion-observaciones" rows="3" class="form-control"></textarea>
                    </div>
                    
                    <div id="totales" style="text-align: right; margin-top: 20px;">
                        <div>Subtotal: $<span id="subtotal">0</span></div>
                        <div>IVA (19%): $<span id="iva">0</span></div>
                        <div><strong>Total: $<span id="total">0</span></strong></div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Guardar Cotización</button>
                        <button type="button" class="btn btn-secondary" onclick="router.navigate('cotizaciones')">Cancelar</button>
                    </div>
                </form>
            `;
            
            // Event listeners
            setTimeout(() => {
                const form = document.getElementById('formCotizacion');
                if (form) {
                    form.addEventListener('submit', this.handleSubmit.bind(this));
                }
                
                // Auto-rellenar datos del cliente
                const clienteSelect = document.getElementById('cotizacion-cliente');
                clienteSelect.addEventListener('change', function() {
                    const selectedOption = this.selectedOptions[0];
                    if (selectedOption.value) {
                        document.getElementById('cotizacion-contacto').value = selectedOption.dataset.contacto || '';
                        document.getElementById('cotizacion-telefono').value = selectedOption.dataset.telefono || '';
                    }
                });
                
                // Calcular totales cuando cambian los valores
                document.getElementById('cotizacion-items').addEventListener('input', this.calcularTotales.bind(this));
            }, 0);
        } catch (error) {
            console.error('Error al renderizar formulario:', error);
            container.innerHTML = '<div class="error">Error al cargar el formulario</div>';
        }
    },
    
    addItem() {
        const itemsContainer = document.getElementById('cotizacion-items');
        const newItem = document.createElement('div');
        newItem.className = 'item-row';
        newItem.style.cssText = 'display: grid; grid-template-columns: 80px 100px 1fr 120px 100px 60px; gap: 10px; margin-bottom: 10px;';
        newItem.innerHTML = `
            <input type="number" class="cantidad form-control" placeholder="Cant." value="1" min="1">
            <input type="text" class="codigo form-control" placeholder="Código">
            <input type="text" class="descripcion form-control" placeholder="Descripción">
            <input type="number" class="precio form-control" placeholder="Precio" min="0">
            <input type="number" class="descuento form-control" placeholder="% Desc" min="0" max="100" value="0">
            <button type="button" class="btn btn-danger" onclick="nuevaCotizacionComponent.removeItem(this)">X</button>
        `;
        itemsContainer.appendChild(newItem);
    },
    
    removeItem(button) {
        const itemRow = button.closest('.item-row');
        const itemsContainer = document.getElementById('cotizacion-items');
        if (itemsContainer.children.length > 1) {
            itemRow.remove();
            this.calcularTotales();
        }
    },
    
    calcularTotales() {
        const itemRows = document.querySelectorAll('.item-row');
        let subtotal = 0;
        
        itemRows.forEach(row => {
            const cantidad = parseFloat(row.querySelector('.cantidad').value) || 0;
            const precio = parseFloat(row.querySelector('.precio').value) || 0;
            const descuento = parseFloat(row.querySelector('.descuento').value) || 0;
            
            const totalItem = cantidad * precio * (1 - descuento / 100);
            subtotal += totalItem;
        });
        
        const iva = subtotal * 0.19;
        const total = subtotal + iva;
        
        document.getElementById('subtotal').textContent = subtotal.toLocaleString('es-CL');
        document.getElementById('iva').textContent = iva.toLocaleString('es-CL');
        document.getElementById('total').textContent = total.toLocaleString('es-CL');
    },
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const itemRows = document.querySelectorAll('.item-row');
        const items = [];
        
        itemRows.forEach(row => {
            const item = {
                cantidad: parseInt(row.querySelector('.cantidad').value),
                codigo: row.querySelector('.codigo').value,
                descripcion: row.querySelector('.descripcion').value,
                precioUnitario: parseFloat(row.querySelector('.precio').value),
                descuento: parseFloat(row.querySelector('.descuento').value),
                total: 0
            };
            
            // Calcular total del item
            item.total = item.cantidad * item.precioUnitario * (1 - item.descuento / 100);
            
            if (item.descripcion && item.precioUnitario > 0) {
                items.push(item);
            }
        });
        
        if (items.length === 0) {
            alert('Debe agregar al menos un item a la cotización');
            return;
        }
        
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const clienteSelect = document.getElementById('cotizacion-cliente');
        const selectedOption = clienteSelect.selectedOptions[0];
        
        const cotizacion = {
            cliente: clienteSelect.value,
            rut: selectedOption.dataset.rut || '',
            direccion: selectedOption.dataset.direccion || '',
            ciudad: 'SANTIAGO',
            fecha: document.getElementById('cotizacion-fecha').value,
            contacto: document.getElementById('cotizacion-contacto').value,
            telefono: document.getElementById('cotizacion-telefono').value,
            email: '',
            vendedor: 'Claudio Arnoldo Gaete',
            productos: items,
            observaciones: document.getElementById('cotizacion-observaciones').value,
            subtotal: subtotal,
            descuento: 0,
            iva: subtotal * 0.19,
            total: subtotal * 1.19,
            formaPago: 'Crédito 30 días',
            validez: '15 días',
            estado: 'Activa',
            fechaCreacion: new Date().toISOString()
        };
        
        try {
            const numero = await storage.saveCotizacion(cotizacion);
            alert(`Cotización ${numero} creada exitosamente`);
            router.navigate('cotizaciones');
        } catch (error) {
            console.error('Error al guardar cotización:', error);
            alert('Error al guardar la cotización');
        }
    }
};
