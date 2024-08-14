document.addEventListener('DOMContentLoaded', () => {
    initModals();
});

function initModals() {
    const modifyButton = document.getElementById('openModal');
    const galleryModal = document.getElementById('modal');
    const addPhotoModal = document.getElementById('addPhotoModal');
    const galleryCloseButton = galleryModal ? galleryModal.querySelector('.close') : null;
    const addPhotoCloseButton = addPhotoModal ? addPhotoModal.querySelector('.close') : null;
    const addPhotoForm = document.getElementById('addPhotoForm');

    if (modifyButton && !modifyButton.hasAttribute('data-listener-added')) {
        modifyButton.addEventListener('click', async () => {
            galleryModal.style.display = 'block';
            await loadProjectsInModal();
        });
        modifyButton.setAttribute('data-listener-added', 'true');
    }

    const addPhotoButton = document.getElementById('addPhoto');
    if (addPhotoButton && !addPhotoButton.hasAttribute('data-listener-added')) {
        addPhotoButton.addEventListener('click', () => {
            galleryModal.style.display = 'none';
            addPhotoModal.style.display = 'block';
        });
        addPhotoButton.setAttribute('data-listener-added', 'true');
    }

    if (galleryCloseButton && !galleryCloseButton.hasAttribute('data-listener-added')) {
        galleryCloseButton.addEventListener('click', () => {
            galleryModal.style.display = 'none';
        });
        galleryCloseButton.setAttribute('data-listener-added', 'true');
    }

    if (addPhotoCloseButton && !addPhotoCloseButton.hasAttribute('data-listener-added')) {
        addPhotoCloseButton.addEventListener('click', () => {
            addPhotoModal.style.display = 'none';
        });
        addPhotoCloseButton.setAttribute('data-listener-added', 'true');
    }

    window.addEventListener('click', event => {
        if (event.target === galleryModal) {
            galleryModal.style.display = 'none';
        } else if (event.target === addPhotoModal) {
            addPhotoModal.style.display = 'none';
        }
    });

    if (addPhotoForm && !addPhotoForm.hasAttribute('data-listener-added')) {
        addPhotoForm.addEventListener('submit', async event => {
            event.preventDefault();

            const photoTitle = document.getElementById('photoTitle').value;
            const photoCategory = document.getElementById('photoCategory').value;
            const photoFile = document.getElementById('photoFile').files[0];

            if (!photoFile) {
                alert('Veuillez choisir un fichier photo.');
                return;
            }

            if (photoFile.size > 4 * 1024 * 1024) { // 4 Mo
                alert('Le fichier doit être inférieur à 4 Mo.');
                return;
            }

            const formData = new FormData();
            formData.append('title', photoTitle);
            formData.append('category', photoCategory);
            formData.append('image', photoFile);

            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/works`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: formData
                });

                if (!response.ok) throw new Error(await response.text());

                const newProject = await response.json();
                addProjectToGallery(newProject); // Ajoute le projet à la galerie
                addProjectToModal(newProject); // Ajoute le projet à la modale
                addPhotoForm.reset(); // Réinitialise le formulaire
            } catch (error) {
                console.error('Erreur:', error.message);
            }
        });

        const inputs = addPhotoForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', checkFormCompletion);
        });
        addPhotoForm.setAttribute('data-listener-added', 'true');
    }
}

async function loadProjectsInModal() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/works`);
        if (!response.ok) throw new Error('Erreur dans la récupération des projets');

        const projects = await response.json();
        addProjectsToModal(projects);
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

function addProjectsToModal(projects) {
    const modalGalleryContent = document.getElementById('modal-gallery-content');
    modalGalleryContent.innerHTML = '';

    projects.forEach(project => {
        addProjectToModal(project);
    });
}

function addProjectToModal(project) {
    const modalGalleryContent = document.getElementById('modal-gallery-content');
    if (!modalGalleryContent.querySelector(`figure[data-project-id="${project.id}"]`)) {
        const projectHTML = `
            <figure data-project-id="${project.id}">
                <img src="${project.imageUrl}" alt="${project.title}">
                <figcaption>${project.title}</figcaption>
                <button class="delete-button" data-project-id="${project.id}">
                    <img src="./assets/icons/trash-icon.png" alt="Supprimer">
                </button>
            </figure>
        `;
        modalGalleryContent.insertAdjacentHTML('beforeend', projectHTML);

        const deleteButton = modalGalleryContent.querySelector(`button[data-project-id="${project.id}"]`);
        deleteButton.addEventListener('click', () => handleDeleteProject(project.id));
    }
}

function checkFormCompletion() {
    const photoTitle = document.getElementById('photoTitle').value;
    const photoCategory = document.getElementById('photoCategory').value;
    const photoFile = document.getElementById('photoFile').files[0];
    const submitButton = document.querySelector('#addPhotoForm .submit-button');

    if (photoTitle && photoCategory && photoFile) {
        submitButton.style.backgroundColor = 'green';
    } else {
        submitButton.style.backgroundColor = '';
    }
}

async function handleDeleteProject(projectId) {
    const authToken = localStorage.getItem('authToken');
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/works/${projectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Erreur lors de la suppression du projet');

        removeProjectFromDOM(projectId);
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

function removeProjectFromDOM(projectId) {
    const modalGalleryContent = document.querySelector(`#modal-gallery-content figure[data-project-id="${projectId}"]`);
    if (modalGalleryContent) modalGalleryContent.remove();
    const gallery = document.querySelector(`#gallery figure[data-project-id="${projectId}"]`);
    if (gallery) gallery.remove();
}

function hideTitlesInModal() {
    const modalGallery = document.querySelector('.modal .gallery');
    const titles = modalGallery.querySelectorAll('figcaption');
    titles.forEach(title => {
        title.style.display = 'none';
    });
}

// Appeler cette fonction lorsque le modal est ouvert
document.getElementById('openModal').addEventListener('click', () => {
    hideTitlesInModal();
});