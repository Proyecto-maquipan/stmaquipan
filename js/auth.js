// Sistema de autenticación
const auth = {
    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return localStorage.getItem('maquipan_user') !== null;
    },
    
    // Obtener usuario actual
    getCurrentUser() {
        const userStr = localStorage.getItem('maquipan_user');
        return userStr ? JSON.parse(userStr) : null;
    },
    
    // Login - Modificado para ser async
    async login(username, password) {
        console.log('Intentando login con:', username);
        
        // Verificar si storage está disponible
        if (typeof storage === 'undefined') {
            console.error('Storage no está definido');
            alert('Error: El sistema de almacenamiento no está disponible');
            return false;
        }
        
        try {
            // Cambio clave: Esperar a que se resuelva la promesa
            const usuarios = await storage.getUsuarios();
            console.log('Usuarios encontrados:', usuarios);
            
            const usuario = usuarios.find(u => u.username === username && u.password === password);
            
            if (usuario) {
                localStorage.setItem('maquipan_user', JSON.stringify(usuario));
                console.log('Login exitoso para:', usuario.nombre);
                return true;
            } else {
                console.log('Usuario o contraseña incorrectos');
                return false;
            }
        } catch (error) {
            console.error('Error en login:', error);
            return false;
        }
    },
    
    // Logout
    logout() {
        localStorage.removeItem('maquipan_user');
        if (typeof router !== 'undefined') {
            router.navigate('login');
        } else {
            window.location.reload();
        }
    },
    
    // Actualizar información de usuario en la UI
    updateUserInfo() {
        const user = this.getCurrentUser();
        const userInfo = document.getElementById('userInfo');
        if (userInfo && user) {
            userInfo.textContent = user.nombre;
        }
    }
};

// Hacer auth disponible globalmente
window.auth = auth;

// Verificar que auth está disponible
console.log('Auth inicializado:', window.auth ? 'OK' : 'ERROR');
