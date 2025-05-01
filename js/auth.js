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
    
    // Login
    login(username, password) {
        const usuarios = storage.getUsuarios();
        const usuario = usuarios.find(u => u.username === username && u.password === password);
        
        if (usuario) {
            localStorage.setItem('maquipan_user', JSON.stringify(usuario));
            return true;
        }
        return false;
    },
    
    // Logout
    logout() {
        localStorage.removeItem('maquipan_user');
        router.navigate('login');
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
