/**
 * Gestionnaire de modale pour galerie photo avec navigation
 * Version finale et propre
 */
(function() {
    'use strict';
    
    let currentImageIndex = 0;
    let galleryData = [];
    
    // Éléments DOM
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    const closeBtn = document.querySelector('.btn-close');
    const counter = document.getElementById('imageCounter');
    
    /**
     * Initialisation de la modale galerie
     */
    function initGalleryModal() {
        console.log('🎨 Initialisation galerie modale');
        
        if (!modal || !modalImg) {
            console.warn('⚠️ Éléments modale manquants');
            return;
        }
        
        // Collecter toutes les images de la galerie
        collectGalleryData();
        
        if (!galleryData.length) {
            console.info('ℹ️ Aucune image de galerie trouvée');
            return;
        }
        
        // Attacher les événements
        attachClickEvents();
        attachModalEvents();
        attachKeyboardEvents();
        
        console.log(`✅ Galerie initialisée avec ${galleryData.length} images`);
    }
    
    /**
     * Collecter les données de toutes les images de la galerie
     */
    function collectGalleryData() {
        const galleryImages = document.querySelectorAll('.gallery-image');
        galleryData = [];
        
        galleryImages.forEach((img, index) => {
            const src = img.getAttribute('data-image-src') || img.src;
            const alt = img.getAttribute('data-image-alt') || img.alt || `Image ${index + 1}`;
            
            if (src && src !== window.location.href) {
                galleryData.push({ src, alt, element: img });
            }
        });
    }
    
    /**
     * Attacher les événements de clic sur les images
     */
    function attachClickEvents() {
        const galleryItems = document.querySelectorAll('.gallery-item-display');
        
        galleryItems.forEach((item, index) => {
            item.style.cursor = 'pointer';
            
            // Effet hover
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.02)';
                this.style.transition = 'all 0.3s ease';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
            
            // Événement clic
            item.addEventListener('click', function(e) {
                e.preventDefault();
                openModal(index);
            });
        });
    }
    
    /**
     * Attacher les événements de navigation de la modale
     */
    function attachModalEvents() {
        // Bouton précédent
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showPreviousImage();
            });
        }
        
        // Bouton suivant
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showNextImage();
            });
        }
        
        // Bouton fermer
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // Clic sur le fond pour fermer
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Effets hover sur les boutons
        [prevBtn, nextBtn, closeBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('mouseenter', function() {
                    this.style.background = 'rgba(255, 107, 107, 0.9)';
                    this.style.color = 'white';
                    this.style.transform = btn === closeBtn ? 'scale(1.1)' : 'translateY(-50%) scale(1.1)';
                });
                
                btn.addEventListener('mouseleave', function() {
                    this.style.background = 'rgba(255,255,255,0.8)';
                    this.style.color = 'black';
                    this.style.transform = btn === closeBtn ? 'scale(1)' : 'translateY(-50%) scale(1)';
                });
            }
        });
    }
    
    /**
     * Attacher les événements clavier
     */
    function attachKeyboardEvents() {
        document.addEventListener('keydown', function(e) {
            if (modal.style.display !== 'block') return;
            
            switch(e.key) {
                case 'Escape':
                    closeModal();
                    break;
                case 'ArrowLeft':
                    showPreviousImage();
                    break;
                case 'ArrowRight':
                    showNextImage();
                    break;
                case ' ': // Barre d'espace = suivant
                    e.preventDefault();
                    showNextImage();
                    break;
            }
        });
    }
    
    /**
     * Ouvrir la modale à un index spécifique
     */
    function openModal(imageIndex) {
        if (!galleryData.length || imageIndex < 0 || imageIndex >= galleryData.length) return;
        
        currentImageIndex = imageIndex;
        showCurrentImage();
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Animation d'ouverture fluide
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transition = 'opacity 0.3s ease';
        }, 10);
    }
    
    /**
     * Fermer la modale
     */
    function closeModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    /**
     * Afficher l'image précédente (cyclique)
     */
    function showPreviousImage() {
        if (!galleryData.length) return;
        
        currentImageIndex = (currentImageIndex - 1 + galleryData.length) % galleryData.length;
        showCurrentImage();
    }
    
    /**
     * Afficher l'image suivante (cyclique)
     */
    function showNextImage() {
        if (!galleryData.length) return;
        
        currentImageIndex = (currentImageIndex + 1) % galleryData.length;
        showCurrentImage();
    }
    
    /**
     * Afficher l'image actuelle avec animation de transition
     */
    function showCurrentImage() {
        const currentImage = galleryData[currentImageIndex];
        if (!currentImage) return;
        
        // Animation de fade
        modalImg.style.opacity = '0.3';
        modalImg.style.transition = 'opacity 0.15s ease';
        
        setTimeout(() => {
            modalImg.src = currentImage.src;
            modalImg.alt = currentImage.alt;
            
            // Mettre à jour le compteur
            updateCounter();
            
            // Gérer la visibilité des flèches
            updateNavigationButtons();
            
            // Retour à l'opacité complète
            modalImg.style.opacity = '1';
        }, 150);
    }
    
    /**
     * Mettre à jour le compteur d'images
     */
    function updateCounter() {
        if (counter && galleryData.length > 1) {
            counter.textContent = `${currentImageIndex + 1} / ${galleryData.length}`;
            counter.style.display = 'block';
        } else if (counter) {
            counter.style.display = 'none';
        }
    }
    
    /**
     * Gérer l'affichage des boutons de navigation
     */
    function updateNavigationButtons() {
        // Masquer les flèches s'il n'y a qu'une image
        const showButtons = galleryData.length > 1;
        
        if (prevBtn) {
            prevBtn.style.display = showButtons ? 'flex' : 'none';
        }
        
        if (nextBtn) {
            nextBtn.style.display = showButtons ? 'flex' : 'none';
        }
    }
    
    // Initialisation automatique
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initGalleryModal);
        } else {
            initGalleryModal();
        }
    }
    
    // Démarrer l'initialisation
    init();
    
})();
