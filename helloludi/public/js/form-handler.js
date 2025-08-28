/**
 * Gestionnaire des formulaires de posts
 * Gère les champs conditionnels et l'initialisation de l'éditeur
 */
document.addEventListener('DOMContentLoaded', function() {
    // INITIALISATION DE L'ÉDITEUR RICHE - VERSION CORRIGÉE
    console.log('Initialisation de l\'editeur riche...');
    
    if (typeof RichEditor !== 'undefined') {
        try {
            // L'éditeur s'initialise automatiquement via RichEditor.js
            // Vérifier si l'initialisation automatique a fonctionné
            if (window.richEditor) {
                console.log('Éditeur riche initialisé automatiquement avec succès');
            } else {
                console.log('Initialisation manuelle de l\'éditeur...');
                window.richEditor = new RichEditor('richEditorContainer', {
                    hiddenFieldId: 'post_content',
                    placeholder: 'Commencez à écrire votre article...'
                });
                console.log('Éditeur riche initialisé manuellement avec succès');
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'editeur:', error);
        }
    } else {
        console.error('RichEditor non disponible! Vérifiez que RichEditor.js est chargé.');
    }
    
    // Gestion des champs conditionnels basés sur la catégorie
    const categorySelect = document.querySelector('select[name*="[category]"]');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
        // Initialiser l'affichage basé sur la valeur actuelle
        handleCategoryChange();
    }

    // Gestion des tooltips pour les catégories
    const categoryTags = document.querySelectorAll('.category-tag');
    categoryTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const categoryValue = this.classList.contains('recipe') ? 'recipe' :
                                 this.classList.contains('photo') ? 'photo' :
                                 this.classList.contains('event') ? 'event' : 'blabla';
            
            if (categorySelect) {
                categorySelect.value = categoryValue;
                categorySelect.dispatchEvent(new Event('change'));
            }
        });
    });

    function handleCategoryChange() {
        const selectedCategory = categorySelect.value;
        
        // Cacher tous les champs conditionnels
        const conditionalSections = document.querySelectorAll('.conditional-section');
        conditionalSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Afficher les champs appropriés selon la catégorie
        switch(selectedCategory) {
            case 'event':
                showSection('.date-wrapper');
                showSection('.place-wrapper');
                break;
            case 'recipe':
                showSection('.personsNumber-wrapper');
                showSection('.cookingTime-wrapper');
                break;
        }
        
        // Mettre à jour les styles des tags
        const categoryTags = document.querySelectorAll('.category-tag');
        categoryTags.forEach(tag => {
            tag.classList.remove('active');
        });
        
        const activeTag = document.querySelector(`.category-tag.${selectedCategory}`);
        if (activeTag) {
            activeTag.classList.add('active');
        }
    }

    function showSection(selector) {
        const section = document.querySelector(selector);
        if (section) {
            section.style.display = 'block';
        }
    }

    // Gestion de l'upload de l'image principale
    const mainFileInput = document.querySelector('.main-file-input');
    const uploadButton = document.querySelector('.main-upload-button');
    
    if (mainFileInput && uploadButton) {
        // Click sur la zone d'upload
        uploadButton.addEventListener('click', function() {
            mainFileInput.click();
        });
        
        // Drag & drop sur la zone d'upload
        uploadButton.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        uploadButton.addEventListener('dragleave', function(e) {
            this.classList.remove('dragover');
        });
        
        uploadButton.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                mainFileInput.files = files;
                handleMainImagePreview(files[0]);
            }
        });
        
        // Changement de fichier
        mainFileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleMainImagePreview(e.target.files[0]);
            }
        });
    }

    function handleMainImagePreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Créer ou mettre à jour l'aperçu
            let preview = document.querySelector('.main-image-preview');
            if (!preview) {
                preview = document.createElement('div');
                preview.className = 'main-image-preview mt-3';
                uploadButton.parentNode.insertBefore(preview, uploadButton.nextSibling);
            }
            
            preview.innerHTML = `
                <div class="preview-item">
                    <img src="${e.target.result}" alt="${file.name}" style="max-width: 200px; max-height: 150px; object-fit: cover; border-radius: 4px;">
                    <div class="preview-info mt-2">
                        <small class="text-muted">${file.name} (${(file.size / 1024).toFixed(1)} KB)</small>
                    </div>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }

    // Validation du formulaire
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            const title = document.querySelector('input[name*="[title]"]').value.trim();
            const category = document.querySelector('select[name*="[category]"]').value;
            
            if (!title) {
                e.preventDefault();
                alert('Veuillez saisir un titre pour votre article.');
                return false;
            }
            
            if (!category) {
                e.preventDefault();
                alert('Veuillez sélectionner une catégorie pour votre article.');
                return false;
            }
            
            // Vérifier que l'éditeur a du contenu
            if (window.richEditor && window.richEditor.getContent().trim() === '') {
                e.preventDefault();
                alert('Veuillez saisir du contenu pour votre article.');
                return false;
            }
        });
    }
});

// Styles CSS additionnels pour les interactions
const additionalStyles = `
<style>
.category-tag {
    display: inline-block;
    padding: 5px 10px;
    margin: 2px 5px;
    border: 1px solid #ddd;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.2s;
    background: #f8f9fa;
}

.category-tag:hover {
    background: #e9ecef;
    border-color: #adb5bd;
}

.category-tag.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
}

.main-upload-button.dragover {
    background-color: rgba(0, 123, 255, 0.1);
    border-color: #007bff;
}

.main-image-preview {
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 10px;
    background: #f8f9fa;
}

.conditional-section {
    transition: all 0.3s ease;
}
</style>
`;

// Ajouter les styles à la page
document.head.insertAdjacentHTML('beforeend', additionalStyles);
