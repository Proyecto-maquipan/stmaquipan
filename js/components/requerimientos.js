// Componente Requerimientos
const requerimientosComponent = {
    render(container) {
        const requerimientos = storage.getRequerimientos();
        
        container.innerHTML = `
            <h2>Requerimientos</h2>
            <div style="margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="router.navigate('nuevo-requerimiento')">
                    Nuevo Requerimiento
                </button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Contrato</th>
                        <th>Técnico</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${requerimientos.map(req => `
                        <tr>
                            <td>${req.id}</td>
                            <td>${req.cliente}</td>
                            <td>${req.contrato}</td>
                            <td>${req.tecnico}</td>
                            <td>${req.fecha}</td>
                            <td>${req.estado}</td>
                            <td>
                                <button class="btn btn-primary" onclick="router.navigate('editar-requerimiento/${req.id}')">Editar</button>
                                <button class="btn btn-success" onclick="generarPDF('${req.id}')">PDF</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
};

// Componente Nuevo Requerimiento
const nuevoRequerimientoComponent = {
    render(container) {
        const clientes = storage.getClientes();
        
        container.innerHTML = `
            <h2>Nuevo Requerimiento</h2>
            <form id="formRequerimiento">
                <div class="form-row">
                    <div class="form-group">
                        <label>Cliente:</label>
                        <select id="requerimiento-cliente" required>
                            <option value="">Seleccione un cliente</option>
                            ${clientes.map(cliente => `
                                <option value="${cliente.razonSocial}">${cliente.razonSocial}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Contrato:</label>
                        <input type="text" id="requerimiento-contrato" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Técnico:</label>
                        <select id="requerimiento-tecnico" required>
                            <option value="">Seleccione un técnico</option>
                            <option value="MORALES LIZAMA HUGO HERNAN">MORALES LIZAMA HUGO HERNAN</option>
                            <option value="JUAN PEREZ">JUAN PEREZ</option>
                            <option value="PEDRO GONZALEZ">PEDRO GONZALEZ</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Fecha:</label>
                        <input type="date" id="requerimiento-fecha" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Descripción del servicio:</label>
                    <textarea id="requerimiento-descripcion" rows="4" required></textarea>
                </div>
                
                <h3>Datos del equipo</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>Marca:</label>
                        <input type="text" id="equipo-marca" required>
                    </div>
                    <div class="form-group">
                        <label>Modelo:</label>
                        <input type="text" id="equipo-modelo" required>
                    </div>
                    <div class="form-group">
                        <label>Serie:</label>
                        <input type="text" id="equipo-serie" required>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Guardar Requerimiento</button>
                    <button type="button" class="btn btn-secondary" onclick="router.navigate('requerimientos')">Cancelar</button>
                </div>
            </form>
        `;
        
        // Agregar event listener al formulario
        setTimeout(() => {
            const form = document.getElementById('formRequerimiento');
            if (form) {
                form.addEventListener('submit', this.handleSubmit);
            }
        }, 0);
    },
    
    handleSubmit(e) {
        e.preventDefault();
        
        const requerimiento = {
            cliente: document.getElementById('requerimiento-cliente').value,
            contrato: document.getElementById('requerimiento-contrato').value,
            tecnico: document.getElementById('requerimiento-tecnico').value,
            fecha: document.getElementById('requerimiento-fecha').value,
            descripcion: document.getElementById('requerimiento-descripcion').value,
            equipo: {
                marca: document.getElementById('equipo-marca').value,
                modelo: document.getElementById('equipo-modelo').value,
                serie: document.getElementById('equipo-serie').value
            },
            estado: 'Pendiente',
            fechaCreacion: new Date().toISOString()
        };
        
        const id = storage.saveRequerimiento(requerimiento);
        alert(`Requerimiento ${id} creado exitosamente`);
        router.navigate('requerimientos');
    }
};
