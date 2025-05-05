// js/modal-manager.js - Sistema mejorado de gestión de modales
const ModalManager = {
    activeModals: new Set(),
    isProcessing: false,
    
    // Abrir un modal con seguridad
    open: function(modalId) {
        if (this.isProcessing) {
            console.warn('Operación de modal en progreso, espera un momento...');
            return false;
        }
        
        this.isProcessing = true;
        console.log('Abriendo modal:', modalId);
        
        try {
            // Obtener el elemento del modal
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.error(`Modal ${modalId} no encontrado`);
                this.isProcessing = false;
                return false;
            }
            
            // Intentar usar Bootstrap si está disponible
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                try {
                    const existingInstance = bootstrap.Modal.getInstance(modalElement);
                    if (existingInstance) {
                        existingInstance.show();
                    } else {
                        const modal = new bootstrap.Modal(modalElement, {
                            backdrop: 'static',
                            keyboard: true
                        });
                        modal.show();
                    }
                    this.activeModals.add(modalId);
                    this.isProcessing = false;
                    return true;
                } catch (bootstrapError) {
                    console.warn('Error usando Bootstrap Modal, usando método alternativo:', bootstrapError);
                    // Continuar con método alternativo si Bootstrap falla
                }
            }
            
            // Método alternativo si Bootstrap no está disponible o falla
            // Limpiar cualquier backdrop que pueda estar presente
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            
            // Añadir backdrop manualmente
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
            
            // Añadir listeners para botones de cierre
            modalElement.querySelectorAll('[data-bs-dismiss="modal"]').forEach(button => {
                // Remover listeners previos para evitar duplicados
                button.removeEventListener('click', this._createCloseHandler(modalId));
                button.addEventListener('click', this._createCloseHandler(modalId));
            });
            
            // Añadir listener para tecla ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.close(modalId);
                }
            }, { once: true });
            
            this.activeModals.add(modalId);
            return true;
        } catch (error) {
            console.error('Error abriendo modal:', error);
            this.cleanUI(); // Limpieza de emergencia
            return false;
        } finally {
            this.isProcessing = false;
        }
    },
    
    // Cerrar un modal con seguridad
    close: function(modalId) {
        if (this.isProcessing) {
            console.warn('Operación de modal en progreso, espera un momento...');
            return false;
        }
        
        this.isProcessing = true;
        console.log('Cerrando modal:', modalId);
        
        try {
            // Obtener el elemento del modal
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.error(`Modal ${modalId} no encontrado`);
                this.isProcessing = false;
                return false;
            }
            
            // Intentar usar Bootstrap si está disponible
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                try {
                    const existingInstance = bootstrap.Modal.getInstance(modalElement);
                    if (existingInstance) {
                        existingInstance.hide();
                        this.activeModals.delete(modalId);
                        this.isProcessing = false;
                        return true;
                    }
                    // Si no hay instancia, continuar con método alternativo
                } catch (bootstrapError) {
                    console.warn('Error usando Bootstrap Modal para cerrar, usando método alternativo:', bootstrapError);
                    // Continuar con método alternativo
                }
            }
            
            // Método alternativo
            modalElement.style.display = 'none';
            modalElement.classList.remove('show');
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.removeAttribute('aria-modal');
            
            this.activeModals.delete(modalId);
            
            // Si no hay más modales activos, limpiar backdrops y restaurar body
            if (this.activeModals.size === 0) {
                document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
            }
            
            return true;
        } catch (error) {
            console.error('Error cerrando modal:', error);
            this.cleanUI(); // Limpieza de emergencia
            return false;
        } finally {
            this.isProcessing = false;
        }
    },
    
    // Limpiar por completo la UI de modales
    cleanUI: function() {
        console.log('Limpieza de emergencia de la UI de modales');
        
        try {
            // Intentar cerrar modales usando Bootstrap primero
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                document.querySelectorAll('.modal.show').forEach(modalElement => {
                    try {
                        const instance = bootstrap.Modal.getInstance(modalElement);
                        if (instance) {
                            instance.hide();
                        }
                    } catch (e) {
                        console.warn('Error cerrando modal con Bootstrap:', e);
                    }
                });
            }
            
            // Limpiar manualmente de todas formas
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
                modal.removeAttribute('aria-modal');
            });
            
            // Eliminar backdrops
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            
            // Restaurar body
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            
            // Limpiar registro de modales activos
            this.activeModals.clear();
            
            console.log('UI de modales limpiada exitosamente');
            return true;
        } catch (error) {
            console.error('Error en limpieza de emergencia:', error);
            return false;
        }
    },
    
    // Crear manejador para botones de cierre
    _createCloseHandler: function(modalId) {
        return () => this.close(modalId);
    },
    
    // Mostrar botón de emergencia para recuperación de UI
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
    
    // Inicializar el sistema y configurar monitoreo
    init: function() {
        console.log('Inicializando sistema mejorado de gestión de modales');
        
        // Monitoreo automático cada 3 segundos para detectar problemas
        setInterval(() => {
            const hasBackdrop = document.querySelectorAll('.modal-backdrop').length > 0;
            const hasVisibleModal = document.querySelectorAll('.modal.show').length > 0;
            
            // Detectar inconsistencia: backdrop sin modal visible
            if (hasBackdrop && !hasVisibleModal) {
                console.warn('⚠️ Inconsistencia detectada: backdrop sin modal visible');
                this.cleanUI();
            }
            
            // Verificar coherencia entre activeModals y modales realmente mostrados
            const visibleModalIds = Array.from(document.querySelectorAll('.modal.show')).map(el => el.id);
            if (visibleModalIds.length !== this.activeModals.size) {
                console.warn('⚠️ Inconsistencia en seguimiento de modales activos');
                
                // Actualizar el registro de modales activos
                this.activeModals.clear();
                visibleModalIds.forEach(id => {
                    if (id) this.activeModals.add(id);
                });
            }
        }, 3000);
        
        // Configurar tecla de acceso rápido para mostrar botón de emergencia (Ctrl+Alt+R)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.key === 'r') {
                this.showEmergencyButton();
            }
        });
        
        // Sobreescribir métodos nativos de Bootstrap si está disponible
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const originalShow = bootstrap.Modal.prototype.show;
            const originalHide = bootstrap.Modal.prototype.hide;
            
            // Sobreescribir método show
            bootstrap.Modal.prototype.show = function() {
                try {
                    const result = originalShow.apply(this, arguments);
                    const modalId = this._element.id;
                    if (modalId) ModalManager.activeModals.add(modalId);
                    return result;
                } catch (error) {
                    console.error('Error en Bootstrap Modal.show:', error);
                    ModalManager.cleanUI(); // Limpieza de emergencia
                    throw error;
                }
            };
            
            // Sobreescribir método hide
            bootstrap.Modal.prototype.hide = function() {
                try {
                    const result = originalHide.apply(this, arguments);
                    const modalId = this._element.id;
                    if (modalId) ModalManager.activeModals.delete(modalId);
                    return result;
                } catch (error) {
                    console.error('Error en Bootstrap Modal.hide:', error);
                    ModalManager.cleanUI(); // Limpieza de emergencia
                    throw error;
                }
            };
        }
        
        return this;
    }
};

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.ModalManager = ModalManager.init();
    console.log('Sistema de gestión de modales inicializado y disponible globalmente');
});
