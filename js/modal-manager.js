// js/modal-manager.js
// Sistema mejorado de gestión de modales para Portal Maquipan

/**
 * ModalManager - Sistema centralizado para manejar modales en toda la aplicación
 * Mejora la gestión de modales de Bootstrap para evitar problemas con UI bloqueada,
 * backdrops huérfanos, y proporciona métodos de recuperación.
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
        console.log('Inicializando sistema de gestión de modales...');
        
        // Interceptar eventos de modal de Bootstrap
        document.addEventListener('show.bs.modal', this.handleModalShow.bind(this));
        document.addEventListener('shown.bs.modal', this.handleModalShown.bind(this));
        document.addEventListener('hide.bs.modal', this.handleModalHide.bind(this));
        document.addEventListener('hidden.bs.modal', this.handleModalHidden.bind(this));
        
        // MODIFICACIÓN CLAVE: Interceptar todos los clics en elementos con data-bs-toggle="modal"
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-bs-toggle="modal"]');
            if (target) {
                event.preventDefault(); // Prevenir comportamiento por defecto de Bootstrap
                
                // Obtener el ID del modal a abrir desde data-bs-target
                const modalSelector = target.getAttribute('data-bs-target');
                if (modalSelector) {
                    const modalId = modalSelector.replace('#', '');
                    this.open(modalId);
                }
            }
        });
        
        // Iniciar monitoreo de UI bloqueada
        this.startBlockDetection();
        
        // Escuchar tecla de emergencia (Ctrl+Alt+R)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'r') {
                this.showEmergencyButton();
            }
        });
        
        // Crear botón de recuperación de emergencia (oculto inicialmente)
        this.createEmergencyButton();
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
            
            // Intentar usar Bootstrap para abrir el modal
            try {
                // Primero verificar si hay una instancia existente
                let modalInstance = bootstrap.Modal.getInstance(modalElement);
                
                // Si no existe, crear una nueva instancia
                if (!modalInstance) {
                    modalInstance = new bootstrap.Modal(modalElement, {
                        backdrop: 'static',
                        keyboard: true
                    });
                }
                
                // Registrar el modal como activo
                this.activeModals.push({
                    id: modalId,
                    element: modalElement,
                    instance: modalInstance,
                    timestamp: Date.now()
                });
                
                // Mostrar el modal
                modalInstance.show();
                return true;
            } catch (bootstrapError) {
                console.error('Error al usar Bootstrap para abrir modal:', bootstrapError);
                
                // Fallback manual si Bootstrap falla
                this.cleanUI(); // Limpiar cualquier modal previo
                
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
                    instance: null, // No hay instancia de Bootstrap
                    timestamp: Date.now(),
                    manuallyOpened: true
                });
                
                return true;
            }
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
            const modalInfo = modalIndex >= 0 ? this.activeModals[modalIndex] : null;
            
            // Intentar usar Bootstrap para cerrar el modal
            if (modalInfo && modalInfo.instance) {
                // Cerrar con instancia de Bootstrap
                modalInfo.instance.hide();
            } else {
                // Cerrar manualmente
                modalElement.style.display = 'none';
                modalElement.classList.remove('show');
                modalElement.setAttribute('aria-hidden', 'true');
                modalElement.removeAttribute('aria-modal');
                
                // Eliminar backdrop específico de este modal
                document.querySelectorAll(`.modal-backdrop[data-for-modal="${modalId}"]`).forEach(e => e.remove());
            }
            
            // Quitar de modales activos
            if (modalIndex >= 0) {
                this.activeModals.splice(modalIndex, 1);
            }
            
            // Si no quedan modales activos, restaurar el body
            if (this.activeModals.length === 0) {
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
            }
            
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
        
        // Capturar instancias de modales antes de limpiar
        const modalInstancesToDestroy = [...this.activeModals];
        
        // Limpiar lista de modales activos
        this.activeModals = [];
        
        // Cerrar todos los modales de Bootstrap
        modalInstancesToDestroy.forEach(modal => {
            try {
                if (modal.instance) {
                    modal.instance.hide();
                    // La instancia se limpiará automáticamente por el evento hidden.bs.modal
                }
            } catch (e) {
                console.error('Error al cerrar modal con Bootstrap:', e);
            }
        });
        
        // Cerrar todos los modales manualmente
        document.querySelectorAll('.modal.show').forEach(modal => {
            try {
                modal.style.display = 'none';
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                modal.removeAttribute('aria-modal');
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
    },
    
    /**
     * Maneja el evento de inicio de apertura de un modal
     */
    handleModalShow: function(event) {
        const modalElement = event.target;
        console.log('Evento show.bs.modal detectado:', modalElement.id);
    },
    
    /**
     * Maneja el evento cuando un modal se ha mostrado completamente
     */
    handleModalShown: function(event) {
        const modalElement = event.target;
        console.log('Evento shown.bs.modal detectado:', modalElement.id);
        
        // Actualizar o agregar el modal a la lista de activos
        const modalIndex = this.activeModals.findIndex(m => m.id === modalElement.id);
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        
        if (modalIndex >= 0) {
            this.activeModals[modalIndex].instance = modalInstance;
            this.activeModals[modalIndex].timestamp = Date.now();
        } else {
            this.activeModals.push({
                id: modalElement.id,
                element: modalElement,
                instance: modalInstance,
                timestamp: Date.now()
            });
        }
    },
    
    /**
     * Maneja el evento de inicio de cierre de un modal
     */
    handleModalHide: function(event) {
        const modalElement = event.target;
        console.log('Evento hide.bs.modal detectado:', modalElement.id);
    },
    
    /**
     * Maneja el evento cuando un modal se ha ocultado completamente
     */
    handleModalHidden: function(event) {
        const modalElement = event.target;
        console.log('Evento hidden.bs.modal detectado:', modalElement.id);
        
        // Remover de la lista de modales activos
        const modalIndex = this.activeModals.findIndex(m => m.id === modalElement.id);
        if (modalIndex >= 0) {
            this.activeModals.splice(modalIndex, 1);
        }
        
        // Si no quedan modales activos, restaurar el body
        if (this.activeModals.length === 0) {
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        }
    },
    
    /**
     * Maneja clics en elementos que abren modales
     */
    handleModalTriggerClick: function(event) {
        // Buscar si el clic fue en un botón que abre modal
        const trigger = event.target.closest('[data-bs-toggle="modal"]');
        if (!trigger) return;
        
        // Prevenir comportamiento por defecto
        event.preventDefault();
        
        // Obtener el ID del modal a abrir
        const targetModalId = trigger.getAttribute('data-bs-target');
        if (!targetModalId) return;
        
        // Extraer solo el ID sin # si existe
        const modalId = targetModalId.startsWith('#') ? targetModalId.substring(1) : targetModalId;
        
        // Abrir el modal de forma segura
        this.open(modalId);
    }
};

// Inicializar automáticamente cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    ModalManager.init();
    console.log('Sistema de gestión de modales inicializado');
});

// Hacer disponible globalmente
window.ModalManager = ModalManager;
