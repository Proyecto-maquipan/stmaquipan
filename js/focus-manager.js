// js/focus-manager.js - Sistema para resolver problemas de foco y tabulación
const FocusManager = {
    lastFocusedElement: null,
    focusTrapped: false,

    // Detectar si el foco está atrapado (problemas de tabulación)
    detectFocusTrap: function() {
        // Si hay backdrop pero no hay modales visibles, es probable que el foco esté atrapado
        const hasBackdrop = document.querySelectorAll('.modal-backdrop').length > 0;
        const hasVisibleModal = document.querySelectorAll('.modal.show').length > 0;
        
        if (hasBackdrop && !hasVisibleModal) {
            console.warn("Detected focus trap: backdrop exists but no visible modal");
            return true;
        }
        
        // Si el body tiene clase modal-open pero no hay modales visibles
        const bodyHasModalOpen = document.body.classList.contains('modal-open');
        if (bodyHasModalOpen && !hasVisibleModal) {
            console.warn("Detected focus trap: body has modal-open class but no visible modal");
            return true;
        }
        
        // Si hay una capa invisible bloqueando la interacción
        const checkInvisibleBlockers = () => {
            const elements = document.elementsFromPoint(
                window.innerWidth / 2,
                window.innerHeight / 2
            );
            
            for (const el of elements) {
                // Buscar elementos sospechosos que puedan estar bloqueando
                if (el.classList.contains('modal') && getComputedStyle(el).display !== 'none') {
                    if (!el.classList.contains('show')) {
                        console.warn("Detected focus trap: hidden modal blocking interaction", el);
                        return true;
                    }
                }
            }
            return false;
        };
        
        try {
            if (typeof document.elementsFromPoint === 'function') {
                return checkInvisibleBlockers();
            }
        } catch (e) {
            console.error("Error checking for invisible blockers:", e);
        }
        
        return false;
    },
    
    // Guardar el elemento actualmente enfocado antes de abrir un modal
    saveFocus: function() {
        this.lastFocusedElement = document.activeElement;
        console.log("Saved focus on element:", this.lastFocusedElement);
    },
    
    // Restaurar el foco al elemento guardado
    restoreFocus: function() {
        if (this.lastFocusedElement && this.lastFocusedElement.focus) {
            try {
                console.log("Restoring focus to:", this.lastFocusedElement);
                this.lastFocusedElement.focus({preventScroll: true});
            } catch (e) {
                console.warn("Could not restore focus:", e);
            }
        } else {
            // Si no hay elemento guardado, enfocar en el body o un elemento seguro
            document.body.focus();
        }
    },
    
    // Limpiar completamente cualquier problema de foco
    resetUI: function() {
        console.log("Resetting UI focus state completely");
        
        // 1. Remover clases modal-related del body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // 2. Eliminar todos los backdrops
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        
        // 3. Restaurar todos los modales a estado no visible
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
        });
        
        // 4. Eliminar atributos aria que pueden afectar la navegación
        document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
            // Solo eliminar en elementos de primer nivel, no en modales
            if (!el.closest('.modal')) {
                el.removeAttribute('aria-hidden');
            }
        });
        
        // 5. Resetear el foco al elemento <body>
        document.body.tabIndex = -1;
        document.body.focus();
        
        // 6. Eliminar cualquier listener global que pudiera interferir
        const clearEventListeners = () => {
            const clonedBody = document.body.cloneNode(false);
            const parentNode = document.body.parentNode;
            parentNode.replaceChild(clonedBody, document.body);
            
            // Restaurar elementos hijos al nuevo body
            while (document.body.firstChild) {
                clonedBody.appendChild(document.body.firstChild);
            }
            
            // Asegurar que el body tiene los estilos correctos
            clonedBody.style.overflow = '';
            clonedBody.style.paddingRight = '';
            
            return clonedBody;
        };
        
        // Comentado por seguridad - usar solo si los problemas persisten
        // document.body = clearEventListeners();
        
        this.focusTrapped = false;
        
        return true;
    },
    
    // Mejorar el ModalManager existente
    enhanceModalManager: function() {
        if (!window.ModalManager) {
            console.error("ModalManager not found, cannot enhance");
            return false;
        }
        
        // Mejorar el método open para guardar el foco
        const originalOpen = ModalManager.open;
        ModalManager.open = function(modalId) {
            FocusManager.saveFocus();
            return originalOpen.call(this, modalId);
        };
        
        // Mejorar el método close para restaurar el foco
        const originalClose = ModalManager.close;
        ModalManager.close = function(modalId) {
            const result = originalClose.call(this, modalId);
            
            // Dar tiempo para que la animación de cierre termine
            setTimeout(() => {
                FocusManager.restoreFocus();
            }, 300);
            
            return result;
        };
        
        // Mejorar cleanUI para resetear también el foco
        const originalCleanUI = ModalManager.cleanUI;
        ModalManager.cleanUI = function() {
            const result = originalCleanUI.call(this);
            FocusManager.resetUI();
            return result;
        };
        
        console.log("Enhanced ModalManager with focus management");
        return true;
    },
    
    // Inicializar el sistema
    init: function() {
        console.log("Initializing FocusManager");
        
        // Mejorar ModalManager si está disponible
        if (window.ModalManager) {
            this.enhanceModalManager();
        } else {
            // Si no está disponible de inmediato, esperar un poco
            setTimeout(() => {
                if (window.ModalManager) {
                    this.enhanceModalManager();
                }
            }, 1000);
        }
        
        // Agregar un detector global de teclas para emergencias
        document.addEventListener('keydown', (e) => {
            // Ctrl+Alt+F para forzar reseteo del foco
            if (e.ctrlKey && e.altKey && e.key === 'f') {
                console.log("Emergency focus reset triggered by keyboard shortcut");
                this.resetUI();
                
                // Mostrar mensaje al usuario
                const msg = document.createElement('div');
                msg.style = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #4CAF50;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 4px;
                    z-index: 9999;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                `;
                msg.textContent = "Interfaz reiniciada correctamente";
                document.body.appendChild(msg);
                
                // Eliminar mensaje después de 3 segundos
                setTimeout(() => {
                    msg.remove();
                }, 3000);
            }
        });
        
        // Verificar periódicamente si hay problemas de foco
        setInterval(() => {
            if (this.detectFocusTrap()) {
                if (!this.focusTrapped) {
                    console.warn("Focus trap detected - resetting UI");
                    this.resetUI();
                    this.focusTrapped = true;
                }
            } else {
                this.focusTrapped = false;
            }
        }, 2000);
        
        return this;
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.FocusManager = FocusManager.init();
    console.log("FocusManager initialized and available globally");
});
