// modal-manager.js - Utilidad auxiliar para casos donde Bootstrap falle

// Objeto global para limpiar la UI bloqueada
window.ModalManager = {
    // Limpiar UI bloqueada (modales, backdrops, etc.)
    cleanUI: function() {
        try {
            console.log('ModalManager: Limpiando UI bloqueada');
            
            // Remover backdrops
            document.querySelectorAll('.modal-backdrop').forEach(e => e.remove());
            
            // Restablecer estados del body
            document.body.classList.remove('modal-open');
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
            
            return true;
        } catch (error) {
            console.error('Error al limpiar UI:', error);
            return false;
        }
    },
    
    // Estas funciones son solo para compatibilidad con código antiguo
    // Internamente usan Bootstrap
    open: function(modalId) {
        try {
            console.log('ModalManager: Abriendo modal usando Bootstrap', modalId);
            const modalElement = document.getElementById(modalId);
            
            if (!modalElement) {
                console.error(`Modal ${modalId} no encontrado`);
                return null;
            }
            
            // Limpiar UI bloqueada primero
            this.cleanUI();
            
            // Usar Bootstrap directamente
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            return modal;
        } catch (error) {
            console.error('Error al abrir modal:', error);
            return null;
        }
    },
    
    close: function(modalId) {
        try {
            console.log('ModalManager: Cerrando modal usando Bootstrap', modalId);
            const modalElement = document.getElementById(modalId);
            
            if (!modalElement) {
                console.error(`Modal ${modalId} no encontrado`);
                return false;
            }
            
            try {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                } else {
                    // Si no hay instancia, cerrar manualmente
                    this.cleanUI();
                }
            } catch (err) {
                console.error('Error al cerrar modal con Bootstrap:', err);
                // Fallback manual si Bootstrap falla
                this.cleanUI();
            }
            
            return true;
        } catch (error) {
            console.error('Error al cerrar modal:', error);
            this.cleanUI();
            return false;
        }
    }
};

// Detector de modales bloqueados
(function() {
    function detectarModalesBloqueados() {
        const modalBackdrops = document.querySelectorAll('.modal-backdrop');
        const modalesActivos = document.querySelectorAll('.modal.show');
        
        // Si hay backdrops pero no hay modales activos, limpiar
        if (modalBackdrops.length > 0 && modalesActivos.size === 0) {
            console.warn('UI bloqueada detectada - limpiando automáticamente');
            ModalManager.cleanUI();
        }
    }
    
    // Verificar cada 5 segundos
    setInterval(detectarModalesBloqueados, 5000);
    
    console.log('Detector de modales bloqueados inicializado');
})();

console.log('ModalManager simplificado inicializado');
