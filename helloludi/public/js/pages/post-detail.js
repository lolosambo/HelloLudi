/**
 * ============================================
 * POST DETAIL PAGE JAVASCRIPT - Fonctionnalités de la page de détail
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Page de détail - Initialisation des fonctionnalités');
    
    // Attendre un peu pour que tous les éléments soient chargés
    setTimeout(() => {
        initGallery();
        initRatingSystem();
    }, 500);
});

/**
 * Galerie photo avec navigation - Version finale
 */
let currentIndex = 0;
let images = [];

function initGallery() {
    console.log('🎨 Galerie photo - Initialisation');
    
    // Éléments DOM
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    const counter = document.getElementById('imageCounter');
    
    // Collecter les images
    const galleryImages = document.querySelectorAll('.gallery-image');
    images = [];
    galleryImages.forEach((img, i) => {
        const src = img.getAttribute('data-image-src') || img.src;
        images.push({ src: src, alt: `Image ${i + 1}` });
    });
    
    if (!images.length) {
        console.log('⚠️ Pas d\'images de galerie trouvées');
        return;
    }
    
    console.log(`✅ Galerie initialisée avec ${images.length} images`);
    
    // Créer le bouton de fermeture personnalisé
    const customCloseBtn = createCustomCloseButton();
    
    // Fonctions principales
    function ouvrir(index) {
        currentIndex = index;
        if (modalImg && images[index]) {
            modalImg.src = images[index].src;
            modalImg.alt = images[index].alt;
        }
        if (modal) {
            modal.style.display = 'block';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.zIndex = '9999';
            document.body.style.overflow = 'hidden';
        }
        if (counter) {
            counter.textContent = `${index + 1} / ${images.length}`;
            counter.style.display = 'block';
        }
        // Gérer les flèches de navigation
        if (prevBtn) prevBtn.style.display = images.length > 1 ? 'flex' : 'none';
        if (nextBtn) nextBtn.style.display = images.length > 1 ? 'flex' : 'none';
        
        // Afficher le bouton de fermeture
        customCloseBtn.style.display = 'flex';
    }
    
    function fermer() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        customCloseBtn.style.display = 'none';
    }
    
    function precedent() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        ouvrir(currentIndex);
    }
    
    function suivant() {
        currentIndex = (currentIndex + 1) % images.length;
        ouvrir(currentIndex);
    }
    
    // Attacher les événements sur les miniatures
    const galleryItems = document.querySelectorAll('.gallery-item-display');
    galleryItems.forEach((item, i) => {
        item.style.cursor = 'pointer';
        
        // Effet hover
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
            this.style.transition = 'all 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        // Clic pour ouvrir
        item.addEventListener('click', function(e) {
            e.preventDefault();
            ouvrir(i);
        });
    });
    
    // Navigation avec les flèches
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            precedent();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            suivant();
        });
    }
    
    // Fermer en cliquant sur le fond
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                fermer();
            }
        });
    }
    
    // Double-clic pour fermer (solution alternative)
    if (modal) {
        modal.addEventListener('dblclick', function(e) {
            fermer();
        });
    }
    
    // Navigation clavier
    document.addEventListener('keydown', function(e) {
        if (modal && modal.style.display === 'block') {
            switch(e.key) {
                case 'Escape':
                    fermer();
                    break;
                case 'ArrowLeft':
                    precedent();
                    break;
                case 'ArrowRight':
                    suivant();
                    break;
                case ' ':
                    e.preventDefault();
                    suivant();
                    break;
            }
        }
    });
    
    // Exposer les fonctions au contexte global pour les tests
    window.galleryAPI = {
        ouvrir: ouvrir,
        fermer: fermer,
        precedent: precedent,
        suivant: suivant
    };
}

/**
 * Crée un bouton de fermeture personnalisé
 */
function createCustomCloseButton() {
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Fermer la galerie');
    closeBtn.id = 'customGalleryCloseBtn';
    
    // Styles élégants
    const styles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '999999',
        width: '50px',
        height: '50px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '24px',
        fontWeight: 'bold',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
    };
    
    Object.assign(closeBtn.style, styles);
    
    // Effets hover
    closeBtn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'rgba(255, 69, 69, 0.9)';
        this.style.transform = 'scale(1.1)';
    });
    
    closeBtn.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.style.transform = 'scale(1)';
    });
    
    // Événement de fermeture
    closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const modal = document.getElementById('imageModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        this.style.display = 'none';
    });
    
    // Ajouter au body
    document.body.appendChild(closeBtn);
    
    return closeBtn;
}

/**
 * Initialise le système de notation par étoiles
 */
function initRatingSystem() {
    console.log('⭐ Système de notation - Initialisation');
    
    const ratingContainer = document.querySelector('.star-rating');
    if (!ratingContainer) {
        console.log('⚠️ Pas de système de notation trouvé');
        return;
    }
    
    const postId = ratingContainer.getAttribute('data-post-id');
    const userRated = ratingContainer.getAttribute('data-user-rated') === 'true';
    const stars = ratingContainer.querySelectorAll('.fa-star');
    
    if (userRated) {
        console.log('✅ Utilisateur a déjà voté');
        return;
    }
    
    stars.forEach((star, index) => {
        const value = parseInt(star.getAttribute('data-value'));
        
        star.addEventListener('mouseenter', function() {
            highlightStars(stars, value);
        });
        
        star.addEventListener('mouseleave', function() {
            resetStars(stars);
        });
        
        star.addEventListener('click', function() {
            submitRating(postId, value, stars);
        });
    });
    
    console.log(`✅ Système de notation initialisé pour le post ${postId}`);
}

/**
 * Met en surbrillance les étoiles jusqu'à une valeur donnée
 */
function highlightStars(stars, value) {
    stars.forEach((star, index) => {
        const starValue = parseInt(star.getAttribute('data-value'));
        if (starValue <= value) {
            star.classList.add('hover');
        } else {
            star.classList.remove('hover');
        }
    });
}

/**
 * Remet les étoiles dans leur état initial
 */
function resetStars(stars) {
    stars.forEach(star => {
        star.classList.remove('hover');
    });
}

/**
 * Soumet une notation
 */
async function submitRating(postId, rating, stars) {
    try {
        const response = await fetch(`/post/${postId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ rating: rating })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Marquer les étoiles comme sélectionnées
            stars.forEach((star, index) => {
                const starValue = parseInt(star.getAttribute('data-value'));
                if (starValue <= rating) {
                    star.classList.add('selected');
                }
                // Désactiver les clics futurs
                star.style.pointerEvents = 'none';
            });
            
            // Mettre à jour le message
            const messageElement = document.querySelector('.rating-message');
            if (messageElement) {
                messageElement.innerHTML = `
                    <p><strong>🎉 Merci ! Vous avez donné ${rating} étoile(s)</strong></p>
                    <p><strong>Note moyenne :</strong> ${data.averageRating}/5 ⭐</p>
                    <p><strong>Nombre de votes :</strong> ${data.ratingCount} gourmets</p>
                `;
            }
            
            console.log(`✅ Note ${rating} soumise avec succès`);
        } else {
            console.error('❌ Erreur lors de la soumission de la note');
        }
    } catch (error) {
        console.error('❌ Erreur réseau:', error);
    }
}
