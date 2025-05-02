// Componente Dashboard
const dashboardComponent = {
    async render(container) {
        try {
            // Mostrar loading mientras se cargan los datos
            container.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i> Cargando datos...
                </div>
            `;
            
            // Obtener datos de Firebase
            const stats = await storage.getDashboardStats();
            const requerimientos = await storage.getRequerimientos();
            const ultimosRequerimientos = requerimientos.slice(0, 5); // Últimos 5
            
            container.innerHTML = `
                <h2>Dashboard</h2>
                <div class="dashboard-cards">
                    <div class="card">
                        <div class="card-title">Requerimientos Pendientes</div>
                        <div class="card-value">${stats.requerimientosPendientes}</div>
                    </div>
                    <div class="card">
                        <div class="card-title">Cotizaciones Activas</div>
                        <div class="card-value">${stats.cotizacionesActivas}</div>
                    </div>
                    <div class="card">
                        <div class="card-title">Servicios Completados</div>
                        <div class="card-value">${stats.serviciosCompletados}</div>
                    </div>
                    <div class="card">
                        <div class="card-title">Clientes Activos</div>
                        <div class="card-value">${stats.clientesActivos}</div>
                    </div>
                </div>
                
                <h3>Últimos Requerimientos</h3>
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
                        ${ultimosRequerimientos.length > 0 ? ultimosRequerimientos.map(req => `
                            <tr>
                                <td>${req.id || ''}</td>
                                <td>${req.cliente || ''}</td>
                                <td>${req.tecnico || ''}</td>
                                <td>${req.fecha || ''}</td>
                                <td>${req.estado || ''}</td>
                                <td>
                                    <button class="btn btn-primary" onclick="router.navigate('ver-requerimiento/${req.id}')">Ver</button>
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="6" style="text-align: center;">No hay requerimientos registrados</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error('Error en dashboard:', error);
            container.innerHTML = `
                <div class="error">
                    <h3>Error al cargar el dashboard</h3>
                    <p>No se pudieron cargar los datos. Por favor, verifica tu conexión a internet y recarga la página.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Recargar página</button>
                </div>
            `;
        }
    }
};
