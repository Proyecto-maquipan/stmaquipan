// Componente Clientes
const clientesComponent = {
    render(container) {
        const clientes = storage.getClientes();
        
        container.innerHTML = `
            <h2>Clientes</h2>
            <div style="margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="router.navigate('nuevo-cliente')">
                    Nuevo Cliente
                </button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>RUT</th>
                        <th>Razón Social</th>
                        <th>Contacto</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientes.map(cliente => `
                        <tr>
                            <td>${cliente.rut}</td>
                            <td>${cliente.razonSocial}</td>
                            <td>${cliente.contacto}</td>
                            <td>${cliente.telefono}</td>
                            <td>${cliente.email}</td>
                            <td>
                                <button class="btn btn-primary" onclick="router.navigate('editar-cliente/${cliente.id}')">Editar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
};

// Componente Nuevo Cliente
const nuevoClienteComponent = {
    render(container) {
        container.innerHTML = `
            <h2>Nuevo Cliente</h2>
            <form id="formCliente">
                <div class="form-row">
                    <div class="form-group">
                        <label>RUT:</label>
                        <input type="text" id="cliente-rut" required pattern="[0-9]{1,8}-[0-9kK]{1}" 
                               placeholder="12345678-9">
                    </div>
                    <div class="form-group">
                        <label>Razón Social:</label>
                        <input type="text" id="cliente-razon-social" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Dirección:</label>
                        <input type="text" id="cliente-direccion" required>
                    </div>
                    <div class="form-group">
                        <label>Ciudad:</label>
                        <input type="text" id="cliente-ciudad" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Contacto:</label>
                        <input type="text" id="cliente-contacto" required>
                    </div>
                    <div class="form-group">
                        <label>Teléfono:</label>
                        <input type="tel" id="cliente-telefono" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="cliente-email">
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Guardar Cliente</button>
                    <button type="button" class="btn btn-secondary" onclick="router.navigate('clientes')">Cancelar</button>
                </div>
            </form>
        `;
        
        // Agregar event listener al formulario
        setTimeout(() => {
            const form = document.getElementById('formCliente');
            if (form) {
                form.addEventListener('submit', this.handleSubmit);
            }
        }, 0);
    },
    
    handleSubmit(e) {
        e.preventDefault();
        
        const cliente = {
            rut: document.getElementById('cliente-rut').value,
            razonSocial: document.getElementById('cliente-razon-social').value,
            direccion: document.getElementById('cliente-direccion').value,
            ciudad: document.getElementById('cliente-ciudad').value,
            contacto: document.getElementById('cliente-contacto').value,
            telefono: document.getElementById('cliente-telefono').value,
            email: document.getElementById('cliente-email').value,
            fechaCreacion: new Date().toISOString()
        };
        
        // Verificar si el RUT ya existe
        const existente = storage.getClientes().find(c => c.rut === cliente.rut);
        if (existente) {
            alert('Ya existe un cliente con ese RUT');
            return;
        }
        
        const id = storage.saveCliente(cliente);
        alert(`Cliente ${cliente.razonSocial} creado exitosamente`);
        router.navigate('clientes');
    }
};
