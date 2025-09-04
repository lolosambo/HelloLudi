/**
 * ============================================
 * POST DETAIL PAGE JAVASCRIPT - Fonctionnalités de la page de détail
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Page de détail - Initialisation des fonctionnalités');
    console.log('DOM chargé, démarrage dans 500ms...');
    
    // Vérifier immédiatement les éléments
    const modalTriggers = document.querySelectorAll('[data-custom-modal]');
    const customModals = document.querySelectorAll('.custom-modal');
    console.log('Triggers trouvés:', modalTriggers.length);
    console.log('Modales trouvées:', customModals.length);
    
    // Attendre un peu pour que tous les éléments soient chargés
    setTimeout(() => {
        initGallery();
        initRatingSystem();
        initModals(); // Nouvelle fonction pour les modales
        initCommentsSidebar(); // Nouvelle fonction pour la sidebar rétractable
    }, 500);
});

/**
 * Initialise la sidebar de commentaires rétractable
 */
function initCommentsSidebar() {
    console.log('💬 Sidebar commentaires - Initialisation');
    
    const sidebar = document.getElementById('commentsSidebar');
    const toggleTab = document.getElementById('commentsToggleTab');
    const postLayout = document.getElementById('postLayout');
    const mainColumn = document.getElementById('mainContentColumn');
    const commentCount = document.getElementById('commentCount');
    
    if (!sidebar || !toggleTab) {
        console.log('⚠️ Éléments de la sidebar non trouvés');
        return;
    }
    
    // État de la sidebar (fermée par défaut)
    let sidebarOpen = false;
    
    // Masquer le compteur s'il n'y a pas de commentaires
    const count = parseInt(commentCount.textContent || '0');
    if (count === 0) {
        commentCount.style.display = 'none';
    }
    
    // Fonction pour ouvrir la sidebar
    function openSidebar() {
        sidebarOpen = true;
        sidebar.classList.add('open');
        if (postLayout) postLayout.classList.add('sidebar-open');
        
        // Changer l'icône
        const icon = toggleTab.querySelector('i');
        if (icon) {
            icon.className = 'bi bi-arrow-right';
        }
        
        console.log('✅ Sidebar ouverte');
    }
    
    // Fonction pour fermer la sidebar
    function closeSidebar() {
        sidebarOpen = false;
        sidebar.classList.remove('open');
        if (postLayout) postLayout.classList.remove('sidebar-open');
        
        // Changer l'icône
        const icon = toggleTab.querySelector('i');
        if (icon) {
            icon.className = 'bi bi-chat-dots';
        }
        
        console.log('✅ Sidebar fermée');
    }
    
    // Fonction pour basculer l'état
    function toggleSidebar() {
        if (sidebarOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }
    
    // Événement de clic sur l'onglet
    toggleTab.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    });
    
    // Fermer la sidebar si on clique à l'extérieur
    document.addEventListener('click', function(e) {
        if (sidebarOpen && 
            !sidebar.contains(e.target) && 
            !toggleTab.contains(e.target)) {
            closeSidebar();
        }
    });
    
    // Fermer avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebarOpen) {
            closeSidebar();
        }
    });
    
    // Gestion responsive
    function handleResize() {
        if (window.innerWidth < 768 && sidebarOpen) {
            closeSidebar();
        }
    }
    
    window.addEventListener('resize', handleResize);
    
    // Exposer les fonctions au contexte global pour déboggage
    window.sidebarAPI = {
        open: openSidebar,
        close: closeSidebar,
        toggle: toggleSidebar,
        isOpen: () => sidebarOpen
    };
    
    console.log('✅ Sidebar commentaires initialisée');
}

/**
 * Système de modales personnalisées - Solution définitive
 */
function initModals() {
    console.log('🪟 Modales personnalisées - Initialisation');
    
    // Vérification des éléments
    const modalTriggers = document.querySelectorAll('[data-custom-modal]');
    const customModals = document.querySelectorAll('.custom-modal');
    
    console.log('Triggers trouvés:', modalTriggers.length);
    console.log('Modales trouvées:', customModals.length);
    
    if (modalTriggers.length === 0) {
        console.error('⚠️ Aucun trigger de modale trouvé !');
        return;
    }
    
    if (customModals.length === 0) {
        console.error('⚠️ Aucune modale personnalisée trouvée !');
        return;
    }
    
    // Fonction globale pour gérer la fermeture - déclarée en premier
    window.handleCloseClick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Clic sur bouton de fermeture détecté');
        
        // Méthode 1 : via data-custom-close
        const modalId = this.getAttribute('data-custom-close');
        if (modalId) {
            console.log('Fermeture via data-custom-close:', modalId);
            closeCustomModal(modalId);
            return;
        }
        
        // Méthode 2 : trouver la modale parente
        const modal = this.closest('.custom-modal');
        if (modal) {
            console.log('Fermeture via modale parente:', modal.id);
            closeCustomModal(modal.id);
            return;
        }
        
        // Méthode 3 : fermer toutes les modales ouvertes
        const openModal = document.querySelector('.custom-modal.show');
        if (openModal) {
            console.log('Fermeture de toute modale ouverte:', openModal.id);
            closeCustomModal(openModal.id);
        }
    };
    
    // Gérer l'ouverture des modales
    modalTriggers.forEach((trigger, index) => {
        console.log(`Trigger ${index}:`, trigger.getAttribute('data-custom-modal'));
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const modalId = this.getAttribute('data-custom-modal');
            console.log('Clic sur trigger pour modale:', modalId);
            openCustomModal(modalId);
        });
    });
    
    // Gérer la fermeture des modales avec onclick (plus fiable)
    const closeButtons = document.querySelectorAll('[data-custom-close]');
    console.log('Boutons de fermeture trouvés:', closeButtons.length);
    
    closeButtons.forEach((closeBtn, index) => {
        const modalId = closeBtn.getAttribute('data-custom-close');
        console.log(`Bouton fermeture ${index} pour modale:`, modalId);
        
        closeBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('✅ Fermeture via data-custom-close:', modalId);
            closeCustomModal(modalId);
        };
    });
    
    // Backup : onclick sur tous les boutons .custom-btn-close
    const allCloseButtons = document.querySelectorAll('.custom-btn-close');
    console.log('Boutons .custom-btn-close trouvés:', allCloseButtons.length);
    
    allCloseButtons.forEach((btn, index) => {
        if (!btn.onclick) { // Seulement si pas déjà configuré
            btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Trouver la modale parente
                const modal = this.closest('.custom-modal');
                if (modal) {
                    console.log('✅ Fermeture via modale parente:', modal.id);
                    closeCustomModal(modal.id);
                }
            };
        }
    });
    
    // Gestion des touches clavier
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.custom-modal.show');
            if (openModal) {
                console.log('Fermeture par Escape:', openModal.id);
                closeCustomModal(openModal.id);
            }
        }
    });
    
    // Ajouter un debug global pour tous les clics
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('custom-btn-close')) {
            console.log('🎯 CLIC GLOBAL DÉTECTÉ sur .custom-btn-close:', e.target);
        }
        if (e.target.getAttribute('data-custom-close')) {
            console.log('🎯 CLIC GLOBAL DÉTECTÉ sur [data-custom-close]:', e.target);
        }
    }, true); // true = capture phase
    
    console.log('✅ Modales personnalisées initialisées avec succès');
}

/**
 * Ouvre une modale personnalisée
 */
function openCustomModal(modalId) {
    console.log('Ouverture de la modale:', modalId);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('Modale introuvable:', modalId);
        return;
    }
    
    // Fermer toute autre modale ouverte
    const openModals = document.querySelectorAll('.custom-modal.show');
    openModals.forEach(openModal => {
        if (openModal.id !== modalId) {
            closeCustomModal(openModal.id);
        }
    });
    
    // Supprimer le style display: none et ajouter la classe show
    modal.style.display = ''; // Supprime le style inline
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Réinitialiser les événements de fermeture pour cette modale spécifiquement
    setTimeout(() => {
        initCloseEventsForModal(modal);
    }, 100);
    
    // Focus sur le premier input
    setTimeout(() => {
        const firstInput = modal.querySelector('input[type="text"], textarea');
        if (firstInput) {
            firstInput.focus();
            firstInput.select(); // Sélectionne le texte s'il y en a
            console.log('Focus sur:', firstInput.name || firstInput.className);
        }
    }, 300); // Délai plus long pour s'assurer que l'animation est terminée
    
    console.log('✅ Modale ouverte:', modalId);
}

/**
 * Initialise les événements de fermeture pour une modale spécifique
 */
function initCloseEventsForModal(modal) {
    console.log('Initialisation des événements de fermeture pour:', modal.id);
    
    // Trouver tous les boutons de fermeture dans cette modale
    const closeButtons = modal.querySelectorAll('.custom-btn-close, [data-custom-close]');
    console.log('Boutons de fermeture trouvés dans cette modale:', closeButtons.length);
    
    closeButtons.forEach((btn, index) => {
        console.log(`Configuration du bouton ${index}`);
        
        // Utiliser onclick direct (qui fonctionne !)
        btn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('✅ Fermeture de la modale:', modal.id);
            closeCustomModal(modal.id);
        };
        
        // Style discret mais visible
        btn.title = 'Fermer';
        
        console.log('✅ Bouton configuré avec onclick');
    });
    
    // Backdrop avec onclick aussi
    const backdrop = modal.querySelector('.custom-modal-backdrop');
    if (backdrop) {
        backdrop.onclick = function(e) {
            if (e.target === backdrop) { // Seulement si clic direct sur backdrop
                console.log('✅ Fermeture via backdrop pour:', modal.id);
                closeCustomModal(modal.id);
            }
        };
        console.log('✅ Backdrop configuré');
    }
}

/**
 * Ferme une modale personnalisée
 */
function closeCustomModal(modalId) {
    console.log('Fermeture de la modale:', modalId);
    
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error('Modale introuvable:', modalId);
        return;
    }
    
    modal.classList.remove('show');
    modal.style.display = 'none'; // Remet le style display: none
    document.body.style.overflow = '';
    
    console.log('✅ Modale fermée:', modalId);
}

/**
 * Vérifie si une modale est ouverte
 */
function isModalOpen() {
    return document.querySelector('.custom-modal.show') !== null;
}

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
