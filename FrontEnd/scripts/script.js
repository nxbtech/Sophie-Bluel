document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initDom();
    initModals();
    initProjects();
    checkEditMode();
});

function checkEditMode() {
    const isEditMode = localStorage.getItem('isEditMode');
    if (isEditMode === 'true') {
        const editModeBanner = document.getElementById('edit-mode-banner');
        if (editModeBanner) {
            editModeBanner.style.display = 'flex';
        }
    }
}