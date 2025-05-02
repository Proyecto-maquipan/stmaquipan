// js/components/nuevo-cliente.js
// Componente para crear nuevos clientes

const nuevoClienteComponent = {
    render: function() {
        const appContainer = document.getElementById('app');
        
        const template = `
            <div class="component-container">
                <h2>Nuevo Cliente</h2>
                <form id="nuevoClienteForm" class="form-container">
                    <div class="form-group">
                        <label for="nombre">Nombre o Razón Social:</label>
                        <input type="text" id="nombre" name="nombre" required>
                    </div>
                    <div class="form-group">
                        <label for="rut">RUT:</label>
                        <input type="text" id="rut" name="rut" required>
                    </div>
                    <div class="form-group">
                        <label for="direccion">Dirección:</label>
                        <input type="text" id="direccion" name="direccion">
                    </div>
                    <div class="form-group">
                        <label for="telefono">Teléfono:</label>
                        <input type="tel" id="telefono" name="telefono">
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email">
                    </div>
                    <div class="form-group">
                        <label for="contacto">Persona de Contacto:</label>
                        <input type="text" id="contacto" name="contacto">
                    </div>
                    <div class="button-group">
                        <button type="submit" class="btn btn-primary">Guardar Cliente</button>
                        <button type="button" class="btn btn-secondary" id="cancelarBtn">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        
        appContainer.innerHTML = template;
        
        // Agregar event listeners
        document.getElementById('nuevoClienteForm').addEventListener('submit', this.handleSubmit);
        document.getElementById('cancelarBtn').addEventListener('click', () => router.navigate('clientes'));
    },
    
    handleSubmit: async function(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const cliente = {
                nombre: formData.get('nombre'),
                rut: formData.get('rut'),
                direccion: formData.get('direccion') || '',
                telefono: formData.get('telefono') || '',
                email: formData.get('email') || '',
                contacto: formData.get('contacto') || '',
                fechaCreacion: new Date().toISOString(),
                activo: true
            };
            
            // Guardar cliente
            await FirebaseService.saveCliente(cliente);
            
            // Mostrar mensaje de éxito
            Swal.fire({
                title: '¡Cliente creado!',
                text: `El cliente ${cliente.nombre} ha sido creado con éxito.`,
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                router.navigate('clientes');
            });
        } catch (error) {
            console.error('Error al crear cliente:', error);
            
            // Mostrar mensaje de error
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al crear el cliente. Por favor, inténtalo nuevamente.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }
};

// Registrar el componente
if (typeof window.componentRegistry === 'undefined') {
    window.componentRegistry = {};
}

window.componentRegistry['nuevo-cliente'] = nuevoClienteComponent;
