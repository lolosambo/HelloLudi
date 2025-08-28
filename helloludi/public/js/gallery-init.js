// Script d'initialisation pour s'assurer du bon fonctionnement de la galerie

(function() {
    'use strict';
    
    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGallery);
    } else {
        initGallery();
    }
    
    function initGallery() {
        console.log('🚀 Initialisation de la galerie...');
        
        // S'assurer que tous les éléments sont présents
        const galleryWrapper = document.querySelector('.gallery-upload-wrapper');
        const galleryInput = document.querySelector('.gallery-file-input');
        
        if (!galleryWrapper || !galleryInput) {
            console.log('⚠️ Éléments de galerie non trouvés, initialisation annulée');
            return;
        }
        
        // Forcer la position relative sur le wrapper si ce n'est pas déjà fait
        const computedStyle = window.getComputedStyle(galleryWrapper);
        if (computedStyle.position === 'static') {
            galleryWrapper.style.position = 'relative';
        }
        
        // Vérifier que l'input est bien positionné
        galleryInput.style.position = 'absolute';
        galleryInput.style.top = '0';
        galleryInput.style.left = '0';
        galleryInput.style.width = '100%';
        galleryInput.style.height = '100%';
        galleryInput.style.opacity = '0';
        galleryInput.style.cursor = 'pointer';
        galleryInput.style.zIndex = '10';
        
        // Test rapide du glisser-déposer
        galleryWrapper.addEventListener('dragover', function(e) {
            e.preventDefault();
            console.log('✅ Drag over fonctionne');
        });
        
        galleryWrapper.addEventListener('drop', function(e) {
            e.preventDefault();
            console.log('✅ Drop fonctionne, fichiers:', e.dataTransfer.files.length);
        });
        
        // Test du clic
        galleryInput.addEventListener('change', function(e) {
            console.log('✅ Sélection de fichiers fonctionne, fichiers:', e.target.files.length);
        });
        
        console.log('✅ Galerie initialisée avec succès');
    }
})();
