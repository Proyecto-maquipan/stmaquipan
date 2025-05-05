// js/services/modal-manager.js
// Servicio centralizado para gestionar modales Bootstrap

const ModalManager = {
    /**
     * Abre un modal usando la API de Bootstrap
     * @param {string} modalId - ID del elemento modal sin el símbolo #
     * @returns {Object|null} - Instancia del modal o null si falla
     */
    show: function(modalId) {
        try {
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.error(`Modal con ID '${modalId}' no encontrado`);
                return null;
            }
            
            // Comprobar si ya existe una instancia
            let modalInstance = bootstrap.Modal.getInstance(modalElement);
            
            // Si no existe, crear una nueva
            if (!modalInstance) {
                modalInstance = new bootstrap.Modal(modalElement);
            }
            
            // Mostrar el modal
            modalInstance.show();
            return modalInstance;
        } catch (error) {
            console.error(`Error al abrir modal ${modalId}:`, error);
            // Intentar limpiar la UI en caso de error
            this.cleanUI();
            return null;
        }
    },
    
    /**
     * Cierra un modal de forma segura
     * @param {string} modalId - ID del elemento modal sin el símbolo #
     * @returns {boolean} - true si se cerró correctamente, false si no
     */
    hide: function(modalId) {
        try {
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.error(`Modal con ID '${modalId}' no encontrado`);
                return false;
            }
            
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
                return true;
            } else {
                console.warn(`No se encontró instancia del modal '${modalId}'`);
                // Intentar cerrar manualmente
                return this.cleanUI();
            }
        } catch (error) {
            console.error(`Error al cerrar modal ${modalId}:`, error);
            // Intentar limpiar la UI en caso de error
            return this.cleanUI();
        }
    },
    
    /**
     * Limpia la UI de modales bloqueados
     * @returns {boolean} - true si se limpió correctamente
     */
    cleanUI: function() {
        try {
            // Remover backdrops
            document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
            
            // Limpiar clases y estilos del body
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            
            // Cerrar todos los modales abiertos
            document.querySelectorAll('.modal.show').forEach(modalElement => {
                try {
                    modalElement.classList.remove('show');
                    modalElement.setAttribute('aria-hidden', 'true');
                    modalElement.style.display = 'none';
                } catch (modalError) {
                    console.warn('Error al cerrar modal:', modalError);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Error limpiando UI:', error);
            return false;
        }
    },
    
    /**
     * Crea un modal dinámicamente y lo agrega al DOM
     * @param {string} id - ID para el nuevo modal
     * @param {string} title - Título del modal
     * @param {string} bodyContent - Contenido HTML para el cuerpo del modal
     * @param {Object} options - Opciones adicionales
     * @returns {string} - ID del modal creado
     */
    createDynamic: function(id, title, bodyContent, options = {}) {
        // Establecer opciones predeterminadas
        const defaultOptions = {
            size: 'modal-lg', // 'modal-sm', 'modal-lg', 'modal-xl'
            showCloseButton: true,
            backdrop: 'static', // true, false, 'static'
            keyboard: true,
            footerButtons: [
                { id: 'closeBtn', type: 'secondary', text: 'Cancelar', dismiss: true },
                { id: 'saveBtn', type: 'primary', text: 'Guardar' }
            ]
        };
        
        const opts = { ...defaultOptions, ...options };
        
        // Eliminar modal existente si lo hay
        const existingModal = document.getElementById(id);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Crear footer con botones
        let footerContent = '';
        if (opts.footerButtons && opts.footerButtons.length > 0) {
            footerContent = opts.footerButtons.map(btn => {
                const dismissAttr = btn.dismiss ? 'data-bs-dismiss="modal"' : '';
                const onclickAttr = btn.onclick ? `onclick="${btn.onclick}"` : '';
                return `<button type="button" id="${btn.id}" class="btn btn-${btn.type}" ${dismissAttr} ${onclickAttr}>${btn.text}</button>`;
            }).join('');
        }
        
        // Crear estructura del modal
        const modalHTML = `
            <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}Label" aria-hidden="true"
                 data-bs-backdrop="${opts.backdrop}" data-bs-keyboard="${opts.keyboard}">
                <div class="modal-dialog ${opts.size}">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="${id}Label">${title}</h5>
                            ${opts.showCloseButton ? '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' : ''}
                        </div>
                        <div class="modal-body">
                            ${bodyContent}
                        </div>
                        ${footerContent ? `<div class="modal-footer">${footerContent}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Agregar al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        return id;
    }
};

// Hacer disponible globalmente
window.ModalManager = ModalManager;

// Añadir método de recuperación de UI global
window.resetUIState = function() {
    console.log('Ejecutando recuperación de UI');
    return ModalManager.cleanUI();
};

console.log('ModalManager inicializado correctamente');
