// Script de débogage pour la fonctionnalité de galerie
// À ajouter temporairement pour diagnostiquer les problèmes

console.log('🔧 Debug: Galerie script chargé');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Debug: DOM chargé');
    
    // Vérifier les éléments principaux
    const categorySelect = document.getElementById('post_category');
    const galleryWrapper = document.querySelector('.gallery-images-wrapper');
    const galleryInput = document.querySelector('.gallery-file-input');
    const galleryPreview = document.getElementById('galleryPreview');
    const galleryUploadWrapper = document.querySelector('.gallery-upload-wrapper');
    
    console.log('🔧 Debug: Éléments trouvés:', {
        categorySelect: !!categorySelect,
        galleryWrapper: !!galleryWrapper,
        galleryInput: !!galleryInput,
        galleryPreview: !!galleryPreview,
        galleryUploadWrapper: !!galleryUploadWrapper
    });
    
    if (galleryUploadWrapper) {
        console.log('🔧 Debug: Zone de upload trouvée, ajout des événements...');
        
        // Test de l'événement de clic
        galleryUploadWrapper.addEventListener('click', function() {
            console.log('🔧 Debug: Zone de upload cliquée');
        });
        
        // Test des événements drag & drop
        galleryUploadWrapper.addEventListener('dragenter', function(e) {
            console.log('🔧 Debug: Drag enter détecté');
            e.preventDefault();
        });
        
        galleryUploadWrapper.addEventListener('dragover', function(e) {
            console.log('🔧 Debug: Drag over détecté');
            e.preventDefault();
        });
        
        galleryUploadWrapper.addEventListener('drop', function(e) {
            console.log('🔧 Debug: Drop détecté');
            console.log('🔧 Debug: Fichiers droppés:', e.dataTransfer.files);
            e.preventDefault();
        });
    }
    
    if (galleryInput) {
        galleryInput.addEventListener('change', function(e) {
            console.log('🔧 Debug: Fichiers sélectionnés via input:', e.target.files);
        });
    }
    
    // Vérifier l'éditeur riche existant
    const richEditorContainer = document.getElementById('richEditorContainer');
    if (richEditorContainer) {
        console.log('🔧 Debug: Éditeur riche détecté');
        
        // Vérifier s'il y a des conflits d'événements
        richEditorContainer.addEventListener('dragenter', function(e) {
            console.log('🔧 Debug: Drag détecté sur l\'éditeur riche');
        });
    }
    
    // Test de compatibilité DataTransfer
    if (window.DataTransfer) {
        console.log('🔧 Debug: DataTransfer supporté');
    } else {
        console.log('⚠️ Debug: DataTransfer non supporté');
    }
});
