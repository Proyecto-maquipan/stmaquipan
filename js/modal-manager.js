// modal-manager.js (versión modificada)
// Sistema mejorado de gestión de modales para Portal Maquipan

/**
 * ModalManager - Sistema centralizado para manejar modales en toda la aplicación
 * Reemplaza completamente los modales de Bootstrap para evitar conflictos
 */
const ModalManager = {
    // Registro de modales activos
    activeModals: [],
    
    // Timeout ID para detección de bloqueos
    blockDetectionTimeout: null,
    
    /**
     * Inicializar el sistema de modales
     */
    init: function() {
        console.log('Inicializando sistema de gestión de modales (reemplazo completo)...');
        
        // PASO 1: Desactivar completamente los modales de Bootstrap
        this.disableBootstrapModals();
        
        // PASO 2: Reemplazar todos los eventos de modales de Bootstrap
        this.replaceBootstrapModalEvents();
        
        // Crear botón de recuperación de emergencia
        this.createEmergencyButton();
        
        // Iniciar monitoreo de UI bloqueada
        this.startBlockDetection();
        
        // Escuchar tecla de emergencia (Ctrl+Alt+R)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'r') {
                this.showEmergencyButton();
            }
        });
    },
    
    /**
     * Desactiva completamente los modales nativos de Bootstrap
     */
    disableBootstrapModals: function() {
        // Sobrescribir el constructor de Modal de Bootstrap
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const originalModal = bootstrap.Modal;
            
            // Crear una versión dummy que no hace nada
            bootstrap.Modal = function(element, options) {
                console.log('Modal de Bootstrap interceptado:', element?.id);
                return {
                    _element: element,
                    _config: options,
                    show: function() {
                        console.log('Intento de usar bootstrap.Modal.show() interceptado:', element?.id);
                        // Redirigir a nuestro gestor
                        if (element && element.id) {
                            ModalManager.open(element.id);
                        }
                    },
                    hide: function() {
                        console.log('Intento de usar bootstrap.Modal.hide() interceptado:', element?.id);
                        // Redirigir a nuestro gestor
                        if (element && element.id) {
                            ModalManager.close(element.id);
                        }
                    },
                    toggle: function() {
                        console.log('Intento de usar bootstrap.Modal.toggle() interceptado:', element?.id);
                        // Redirigir a nuestro gestor
                        if (element && element.id) {
                            ModalManager.open(element.id);
                        }
                    },
                    dispose: function() {
                        console.log('Intento de usar bootstrap.Modal.dispose() interceptado');
                    },
                    handleUpdate: function() {
                        console.log('Intento de usar bootstrap.Modal.handleUpdate() interceptado');
                    }
                };
            };
            
            // Mantener el método getInstance pero redirigiéndolo a nuestro gestor
            bootstrap.Modal.getInstance = function(element) {
                console.log('bootstrap.Modal.getInstance interceptado:', element?.id);
                return {
                    show: function() {
                        console.log('Intento de usar getInstance().show() interceptado:', element?.id);
                        if (element && element.id) {
                            ModalManager.open(element.id);
                        }
                    },
                    hide: function() {
                        console.log('Intento de usar getInstance().hide() interceptado:', element?.id);
                        if (element && element.id) {
                            ModalManager.close(element.id);
                        }
                    },
                    toggle: function() {
                        console.log('Intento de usar getInstance().toggle() interceptado:', element?.id);
                        if (element && element.id) {
                            ModalManager.open(element.id);
                        }
                    },
                    dispose: function() {},
                    handleUpdate: function() {}
                };
            };
        }
    },
    
    /**
     * Reemplaza todos los eventos y disparadores de modales de Bootstrap
     */
    replaceBootstrapModalEvents: function() {
        // 1. Interceptar clics en botones con data-bs-toggle="modal"
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-bs-toggle="modal"], [data-toggle="modal"]');
            if (target) {
                event.preventDefault();
                event.stopPropagation();
                
                // Obtener el ID del modal
                const targetSelector = target.getAttribute('data-bs-target') || target.getAttribute('data-target');
                if (targetSelector) {
                    const modalId = targetSelector.replace('#', '');
                    this.open(modalId);
                }
            }
        }, true); // Usar capturing para interceptar antes de que Bootstrap lo procese
        
        // 2. Interceptar todos los botones de cierre
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-bs-dismiss="modal"], [data-dismiss="modal"], .modal .btn-close, .modal .close');
            if (target) {
                event.preventDefault();
                event.stopPropagation();
                
                // Encontrar el modal padre
                const modalElement = target.closest('.modal');
                if (modalElement && modalElement.id) {
                    this.close(modalElement.id);
                } else {
                    // Si no se puede encontrar el ID, limpiar todos los modales
                    this.cleanUI();
                }
            }
        }, true); // Usar capturing para interceptar antes de que Bootstrap lo procese
        
        // 3. Interceptar clic en backdrop (fondo oscuro del modal)
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal') && event.target.classList.contains('show')) {
                const modalId = event.target.id;
                // Verificar si el modal permite cerrar con backdrop
                const backdrop = event.target.getAttribute('data-bs-backdrop') || event.target.getAttribute('data-backdrop');
                if (backdrop !== 'static') {
                    this.close(modalId);
                }
            }
        });
    },
    
    /**
     * Abre un modal de forma segura
     * @param {string} modalId - ID del modal a abrir
     * @returns {boolean} - Éxito de la operación
     */
    open: function(modalId) {
        try {
            console.log('Abriendo modal:', modalId);
            
            // Validar que exista el modal
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.error(`Modal ${modalId} no encontrado`);
                return false;
            }
            
            // Limpiar cualquier modal previo
            this.cleanUI();
            
            // Crear backdrop manualmente
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            backdrop.dataset.forModal = modalId;
            document.body.appendChild(backdrop);
            
            // Mostrar el modal manualmente
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
            modalElement.setAttribute('aria-modal', 'true');
            modalElement.removeAttribute('aria-hidden');
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            
            // Registrar modal activo
            this.activeModals.push({
                id: modalId,
                element: modalElement,
                timestamp: Date.now()
            });
            
            // Disparar evento personalizado para que los componentes puedan responder
            const event = new CustomEvent('modal.shown', {
                detail: { modalId: modalId }
            });
            modalElement.dispatchEvent(event);
            
            return true;
        } catch (error) {
            console.error('Error general al abrir modal:', error);
            this.cleanUI();
            return false;
        }
    },
    
    /**
     * Cierra un modal de forma segura
     * @param {string} modalId - ID del modal a cerrar
     * @returns {boolean} - Éxito de la operación
     */
    close: function(modalId) {
        try {
            console.log('Cerrando modal:', modalId);
            
            // Validar que exista el modal
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.error(`Modal ${modalId} no encontrado`);
                return false;
            }
            
            // Encontrar el modal en los activos
            const modalIndex = this.activeModals.findIndex(m => m.id === modalId);
            
            // Cerrar manualmente
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.removeAttribute('aria-modal');
            
            // Eliminar backdrop específico de este modal
            document.querySelectorAll(`.modal-backdrop[data-for-modal="${modalId}"]`).forEach(e => e.remove());
            
            // Quitar de modales activos
            if (modalIndex >= 0) {
                this.activeModals.splice(modalIndex, 1);
            }
            
            // Si no quedan modales activos, restaurar el body
            if (this.activeModals.length === 0) {
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
            }
            
            // Disparar evento personalizado para que los componentes puedan responder
            const event = new CustomEvent('modal.hidden', {
                detail: { modalId: modalId }
            });
            modalElement.dispatchEvent(event);
            
            return true;
        } catch (error) {
            console.error('Error al cerrar modal:', error);
            this.cleanUI(); // Limpiar UI como medida de seguridad
            return false;
        }
    },
    
    /**
     * Limpia completamente la UI de cualquier modal o backdrop
     */
    cleanUI: function() {
        console.log('Limpiando UI de modales');
        
        // Capturar los modales activos antes de limpiar
        const modalsToClose = [...this.activeModals];
        
        // Limpiar lista de modales activos
        this.activeModals = [];
        
        // Cerrar todos los modales manualmente
        document.querySelectorAll('.modal.show').forEach(modal => {
            try {
                modal.style.display = 'none';
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                modal.removeAttribute('aria-modal');
                
                // Disparar evento personalizado
                const event = new CustomEvent('modal.hidden', {
                    detail: { modalId: modal.id }
                });
                modal.dispatchEvent(event);
            } catch (e) {
                console.error('Error al cerrar modal manualmente:', e);
            }
        });
        
        // Remover todos los backdrops
        document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
        
        // Restaurar comportamiento del body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
    },
    
    /**
     * Crea un botón de recuperación de emergencia
     */
    createEmergencyButton: function() {
        // Verificar si ya existe
        if (document.getElementById('modalEmergencyBtn')) {
            return;
        }
        
        const btn = document.createElement('button');
        btn.id = 'modalEmergencyBtn';
        btn.className = 'btn btn-danger';
        btn.style = 'position: fixed; bottom: 10px; right: 10px; z-index: 9999; display: none;';
        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Desbloquear UI';
        btn.onclick = () => this.cleanUI();
        
        document.body.appendChild(btn);
    },
    
    /**
     * Muestra el botón de emergencia
     */
    showEmergencyButton: function() {
        const btn = document.getElementById('modalEmergencyBtn');
        if (btn) {
            btn.style.display = 'block';
        } else {
            this.createEmergencyButton();
            document.getElementById('modalEmergencyBtn').style.display = 'block';
        }
    },
    
    /**
     * Inicia la detección de UI bloqueada
     */
    startBlockDetection: function() {
        // Cancelar cualquier detección previa
        if (this.blockDetectionTimeout) {
            clearInterval(this.blockDetectionTimeout);
        }
        
        // Monitoreo periódico
        this.blockDetectionTimeout = setInterval(() => {
            // Verificar si hay backdrops sin modales visibles
            const hasBackdrops = document.querySelectorAll('.modal-backdrop').length > 0;
            const hasVisibleModals = document.querySelectorAll('.modal.show').length > 0;
            
            if (hasBackdrops && !hasVisibleModals) {
                console.warn('Bloqueo de UI detectado - Limpiando automáticamente');
                this.cleanUI();
            }
            
            // Verificar modales abiertos por mucho tiempo (más de 5 minutos)
            const now = Date.now();
            const staleModals = this.activeModals.filter(
                modal => (now - modal.timestamp) > 5 * 60 * 1000
            );
            
            if (staleModals.length > 0) {
                console.warn('Modales inactivos detectados:', staleModals.map(m => m.id));
                this.showEmergencyButton();
            }
        }, 5000);
    }
};

// Inicializar automáticamente cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    ModalManager.init();
    console.log('Sistema de gestión de modales inicializado (reemplazo completo)');
});

// Hacer disponible globalmente
window.ModalManager = ModalManager;
