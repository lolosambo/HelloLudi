// Version simplifiée et robuste du gestionnaire de galerie

document.addEventListener('DOMContentLoaded', function() {
    initGalleryHandlers();
});

function initGalleryHandlers() {
    const categorySelect = document.getElementById('post_category');
    const galleryWrapper = document.querySelector('.gallery-images-wrapper');
    
    // Gestion de l'affichage conditionnel selon la catégorie
    if (categorySelect && galleryWrapper) {
        function toggleGalleryFields() {
            const selectedCategory = categorySelect.value;
            galleryWrapper.style.display = selectedCategory === 'photo' ? 'block' : 'none';
        }
        
        toggleGalleryFields();
        categorySelect.addEventListener('change', toggleGalleryFields);
    }
    
    // Configuration de la zone d'upload
    setupDragAndDrop();
    setupFilePreview();
    setupExistingImagesDeletion();
}

function setupDragAndDrop() {
    const uploadWrapper = document.querySelector('.gallery-upload-wrapper');
    const fileInput = document.querySelector('.gallery-file-input');
    
    if (!uploadWrapper || !fileInput) return;
    
    let dragCounter = 0;
    
    // Empêcher le comportement par défaut du navigateur
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.addEventListener(eventName, preventDefaults, false);
        uploadWrapper.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Gestion du survol
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadWrapper.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadWrapper.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        uploadWrapper.classList.add('dragover');
    }
    
    function unhighlight() {
        uploadWrapper.classList.remove('dragover');
    }
    
    // Gestion du drop
    uploadWrapper.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            // Valider les fichiers avant de les traiter
            if (!validateFiles(imageFiles)) {
                return;
            }
            
            updateFileInput(imageFiles, fileInput);
            showPreview(imageFiles);
        }
    }
    
    // Clic pour ouvrir le sélecteur
    uploadWrapper.addEventListener('click', function(e) {
        if (e.target === this || e.target.closest('.gallery-upload-button')) {
            fileInput.click();
        }
    });
}

function setupFilePreview() {
    const fileInput = document.querySelector('.gallery-file-input');
    if (!fileInput) return;
    
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        // Valider le nombre et la taille des fichiers
        if (!validateFiles(files)) {
            this.value = ''; // Vider la sélection si invalide
            document.getElementById('galleryPreview').innerHTML = '';
            return;
        }
        
        showPreview(files);
    });
}

function validateFiles(files) {
    const maxFiles = 50;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (files.length > maxFiles) {
        alert(`Vous ne pouvez sélectionner que ${maxFiles} images maximum.`);
        return false;
    }
    
    for (let file of files) {
        if (!allowedTypes.includes(file.type)) {
            alert(`Le fichier "${file.name}" n'est pas un type d'image supporté.`);
            return false;
        }
        
        if (file.size > maxSize) {
            alert(`Le fichier "${file.name}" est trop volumineux (max 5MB).`);
            return false;
        }
    }
    
    return true;
}

function showPreview(files) {
    const previewContainer = document.getElementById('galleryPreview');
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const previewItem = createPreviewItem(file, index);
            previewContainer.appendChild(previewItem);
        }
    });
}

function createPreviewItem(file, index) {
    const item = document.createElement('div');
    item.className = 'gallery-preview-item';
    
    const img = document.createElement('img');
    img.className = 'gallery-preview-image';
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'gallery-preview-remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.title = 'Supprimer';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    removeBtn.addEventListener('click', function() {
        removeFileFromInput(index);
        item.remove();
    });
    
    item.appendChild(img);
    item.appendChild(removeBtn);
    
    return item;
}

function removeFileFromInput(indexToRemove) {
    const fileInput = document.querySelector('.gallery-file-input');
    if (!fileInput) return;
    
    try {
        const dt = new DataTransfer();
        const files = Array.from(fileInput.files);
        
        files.forEach((file, index) => {
            if (index !== indexToRemove) {
                dt.items.add(file);
            }
        });
        
        fileInput.files = dt.files;
    } catch (error) {
        console.warn('Impossible de modifier la sélection de fichiers:', error);
        // Fallback: vider complètement la sélection
        fileInput.value = '';
        document.getElementById('galleryPreview').innerHTML = '';
    }
}

function updateFileInput(files, input) {
    try {
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        input.files = dt.files;
    } catch (error) {
        console.warn('Impossible de mettre à jour les fichiers:', error);
    }
}

function setupExistingImagesDeletion() {
    const deleteButtons = document.querySelectorAll('.delete-gallery-image');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Supprimer cette image ?')) {
                const imageId = this.dataset.imageId;
                const postId = this.dataset.postId;
                const galleryItem = this.closest('.gallery-item');
                
                deleteExistingImage(postId, imageId, galleryItem);
            }
        });
    });
}

function deleteExistingImage(postId, imageId, element) {
    fetch(`/post/${postId}/gallery-image/${imageId}/delete`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            element.style.transition = 'all 0.3s ease';
            element.style.transform = 'scale(0)';
            element.style.opacity = '0';
            
            setTimeout(() => element.remove(), 300);
            showNotification('Image supprimée', 'success');
        } else {
            showNotification('Erreur lors de la suppression', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Erreur de connexion', 'error');
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'}`;
    notification.innerHTML = `<i class="bi bi-${type === 'success' ? 'check' : 'x'}-circle me-2"></i>${message}`;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        min-width: 300px; border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
