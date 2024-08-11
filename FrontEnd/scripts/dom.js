// dom.js
function initDom() {
    const photoFileInput = document.getElementById('photoFile');
    const uploadPreview = document.getElementById('uploadPreview');
    const uploadInfo = document.querySelector('.upload-info');

    if (photoFileInput && !photoFileInput.hasAttribute('data-listener-added')) {
        photoFileInput.addEventListener('change', () => {
            const file = photoFileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadPreview.src = e.target.result;
                    uploadPreview.style.display = 'block';
                    uploadInfo.style.display = 'none';
                    checkFormCompletion();
                };
                reader.readAsDataURL(file);
            }
        });
        photoFileInput.setAttribute('data-listener-added', 'true');
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

document.addEventListener('DOMContentLoaded', () => {
    initDom();
});