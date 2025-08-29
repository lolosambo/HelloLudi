/**
 * Script pour restaurer l'interactivité des images après validation
 * À inclure dans les templates d'édition et d'affichage
 */
(function() {
    'use strict';

    // Attendre que le DOM soit chargé
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🔄 Initialisation de la restauration d\'interactivité des images');
        
        // Délai pour s'assurer que tout est bien chargé
        setTimeout(() => {
            restoreImageInteractivity();
        }, 500);
    });

    /**
     * Restaure l'interactivité de toutes les images dans le contenu
     */
    function restoreImageInteractivity() {
        // Chercher dans les conteneurs de contenu d'articles
        const contentContainers = document.querySelectorAll(
            '.post-content, .editor-content, .article-content, #richEditorContainer .editor-content'
        );

        let totalImagesFound = 0;
        let totalImagesRestored = 0;

        contentContainers.forEach(container => {
            if (!container) return;

            // Trouver toutes les images dans le conteneur
            const images = container.querySelectorAll('img');
            totalImagesFound += images.length;

            images.forEach(img => {
                if (restoreImageInteractivity_Single(img, container)) {
                    totalImagesRestored++;
                }
            });
        });

        if (totalImagesFound > 0) {
            console.log(`✅ ${totalImagesRestored}/${totalImagesFound} images restaurées avec interactivité`);
        } else {
            console.log('ℹ️ Aucune image trouvée à restaurer');
        }
    }

    /**
     * Restaure l'interactivité d'une image spécifique
     * @param {HTMLImageElement} img 
     * @param {HTMLElement} container 
     * @returns {boolean} Succès de la restauration
     */
    function restoreImageInteractivity_Single(img, container) {
        // Vérifier si l'image est déjà interactive
        if (img.classList.contains('interactive-image') || img.classList.contains('editor-image')) {
            return false; // Déjà interactive
        }

        // Ajouter les classes nécessaires
        img.classList.add('editor-image', 'interactive-image', 'resizable');

        // Ajouter les styles de base si manquants
        if (!img.style.cursor) {
            img.style.cursor = 'pointer';
        }

        // Forcer la persistance des styles d'alignement existants
        forceImageAlignmentStyles(img);

        // Ajouter les événements d'interactivité
        setupImageEvents(img, container);

        return true;
    }

    /**
     * Force les styles d'alignement basés sur les classes existantes
     * @param {HTMLImageElement} img 
     */
    function forceImageAlignmentStyles(img) {
        // Détecter l'alignement basé sur les classes CSS existantes
        if (img.classList.contains('align-left') || img.classList.contains('wrap-left')) {
            img.style.cssText += `
                float: left !important;
                margin: 5px 15px 15px 5px !important;
                clear: left !important;
                max-width: 50% !important;
                height: auto !important;
                display: block !important;
                position: static !important;
            `;
            console.log('📍 Image alignement GAUCHE restauré');
        } else if (img.classList.contains('align-right') || img.classList.contains('wrap-right')) {
            img.style.cssText += `
                float: right !important;
                margin: 5px 5px 15px 15px !important;
                clear: right !important;
                max-width: 50% !important;
                height: auto !important;
                display: block !important;
                position: static !important;
            `;
            console.log('📍 Image alignement DROITE restauré');
        } else if (img.classList.contains('align-center')) {
            img.style.cssText += `
                display: block !important;
                margin: 15px auto !important;
                float: none !important;
                max-width: 100% !important;
                height: auto !important;
                position: static !important;
            `;
            console.log('📍 Image alignement CENTRE restauré');
        } else {
            // Si aucune classe d'alignement, détecter par les styles inline existants
            const computedStyle = window.getComputedStyle(img);
            if (computedStyle.float === 'left') {
                img.classList.add('align-left');
                console.log('🔍 Alignement GAUCHE détecté et classe ajoutée');
            } else if (computedStyle.float === 'right') {
                img.classList.add('align-right');
                console.log('🔍 Alignement DROITE détecté et classe ajoutée');
            }
        }
    }

    /**
     * Configure les événements d'interactivité pour une image
     * @param {HTMLImageElement} img 
     * @param {HTMLElement} container 
     */
    function setupImageEvents(img, container) {
        // Marquer comme configuré pour éviter les doublons
        if (img.dataset.eventsSetup === 'true') {
            return;
        }
        img.dataset.eventsSetup = 'true';

        // Clic simple pour sélectionner
        img.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            selectImage(img, container);
        });

        // Double-clic pour éditer (si l'éditeur est disponible)
        img.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            editImage(img);
        });

        // Survol pour indiquer l'interactivité
        img.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.style.opacity = '0.8';
                this.style.transition = 'opacity 0.2s ease';
            }
        });

        img.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.opacity = '1';
            }
        });

        console.log('🎯 Événements d\'interactivité ajoutés à l\'image');
    }

    /**
     * Sélectionne une image et ajoute la poignée de redimensionnement
     * @param {HTMLImageElement} img 
     * @param {HTMLElement} container 
     */
    function selectImage(img, container) {
        // Désélectionner les autres images
        container.querySelectorAll('img.selected').forEach(otherImg => {
            otherImg.classList.remove('selected');
            otherImg.style.opacity = '1';
            removeResizeHandle(otherImg);
        });

        // Sélectionner cette image
        img.classList.add('selected');
        img.style.opacity = '1';
        img.style.outline = '3px solid #007bff';
        img.style.outlineOffset = '2px';

        // Ajouter la poignée de redimensionnement
        addResizeHandle(img);

        console.log('✅ Image sélectionnée avec poignée ajoutée');
    }

    /**
     * Ouvre la modale d'édition d'image (si disponible)
     * @param {HTMLImageElement} img 
     */
    function editImage(img) {
        // Vérifier si l'éditeur riche est disponible
        if (window.richEditor && typeof window.richEditor.editImage === 'function') {
            console.log('🎨 Ouverture de l\'éditeur d\'image via RichEditor');
            window.richEditor.editImage(img);
            return;
        }

        // Sinon, ouvrir une modale basique ou afficher les informations
        console.log('⚠️ Éditeur riche non disponible - affichage des informations image');
        showImageInfo(img);
    }

    /**
     * Affiche les informations d'une image dans une alerte
     * @param {HTMLImageElement} img 
     */
    function showImageInfo(img) {
        const info = [
            `URL: ${img.src}`,
            `Alt: ${img.alt || 'Non défini'}`,
            `Largeur: ${img.offsetWidth}px`,
            `Hauteur: ${img.offsetHeight}px`,
            `Classes: ${img.className}`,
            `Alignement détecté: ${detectAlignment(img)}`
        ].join('\n');

        alert(`Informations de l'image:\n\n${info}\n\nPour éditer cette image, utilisez la page d'édition de l'article.`);
    }

    /**
     * Détecte l'alignement d'une image
     * @param {HTMLImageElement} img 
     * @returns {string}
     */
    function detectAlignment(img) {
        if (img.classList.contains('align-left') || img.classList.contains('wrap-left')) {
            return 'Gauche';
        } else if (img.classList.contains('align-right') || img.classList.contains('wrap-right')) {
            return 'Droite';
        } else if (img.classList.contains('align-center')) {
            return 'Centre';
        } else {
            const computedStyle = window.getComputedStyle(img);
            if (computedStyle.float === 'left') return 'Gauche (détecté)';
            if (computedStyle.float === 'right') return 'Droite (détecté)';
            return 'Par défaut';
        }
    }

    /**
     * Ajoute une poignée de redimensionnement à une image
     * @param {HTMLImageElement} img 
     */
    function addResizeHandle(img) {
        // Supprimer une éventuelle poignée existante
        removeResizeHandle(img);

        // Créer le wrapper s'il n'existe pas
        let wrapper = img.parentElement;
        if (!wrapper.classList.contains('image-wrapper')) {
            wrapper = document.createElement('div');
            wrapper.className = 'image-wrapper';
            wrapper.style.cssText = `
                position: relative;
                display: inline-block;
                line-height: 0;
            `;
            
            // Insérer le wrapper à la position de l'image
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
        }

        // Créer la poignée
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.innerHTML = '⇘';
        handle.style.cssText = `
            position: absolute;
            bottom: -8px;
            right: -8px;
            width: 16px;
            height: 16px;
            background: #007bff;
            color: white;
            border: 2px solid white;
            border-radius: 50%;
            cursor: se-resize;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            z-index: 1001;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            user-select: none;
            transition: all 0.2s ease;
        `;

        handle.addEventListener('mouseenter', function() {
            this.style.background = '#0056b3';
            this.style.transform = 'scale(1.1)';
        });

        handle.addEventListener('mouseleave', function() {
            this.style.background = '#007bff';
            this.style.transform = 'scale(1)';
        });

        // Ajouter les événements de redimensionnement
        setupResizeEvents(handle, img);

        wrapper.appendChild(handle);
    }

    /**
     * Supprime la poignée de redimensionnement d'une image
     * @param {HTMLImageElement} img 
     */
    function removeResizeHandle(img) {
        const wrapper = img.parentElement;
        if (wrapper && wrapper.classList.contains('image-wrapper')) {
            const handle = wrapper.querySelector('.resize-handle');
            if (handle) {
                handle.remove();
            }
            
            // Si plus de poignée, supprimer le wrapper
            if (!wrapper.querySelector('.resize-handle')) {
                const parent = wrapper.parentNode;
                parent.insertBefore(img, wrapper);
                wrapper.remove();
            }
        }

        // Supprimer le style de sélection
        img.style.outline = '';
        img.style.outlineOffset = '';
    }

    /**
     * Configure les événements de redimensionnement
     * @param {HTMLElement} handle 
     * @param {HTMLImageElement} img 
     */
    function setupResizeEvents(handle, img) {
        let isResizing = false;
        let startX, startWidth, startHeight, aspectRatio;

        handle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            isResizing = true;
            startX = e.clientX;
            startWidth = img.offsetWidth;
            startHeight = img.offsetHeight;
            aspectRatio = startHeight / startWidth;
            
            document.body.style.cursor = 'se-resize';
            document.body.style.userSelect = 'none';

            console.log('🎯 Début redimensionnement');
        });

        const handleMouseMove = (e) => {
            if (!isResizing) return;
            
            e.preventDefault();
            
            const deltaX = e.clientX - startX;
            const newWidth = Math.max(50, Math.min(startWidth + deltaX, 800));
            const newHeight = newWidth * aspectRatio;
            
            img.style.width = newWidth + 'px';
            img.style.height = newHeight + 'px';
        };

        const handleMouseUp = () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                // Forcer la persistence des styles d'alignement
                forceImageAlignmentStyles(img);
                
                console.log(`✅ Redimensionnement terminé: ${img.style.width}`);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    // Gestion des clics ailleurs pour désélectionner
    document.addEventListener('click', function(e) {
        if (!e.target.closest('img.editor-image') && !e.target.closest('.resize-handle')) {
            // Désélectionner toutes les images
            document.querySelectorAll('img.selected').forEach(img => {
                img.classList.remove('selected');
                img.style.outline = '';
                img.style.outlineOffset = '';
                img.style.opacity = '1';
                removeResizeHandle(img);
            });
        }
    });

    // Exposer les fonctions pour usage externe
    window.ImageInteractivityRestorer = {
        restore: restoreImageInteractivity,
        restoreSingle: restoreImageInteractivity_Single,
        selectImage: selectImage
    };

    console.log('🔧 Script de restauration d\'interactivité des images chargé');
})();