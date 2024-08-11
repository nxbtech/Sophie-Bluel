document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    const authToken = localStorage.getItem('authToken');
    toggleEditModeButton(authToken);
});

function initAuth() {
    const authToken = localStorage.getItem('authToken');
    updateAuthAction(authToken);
    toggleEditModeBanner(authToken);
}

function updateAuthAction(authToken) {
    const authAction = document.getElementById('authAction');
    if (!authAction) return;
    if (authToken) {
        authAction.innerHTML = '<a href="#" id="logout">Logout</a>';
        document.getElementById('logout').addEventListener('click', logout);
    } else {
        authAction.innerHTML = '<a href="login.html">Login</a>';
    }
}

function logout(event) {
    event.preventDefault();
    localStorage.removeItem('authToken');
    localStorage.removeItem('isEditMode');
    window.location.href = 'index.html';
}

function toggleEditModeBanner(authToken) {
    const editModeBanner = document.getElementById('edit-mode-banner');
    if (editModeBanner) {
        editModeBanner.style.display = authToken ? 'flex' : 'none';
    }
}

function toggleEditModeButton(authToken) {
    const editButton = document.getElementById('openModal');
    if (editButton) {
        editButton.style.display = authToken ? 'block' : 'none';
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Non autorisé : vérifiez vos informations d\'identification.');
            } else if (response.status === 404) {
                alert('Utilisateur non trouvé.');
            } else {
                alert('Une erreur est survenue. Veuillez réessayer.');
            }
            return;
        }

        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('isEditMode', 'true');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erreur:', error.message);
        alert('Erreur de connexion : ' + error.message);
    }
}