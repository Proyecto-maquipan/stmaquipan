// js/components/nuevo-cliente.js
// Componente para crear nuevos clientes

const nuevoClienteComponent = {
    render: function(container) {
        const appContainer = container || document.getElementById('app');
        
        const template = `
            <div class="component-container">
                <h2>Nuevo Cliente</h2>
                <form id="nuevoClienteForm" class="form-container">
                    <div class="form-group">
                        <label for="rut">RUT:</label>
                        <input type="text" id="rut" name="rut" class="form-control" required pattern="[0-9]{1,8}-[0-9kK]{1}" placeholder="12345678-9">
                    </div>
                    <div class="form-group">
                        <label for="razonSocial">Razón Social:</label>
                        <input type="text" id="razonSocial" name="razonSocial" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="direccion">Dirección:</label>
                        <input type="text" id="direccion" name="direccion" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="ciudad">Ciudad:</label>
                        <input type="text" id="ciudad" name="ciudad" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="contacto">Persona de Contacto:</label>
                        <input type="text" id="contacto" name="contacto" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="telefono">Teléfono:</label>
                        <input type="tel" id="telefono" name="telefono" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" class="form-control">
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
                rut: formData.get('rut'),
                razonSocial: formData.get('razonSocial'),
                direccion: formData.get('direccion') || '',
                ciudad: formData.get('ciudad') || '',
                contacto: formData.get('contacto') || '',
                telefono: formData.get('telefono') || '',
                email: formData.get('email') || '',
                fechaCreacion: new Date().toISOString(),
                activo: true
            };
            
            // Validar RUT
            const rutPattern = /^[0-9]{1,8}-[0-9kK]{1}$/;
            if (!rutPattern.test(cliente.rut)) {
                Swal.fire({
                    title: 'Error',
                    text: 'El RUT debe tener el formato correcto (ej: 12345678-9)',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }
            
            // Verificar si ya existe un cliente con ese RUT
            const clientes = await FirebaseService.getClientes();
            const clienteExistente = clientes.find(c => c.rut === cliente.rut);
            if (clienteExistente) {
                Swal.fire({
                    title: 'Error',
                    text: 'Ya existe un cliente con ese RUT',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }
            
            // Guardar cliente
            await FirebaseService.saveCliente(cliente);
            
            // Mostrar mensaje de éxito
            Swal.fire({
                title: '¡Cliente creado!',
                text: `El cliente ${cliente.razonSocial} ha sido creado con éxito.`,
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
