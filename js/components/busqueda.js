// Componente Búsqueda
const busquedaComponent = {
    render(container) {
        container.innerHTML = `
            <h2>Búsqueda</h2>
            <div class="form-row">
                <div class="form-group">
                    <label>Tipo de búsqueda:</label>
                    <select id="tipo-busqueda">
                        <option value="requerimiento">Requerimiento</option>
                        <option value="cotizacion">Cotización</option>
                        <option value="cliente">Cliente</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Término de búsqueda:</label>
                    <input type="text" id="termino-busqueda" placeholder="Ingrese su búsqueda">
                </div>
                <div class="form-group">
                    <label>&nbsp;</label>
                    <button class="btn btn-primary" onclick="busquedaComponent.realizarBusqueda()">Buscar</button>
                </div>
            </div>
            <div id="resultados-busqueda" style="margin-top: 20px;">
                <!-- Los resultados se mostrarán aquí -->
            </div>
        `;
    },
    
    realizarBusqueda() {
        const tipo = document.getElementById('tipo-busqueda').value;
        const termino = document.getElementById('termino-busqueda').value;
        
        if (!termino) {
            alert('Por favor ingrese un término de búsqueda');
            return;
        }
        
        const resultados = storage.search(tipo, termino);
        const resultadosDiv = document.getElementById('resultados-busqueda');
        
        if (resultados.length === 0) {
            resultadosDiv.innerHTML = '<p>No se encontraron resultados</p>';
            return;
        }
        
        let html = '<h3>Resultados de búsqueda:</h3>';
        
        switch(tipo) {
            case 'requerimiento':
                html += `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Técnico</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${resultados.map(req => `
                                <tr>
                                    <td>${req.id}</td>
                                    <td>${req.cliente}</td>
                                    <td>${req.tecnico}</td>
                                    <td>${req.fecha}</td>
                                    <td>${req.estado}</td>
                                    <td>
                                        <button class="btn btn-primary" onclick="router.navigate('ver-requerimiento/${req.id}')">Ver</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                break;
                
            case 'cotizacion':
                html += `
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
                            ${resultados.map(cot => `
                                <tr>
                                    <td>${cot.numero}</td>
                                    <td>${cot.cliente}</td>
                                    <td>${cot.fecha}</td>
                                    <td>$${cot.total}</td>
                                    <td>${cot.estado}</td>
                                    <td>
                                        <button class="btn btn-primary" onclick="router.navigate('ver-cotizacion/${cot.numero}')">Ver</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                break;
                
            case 'cliente':
                html += `
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>RUT</th>
                                <th>Razón Social</th>
                                <th>Contacto</th>
                                <th>Teléfono</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${resultados.map(cliente => `
                                <tr>
                                    <td>${cliente.rut}</td>
                                    <td>${cliente.razonSocial}</td>
                                    <td>${cliente.contacto}</td>
                                    <td>${cliente.telefono}</td>
                                    <td>
                                        <button class="btn btn-primary" onclick="router.navigate('editar-cliente/${cliente.id}')">Editar</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                break;
        }
        
        resultadosDiv.innerHTML = html;
    }
};
