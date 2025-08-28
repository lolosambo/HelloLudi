// Script spécialisé pour la gestion de la modale d'image de galerie

(function() {
    'use strict';
    
    // Attendre que le DOM soit complètement chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageModal);
    } else {
        initImageModal();
    }
    
    function initImageModal() {
        console.log('🖼️ Initialisation de la modale d\'image de galerie');
        
        const galleryImages = document.querySelectorAll('.gallery-image');
        const imageModal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const closeButton = document.querySelector('#imageModal .btn-close');
        
        console.log('🖼️ Images trouvées:', galleryImages.length);
        console.log('🖼️ Modale trouvée:', !!imageModal);
        console.log('🖼️ Image modale trouvée:', !!modalImage);
        
        if (galleryImages.length === 0) {
            console.log('ℹ️ Aucune image de galerie trouvée sur cette page');
            return;
        }
        
        if (!imageModal || !modalImage) {
            console.error('❌ Éléments de modale manquants');
            return;
        }
        
        // Ajouter les écouteurs sur chaque image
        galleryImages.forEach((image, index) => {
            image.style.cursor = 'pointer';
            
            image.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`🖼️ Clic sur l'image ${index + 1}`);
                
                const imageSrc = this.getAttribute('data-image-src') || this.src;
                const imageAlt = this.getAttribute('data-image-alt') || this.alt || 'Image de galerie';
                
                console.log('🖼️ Source de l\'image:', imageSrc);
                
                // Mettre à jour l'image de la modale
                modalImage.src = imageSrc;
                modalImage.alt = imageAlt;
                
                // Ouvrir la modale
                openModal();
            });
        });
        
        // Fonction pour ouvrir la modale
        function openModal() {
            console.log('🖼️ Ouverture de la modale');
            
            // Méthode 1 : Bootstrap 5
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                console.log('🖼️ Utilisation de Bootstrap 5 Modal API');
                const modal = new bootstrap.Modal(imageModal);
                modal.show();
                return;
            }
            
            // Méthode 2 : jQuery (Bootstrap 4)
            if (typeof $ !== 'undefined' && $.fn.modal) {
                console.log('🖼️ Utilisation de jQuery Modal');
                $(imageModal).modal('show');
                return;
            }
            
            // Méthode 3 : Fallback manuel
            console.log('🖼️ Utilisation du fallback manuel');
            showModalManually();
        }
        
        // Fonction pour afficher la modale manuellement
        function showModalManually() {
            imageModal.style.display = 'block';
            imageModal.classList.add('show');
            imageModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
            
            // Créer un backdrop
            if (!document.querySelector('.modal-backdrop')) {
                const backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                backdrop.addEventListener('click', closeModal);
                document.body.appendChild(backdrop);
            }
        }
        
        // Fonction pour fermer la modale
        function closeModal() {
            console.log('🖼️ Fermeture de la modale');
            
            // Méthode Bootstrap/jQuery
            if (typeof bootstrap !== 'undefined') {
                const modal = bootstrap.Modal.getInstance(imageModal);
                if (modal) {
                    modal.hide();
                    return;
                }
            }
            
            if (typeof $ !== 'undefined' && $.fn.modal) {
                $(imageModal).modal('hide');
                return;
            }
            
            // Fermeture manuelle
            closeModalManually();
        }
        
        // Fonction pour fermer manuellement
        function closeModalManually() {
            imageModal.style.display = 'none';
            imageModal.classList.remove('show');
            imageModal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            
            // Supprimer le backdrop
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
        }
        
        // Écouteur pour le bouton de fermeture
        if (closeButton) {
            closeButton.addEventListener('click', closeModal);
        }
        
        // Fermeture avec Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && imageModal.classList.contains('show')) {
                closeModal();
            }
        });
        
        // Fermeture en cliquant à côté de l'image
        imageModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        console.log('✅ Modale d\'image initialisée avec succès');
    }
})();
