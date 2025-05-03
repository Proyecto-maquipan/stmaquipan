// js/modal-manager.js
const ModalManager = {
    // Abrir un modal con seguridad
    open: function(modalId) {
        try {
            console.log('Abriendo modal:', modalId);
            
            // Limpiar cualquier modal previo
            this.cleanUI();
            
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.error(`Modal ${modalId} no encontrado`);
                return null;
            }
            
            // Crear backdrop manualmente
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
            
            // Mostrar el modal
            modalElement.style.display = 'block';
            modalElement.classList.add('show');
            modalElement.setAttribute('aria-modal', 'true');
            modalElement.removeAttribute('aria-hidden');
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            
            // Configurar cierre con ESC
            const escKeyHandler = (e) => {
                if (e.key === 'Escape') {
                    this.close(modalId);
                    document.removeEventListener('keydown', escKeyHandler);
                }
            };
            document.addEventListener('keydown', escKeyHandler);
            
            // Configurar cierre al hacer clic en botones de cierre
            const closeButtons = modalElement.querySelectorAll('[data-bs-dismiss="modal"]');
            closeButtons.forEach(button => {
                button.addEventListener('click', () => this.close(modalId), { once: true });
            });
            
            return true;
        } catch (error) {
            console.error('Error al abrir modal:', error);
            this.cleanUI();
            return false;
        }
    },
    
    // Cerrar un modal con seguridad
    close: function(modalId) {
        try {
            console.log('Cerrando modal:', modalId);
            
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.error(`Modal ${modalId} no encontrado`);
                return false;
            }
            
            // Ocultar el modal
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.removeAttribute('aria-modal');
            
            // Limpiar el resto de la UI
            this.cleanUI();
            
            return true;
        } catch (error) {
            console.error('Error al cerrar modal:', error);
            this.cleanUI();
            return false;
        }
    },
    
    // Limpiar la UI de cualquier modal o backdrop
    cleanUI: function() {
        console.log('Limpiando UI de modales');
        
        // Cerrar todos los modales
        document.querySelectorAll('.modal').forEach(modal => {
            try {
                modal.style.display = 'none';
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                modal.removeAttribute('aria-modal');
            } catch (e) {
                console.error('Error al cerrar modal:', e);
            }
        });
        
        // Remover backdrops
        document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
        
        // Restaurar comportamiento del body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
    },
    
    // Botón de emergencia para resetear la UI
    showEmergencyButton: function() {
        const btnId = 'modalEmergencyBtn';
        let btn = document.getElementById(btnId);
        
        if (!btn) {
            btn = document.createElement('button');
            btn.id = btnId;
            btn.className = 'btn btn-danger';
            btn.style = 'position: fixed; bottom: 10px; right: 10px; z-index: 9999;';
            btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Desbloquear UI';
            btn.onclick = () => this.cleanUI();
            document.body.appendChild(btn);
        }
        
        btn.style.display = 'block';
    },
    
    // Inicializar el sistema
    init: function() {
        // Detectar posibles bloqueos cada 5 segundos
        setInterval(() => {
            const hasBackdrop = document.querySelectorAll('.modal-backdrop').length > 0;
            const hasVisibleModal = document.querySelectorAll('.modal.show').length > 0;
            
            if (hasBackdrop && !hasVisibleModal) {
                console.warn('Bloqueo de UI detectado - Limpiando automáticamente');
                this.cleanUI();
            }
        }, 5000);
        
        // Configurar tecla de acceso rápido para mostrar botón de emergencia
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'r') {
                this.showEmergencyButton();
            }
        });
        
        console.log('Sistema de gestión de modales inicializado');
    }
};

// Inicializar el sistema cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => ModalManager.init());

// Hacer disponible globalmente
window.ModalManager = ModalManager;
