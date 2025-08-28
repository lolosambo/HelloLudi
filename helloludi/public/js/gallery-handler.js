// JavaScript pour la gestion de la galerie d'images

document.addEventListener('DOMContentLoaded', function() {
    // Gestion de l'affichage conditionnel des champs selon la catégorie
    const categorySelect = document.getElementById('post_category');
    const galleryWrapper = document.querySelector('.gallery-images-wrapper');
    
    if (categorySelect && galleryWrapper) {
        function toggleGalleryFields() {
            const selectedCategory = categorySelect.value;
            
            if (selectedCategory === 'photo') {
                galleryWrapper.style.display = 'block';
                galleryWrapper.classList.add('fade-in');
            } else {
                galleryWrapper.style.display = 'none';
                galleryWrapper.classList.remove('fade-in');
            }
        }
        
        // Initialiser l'état au chargement
        toggleGalleryFields();
        
        // Écouter les changements de catégorie
        categorySelect.addEventListener('change', toggleGalleryFields);
    }
    
    // Gestion de la prévisualisation des images sélectionnées
    const galleryInput = document.querySelector('.gallery-file-input');
    const galleryPreview = document.getElementById('galleryPreview');
    const galleryUploadWrapper = document.querySelector('.gallery-upload-wrapper');
    
    if (galleryInput && galleryPreview && galleryUploadWrapper) {
        // Gestion du changement de fichier via l'input
        galleryInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            displayImagePreviews(files, galleryPreview);
        });
        
        // Gestion du glisser-déposer
        let dragCounter = 0;
        
        // Prévenir le comportement par défaut sur toute la page
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Événements spécifiques pour la zone de upload
        galleryUploadWrapper.addEventListener('dragenter', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dragCounter++;
            this.classList.add('dragover');
        });
        
        galleryUploadWrapper.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('dragover');
        });
        
        galleryUploadWrapper.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dragCounter--;
            if (dragCounter === 0) {
                this.classList.remove('dragover');
            }
        });
        
        galleryUploadWrapper.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dragCounter = 0;
            this.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                // Filtrer seulement les images
                const imageFiles = files.filter(file => file.type.startsWith('image/'));
                if (imageFiles.length > 0) {
                    // Mettre à jour l'input file
                    const dt = new DataTransfer();
                    imageFiles.forEach(file => dt.items.add(file));
                    galleryInput.files = dt.files;
                    
                    // Afficher les prévisualisations
                    displayImagePreviews(imageFiles, galleryPreview);
                }
            }
        });
        
        // Clic sur la zone pour ouvrir le sélecteur
        galleryUploadWrapper.addEventListener('click', function(e) {
            if (e.target === this || e.target.closest('.gallery-upload-button')) {
                galleryInput.click();
            }
        });
    }
    
    // Fonction pour afficher les prévisualisations
    function displayImagePreviews(files, container) {
        container.innerHTML = '';
        
        files.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const previewItem = createPreviewItem(file, index);
                container.appendChild(previewItem);
            }
        });
    }
    
    // Créer un élément de prévisualisation
    function createPreviewItem(file, index) {
        const previewItem = document.createElement('div');
        previewItem.className = 'gallery-preview-item';
        previewItem.dataset.index = index;
        
        const img = document.createElement('img');
        img.className = 'gallery-preview-image';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'gallery-preview-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.title = 'Supprimer cette image';
        
        // Lire et afficher l'image
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        
        // Gestionnaire de suppression
        removeBtn.addEventListener('click', function() {
            removeImageFromSelection(index);
            previewItem.remove();
        });
        
        previewItem.appendChild(img);
        previewItem.appendChild(removeBtn);
        
        return previewItem;
    }
    
    // Supprimer une image de la sélection
    function removeImageFromSelection(index) {
        const galleryInput = document.querySelector('.gallery-file-input');
        if (galleryInput) {
            const dt = new DataTransfer();
            const files = Array.from(galleryInput.files);
            
            files.forEach((file, i) => {
                if (i !== index) {
                    dt.items.add(file);
                }
            });
            
            galleryInput.files = dt.files;
        }
    }
    
    // Gestion de la suppression d'images existantes
    const deleteButtons = document.querySelectorAll('.delete-gallery-image');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const imageId = this.dataset.imageId;
            const postId = this.dataset.postId;
            const galleryItem = this.closest('.gallery-item');
            
            if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
                deleteGalleryImage(postId, imageId, galleryItem);
            }
        });
    });
    
    // Fonction pour supprimer une image de galerie via AJAX
    function deleteGalleryImage(postId, imageId, galleryItem) {
        const deleteUrl = `/post/${postId}/gallery-image/${imageId}/delete`;
        
        fetch(deleteUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Animation de suppression
                galleryItem.style.transform = 'scale(0)';
                galleryItem.style.opacity = '0';
                
                setTimeout(() => {
                    galleryItem.remove();
                    
                    // Mettre à jour le compteur s'il existe
                    updateGalleryCount();
                }, 300);
                
                // Afficher un message de succès
                showNotification('Image supprimée avec succès', 'success');
            } else {
                showNotification(data.message || 'Erreur lors de la suppression', 'error');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            showNotification('Erreur lors de la suppression', 'error');
        });
    }
    
    // Mettre à jour le compteur d'images
    function updateGalleryCount() {
        const galleryHeader = document.querySelector('.gallery-header h3');
        const remainingImages = document.querySelectorAll('.gallery-item').length;
        
        if (galleryHeader) {
            galleryHeader.innerHTML = galleryHeader.innerHTML.replace(/\(\d+\)/, `(${remainingImages})`);
        }
    }
    
    // Fonction pour afficher des notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} notification`;
        notification.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
        `;
        
        // Styles pour la notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    // Validation côté client
    function validateGalleryImages() {
        const galleryInput = document.querySelector('.gallery-file-input');
        if (!galleryInput || !galleryInput.files.length) return true;
        
        const files = Array.from(galleryInput.files);
        const maxFiles = 10;
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
    
    // Ajouter la validation au formulaire
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            if (!validateGalleryImages()) {
                e.preventDefault();
                return false;
            }
        });
    }
});

// CSS pour les animations (ajouté dynamiquement)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
