document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('form');

    // Création et ajout du message d'erreur
    const errorMessage = document.createElement('div');
    errorMessage.id = 'errorMessage';
    errorMessage.style.color = 'red';
    loginForm.appendChild(errorMessage);

    // Gestion de la soumission du formulaire
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêche le rechargement de la page

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5678/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            // Gère les différentes erreurs de réponse
            switch (response.status) {
                case 401:
                    throw new Error('Informations de connexion incorrectes');
                case 404:
                    throw new Error('Utilisateur non trouvé');
                default:
                    if (!response.ok) throw new Error('Erreur lors de la connexion');
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.token); // Stocke le token d'authentification

            window.location.href = 'index.html'; // Redirige vers la page d'accueil
        } catch (error) {
            errorMessage.textContent = error.message;
        }
    });
});