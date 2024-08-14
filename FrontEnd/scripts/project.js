document.addEventListener('DOMContentLoaded', () => {
    initProjects();
});

async function initProjects() {
    try {
        const categories = await fetchCategories();
        if (categories.length > 0) addCategoriesToList(categories);

        const projects = await fetchProjects();
        if (projects.length > 0) addProjectsToGallery(projects);
    } catch (error) {
        console.error('Erreur d\'initialisation:', error.message);
    }
}

async function fetchCategories() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Erreur dans la récupération des catégories');
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error.message);
        return [];
    }
}

function addCategoriesToList(categories) {
    const photoCategorySelect = document.getElementById('photoCategory');
    const categoriesContainer = document.getElementById('categories');
    const authToken = localStorage.getItem('authToken');

    if (photoCategorySelect) {
        photoCategorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            photoCategorySelect.appendChild(option);
        });
    }

    if (categoriesContainer && !authToken) { // Afficher les catégories uniquement si non connecté
        categoriesContainer.innerHTML = '';

        const allButton = document.createElement('button');
        allButton.textContent = 'Tous';
        allButton.classList.add('category-button');
        categoriesContainer.appendChild(allButton);

        allButton.addEventListener('click', async () => {
            try {
                const projects = await fetchProjects();
                clearGallery();
                addProjectsToGallery(projects);
                setActiveCategoryButton(allButton);
            } catch (error) {
                console.error('Erreur de récupération des projets:', error.message);
            }
        });

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
                    setActiveCategoryButton(categoryButton);
                } catch (error) {
                    console.error('Erreur de filtrage des projets:', error.message);
                }
            });
        });
    }
}

function setActiveCategoryButton(activeButton) {
    const buttons = document.querySelectorAll('.category-button');
    buttons.forEach(button => button.classList.remove('active'));
    activeButton.classList.add('active');
}

async function fetchProjects() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/works`);
        if (!response.ok) throw new Error('Erreur dans la récupération des projets');
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error.message);
        return [];
    }
}

function addProjectsToGallery(projects) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    projects.forEach(addProjectToGallery);
}

function clearGallery() {
    const gallery = document.getElementById('gallery');
    if (gallery) gallery.innerHTML = '';
}

function addProjectToGallery(project) {
    const gallery = document.getElementById('gallery');
    if (!gallery.querySelector(`figure[data-project-id="${project.id}"]`)) {
        const projectHTML = `
            <figure data-project-id="${project.id}">
                <img src="${project.imageUrl}" alt="${project.title}">
                <figcaption>${project.title}</figcaption>
            </figure>
        `;
        gallery.insertAdjacentHTML('beforeend', projectHTML);
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
    const gallery = document.querySelector(`#gallery figure[data-project-id="${projectId}"]`);
    const modalGalleryContent = document.querySelector(`#modal-gallery-content figure[data-project-id="${projectId}"]`);
    if (gallery) gallery.remove();
    if (modalGalleryContent) modalGalleryContent.remove();
}