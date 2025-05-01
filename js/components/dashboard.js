// Componente Dashboard
const dashboardComponent = {
    render(container) {
        const stats = storage.getDashboardStats();
        const requerimientos = storage.getRequerimientos().slice(0, 5); // Últimos 5
        
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
                    ${requerimientos.map(req => `
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
    }
};
