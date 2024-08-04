document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken');
    const authAction = document.getElementById('authAction');
    const modifyButton = document.getElementById('openModal');
    const galleryModal = document.getElementById('modal');
    const addPhotoModal = document.getElementById('addPhotoModal');
    const galleryCloseButton = galleryModal.querySelector('.close');
    const addPhotoCloseButton = addPhotoModal.querySelector('.close');
    const addPhotoForm = document.getElementById('addPhotoForm');
    const categoriesContainer = document.getElementById('categories');

    // Affiche "login" ou "logout" en fonction de l'état de connexion de l'utilisateur
    // et gère la visibilité du bouton "Modifier" et des catégories
    if (authToken) {
        authAction.innerHTML = '<a href="#" id="logout">logout</a>';
        document.getElementById('logout').addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
        if (modifyButton) modifyButton.style.display = 'block';
        if (categoriesContainer) categoriesContainer.style.display = 'none';
    } else {
        authAction.innerHTML = '<a href="login.html">login</a>';
        if (modifyButton) modifyButton.style.display = 'none';
        if (categoriesContainer) categoriesContainer.style.display = 'block';
    }

    // Initialiser la page en chargeant les catégories et les projets
    init();

    // Gérer l'ouverture et la fermeture des modales
    if (modifyButton) {
        modifyButton.addEventListener('click', async () => {
            galleryModal.style.display = 'block';
            await loadProjectsInModal();
        });
    }

    if (document.getElementById('addPhoto')) {
        document.getElementById('addPhoto').addEventListener('click', () => {
            galleryModal.style.display = 'none';
            addPhotoModal.style.display = 'block';
        });
    }

    if (galleryCloseButton) {
        galleryCloseButton.addEventListener('click', () => {
            galleryModal.style.display = 'none';
        });
    }

    if (addPhotoCloseButton) {
        addPhotoCloseButton.addEventListener('click', () => {
            addPhotoModal.style.display = 'none';
        });
    }

    window.addEventListener('click', event => {
        if (event.target === galleryModal) {
            galleryModal.style.display = 'none';
        } else if (event.target === addPhotoModal) {
            addPhotoModal.style.display = 'none';
        }
    });

    // Gestion de la soumission du formulaire d'ajout de photo
    if (addPhotoForm) {
        addPhotoForm.addEventListener('submit', async event => {
            event.preventDefault();

            const photoTitle = document.getElementById('photoTitle').value;
            const photoCategory = document.getElementById('photoCategory').value;
            const photoFile = document.getElementById('photoFile').files[0];

            if (!photoFile) {
                alert('Veuillez choisir un fichier photo.');
                return;
            }

            const formData = new FormData();
            formData.append('title', photoTitle);
            formData.append('category', photoCategory);
            formData.append('image', photoFile);

            try {
                const response = await fetch('http://localhost:5678/api/works', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: formData
                });

                if (!response.ok) throw new Error(await response.text());

                const newProject = await response.json();
                addProjectToGallery(newProject);
                addPhotoModal.style.display = 'none';
                galleryModal.style.display = 'block';
                addPhotoForm.reset();
            } catch (error) {
                console.error('Erreur:', error.message);
            }
        });
    }
});

// Fonction d'initialisation : charge les catégories et les projets
async function init() {
    try {
        const categories = await fetchCategories();
        if (categories.length > 0) addCategoriesToList(categories);

        const projects = await fetchProjects();
        if (projects.length > 0) addProjectsToGallery(projects);
    } catch (error) {
        console.error('Erreur d\'initialisation:', error.message);
    }
}

// Fonction pour récupérer les catégories depuis l'API
async function fetchCategories() {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        if (!response.ok) throw new Error('Erreur dans la récupération des catégories');
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error.message);
        return [];
    }
}

// Fonction pour ajouter les catégories au formulaire de sélection et à la liste de filtres
function addCategoriesToList(categories) {
    const photoCategorySelect = document.getElementById('photoCategory');
    const categoriesContainer = document.getElementById('categories');

    if (photoCategorySelect) {
        photoCategorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            photoCategorySelect.appendChild(option);
        });
    }

    if (categoriesContainer) {
        categoriesContainer.innerHTML = '';
        categories.forEach(category => {
            const categoryButton = document.createElement('button');
            categoryButton.textContent = category.name;
            categoryButton.classList.add('category-button');
            categoriesContainer.appendChild(categoryButton);

            categoryButton.addEventListener('click', async () => {
                try {
                    const projects = await fetchProjects();
                    const filteredProjects = projects.filter(project => project.categoryId === category.id);
                    clearGallery();
                    addProjectsToGallery(filteredProjects);
                } catch (error) {
                    console.error('Erreur de filtrage des projets:', error.message);
                }
            });
        });

        const allButton = document.createElement('button');
        allButton.textContent = 'Tous';
        allButton.classList.add('category-button');
        categoriesContainer.appendChild(allButton);

        allButton.addEventListener('click', async () => {
            try {
                const projects = await fetchProjects();
                clearGallery();
                addProjectsToGallery(projects);
            } catch (error) {
                console.error('Erreur de récupération des projets:', error.message);
            }
        });
    }
}

// Fonction pour récupérer les projets depuis l'API
async function fetchProjects() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        if (!response.ok) throw new Error('Erreur dans la récupération des projets');
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error.message);
        return [];
    }
}

// Fonction pour ajouter les projets à la galerie en utilisant insertAdjacentHTML
function addProjectsToGallery(projects) {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    gallery.innerHTML = '';
    projects.forEach(project => {
        const projectHTML = `
            <figure>
                <img src="${project.imageUrl}" alt="${project.title}">
                <figcaption>${project.title}</figcaption>
            </figure>
        `;
        gallery.insertAdjacentHTML('beforeend', projectHTML);
    });
}

// Fonction pour effacer le contenu de la galerie
function clearGallery() {
    const gallery = document.getElementById('gallery');
    if (gallery) gallery.innerHTML = '';
}

// Fonction pour ajouter un projet spécifique à la galerie
function addProjectToGallery(project) {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    const projectHTML = `
        <figure>
            <img src="${project.imageUrl}" alt="${project.title}">
            <figcaption>${project.title}</figcaption>
        </figure>
    `;
    gallery.insertAdjacentHTML('beforeend', projectHTML);
}

// Fonction pour ajouter un projet spécifique à la modale
function addProjectToModal(project) {
    const modalGalleryContent = document.getElementById('modal-gallery-content');
    if (!modalGalleryContent) return;

    const projectHTML = `
        <figure>
            <img src="${project.imageUrl}" alt="${project.title}">
            <button class="delete-button" data-project-id="${project.id}">
                <img src="./assets/icons/trash-icon.png" alt="Supprimer">
            </button>
        </figure>
    `;
    modalGalleryContent.insertAdjacentHTML('beforeend', projectHTML);

    // Ajout de l'événement pour le bouton de suppression
    const deleteButton = modalGalleryContent.querySelector(`button[data-project-id="${project.id}"]`);
    deleteButton.addEventListener('click', async () => {
        try {
            const response = await fetch(`http://localhost:5678/api/works/${project.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) throw new Error('Erreur lors de la suppression du projet');

            deleteButton.parentElement.remove();
        } catch (error) {
            console.error('Erreur:', error.message);
        }
    });
}

// Fonction pour charger les projets dans la modale
async function loadProjectsInModal() {
    const modalGalleryContent = document.getElementById('modal-gallery-content');
    if (!modalGalleryContent) return;
    modalGalleryContent.innerHTML = '';
    try {
    const projects = await fetchProjects();
    projects.forEach(project => addProjectToModal(project));
    } catch (error) {
    console.error('Erreur de chargement des projets dans la modale:', error.message);
    }
    }

document.addEventListener('DOMContentLoaded', () => {
    const photoFileInput = document.getElementById('photoFile');
    const uploadPreview = document.getElementById('uploadPreview');
    const uploadInfo = document.querySelector('.upload-info');

    photoFileInput.addEventListener('change', () => {
        const file = photoFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadPreview.src = e.target.result;
                uploadPreview.style.display = 'block';
                uploadInfo.style.display = 'none'; // Cache l'info d'upload
            };
            reader.readAsDataURL(file);
        }
    });
});