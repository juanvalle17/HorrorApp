// Utilidades para manejo de usuario
class UserManager {
    static getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    static isLoggedIn() {
        const user = this.getCurrentUser();
        return user && user.id;
    }

    static logout() {
        localStorage.removeItem('currentUser');
        window.location.href = './login.html';
    }

    static requireAuth() {
        if (!this.isLoggedIn()) {
            console.error('❌ No hay usuario logueado. Redirigiendo al login...');
            window.location.href = './login.html';
            return false;
        }
        return true;
    }

    static updateUserInfo(userData) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            return updatedUser;
        }
        return null;
    }

    static getUserAvatar() {
        const user = this.getCurrentUser();
        return user && user.avatar ? user.avatar : '../Assets/Imagenes/M.jpg';
    }

    static getUserName() {
        const user = this.getCurrentUser();
        return user && user.username ? user.username : 'Usuario Anónimo';
    }

    static getUserDescription() {
        const user = this.getCurrentUser();
        return user && user.description ? user.description : 'Amante del terror y lo sobrenatural';
    }
}

// Exportar para uso global
window.UserManager = UserManager;

// Devuelve la URL correcta del avatar de usuario
function getAvatarUrl(user, defaultUsername = 'U') {
    if (!user) return `https://via.placeholder.com/40x40/4B5563/FFFFFF?text=${defaultUsername.charAt(0).toUpperCase()}`;
    const avatar = user.avatar_url || user.avatar;
    if (!avatar) {
        return `https://via.placeholder.com/40x40/4B5563/FFFFFF?text=${(user.username || defaultUsername).charAt(0).toUpperCase()}`;
    }
    if (avatar.startsWith('http') || avatar.startsWith('data:image')) {
        return avatar;
    }
    const backendBaseUrl = '../../backend';
    const imagePath = avatar.startsWith('uploads/') ? avatar : `uploads/${avatar}`;
    return `${backendBaseUrl}/${imagePath}`;
}

window.getAvatarUrl = getAvatarUrl; 