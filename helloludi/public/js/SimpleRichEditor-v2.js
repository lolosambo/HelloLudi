/**
 * SimpleRichEditor - Version 2.0 - Système d'images refait complètement
 * PROBLÈME RÉSOLU : Les images conservent leur position lors de la sélection/redimensionnement
 */
(function(window) {
    'use strict';

    class SimpleRichEditor {
        constructor(containerId, options = {}) {
            this.containerId = containerId;
            this.options = {
                hiddenFieldId: 'post_content',
                placeholder: 'Commencez à écrire votre contenu ici...',
                ...options
            };

            this.container = null;
            this.toolbar = null;
            this.editor = null;
            this.hiddenField = null;
            this.currentRange = null;

            this.init();
        }

        init() {
            this.container = document.getElementById(this.containerId);
            if (!this.container) {
                console.error(`Container with ID '${this.containerId}' not found`);
                return;
            }

            this.createEditor();
            this.setupEventListeners();
            this.loadExistingContent();
            
            // Initialiser le système d'images après un délai
            setTimeout(() => {
                this.setupImageSystem();
            }, 500);
            
            console.log('✅ SimpleRichEditor v2.0 initialisé - Système images refait');
        }

        createEditor() {
            this.container.innerHTML = `
                <div class="rich-editor-container">
                    <div class="editor-toolbar">
                        ${this.createToolbarHTML()}
                    </div>
                    <div class="editor-content" 
                         contenteditable="true" 
                         data-placeholder="${this.options.placeholder}">
                    </div>
                </div>
            `;

            this.toolbar = this.container.querySelector('.editor-toolbar');
            this.editor = this.container.querySelector('.editor-content');
            this.hiddenField = document.getElementById(this.options.hiddenFieldId);
        }

        createToolbarHTML() {
            return `
                <!-- Groupe historique -->
                <div class="editor-group">
                    <button type="button" class="editor-btn" data-command="undo" title="Annuler">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="redo" title="Rétablir">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                </div>

                <!-- Groupe format -->
                <div class="editor-group">
                    <select class="editor-select" id="formatSelect" title="Format">
                        <option value="">Format</option>
                        <option value="h1">Titre 1</option>
                        <option value="h2">Titre 2</option>
                        <option value="h3">Titre 3</option>
                        <option value="p">Paragraphe</option>
                    </select>
                </div>

                <!-- Groupe mise en forme -->
                <div class="editor-group">
                    <button type="button" class="editor-btn" data-command="bold" title="Gras">
                        <i class="bi bi-type-bold"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="italic" title="Italique">
                        <i class="bi bi-type-italic"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="underline" title="Souligné">
                        <i class="bi bi-type-underline"></i>
                    </button>
                </div>

                <!-- Groupe couleurs -->
                <div class="editor-group">
                    <div class="color-picker-wrapper">
                        <input type="color" id="textColor" value="#000000">
                        <label for="textColor" title="Couleur du texte">
                            <i class="bi bi-palette"></i>
                        </label>
                    </div>
                </div>

                <!-- Groupe alignement -->
                <div class="editor-group">
                    <button type="button" class="editor-btn" data-command="justifyLeft" title="Aligner à gauche">
                        <i class="bi bi-text-left"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="justifyCenter" title="Centrer">
                        <i class="bi bi-text-center"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="justifyRight" title="Aligner à droite">
                        <i class="bi bi-text-right"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="justifyFull" title="Justifier">
                        <i class="bi bi-justify"></i>
                    </button>
                </div>

                <!-- Groupe listes -->
                <div class="editor-group">
                    <button type="button" class="editor-btn" data-command="insertUnorderedList" title="Liste à puces">
                        <i class="bi bi-list-ul"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="insertOrderedList" title="Liste numérotée">
                        <i class="bi bi-list-ol"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="outdent" title="Diminuer le retrait (Shift+Tab)">
                        <i class="bi bi-text-indent-left"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="indent" title="Augmenter le retrait (Tab)">
                        <i class="bi bi-text-indent-right"></i>
                    </button>
                </div>

                <!-- Groupe insertion -->
                <div class="editor-group">
                    <button type="button" class="editor-btn" id="linkBtn" title="Insérer un lien">
                        <i class="bi bi-link-45deg"></i>
                    </button>
                    <button type="button" class="editor-btn" id="imageBtn" title="Insérer une image">
                        <i class="bi bi-image"></i>
                    </button>
                    <button type="button" class="editor-btn" id="videoBtn" title="Insérer une vidéo">
                        <i class="bi bi-play-btn"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="removeFormat" title="Supprimer le formatage">
                        <i class="bi bi-eraser"></i>
                    </button>
                </div>

                <!-- Groupe debug -->
                <div class="editor-group">
                    <button type="button" class="editor-btn" id="debugImagesBtn" title="Debug Images">
                        🔍
                    </button>
                </div>
            `;
        }

        setupEventListeners() {
            // Boutons de commande simples
            const commandButtons = this.toolbar.querySelectorAll('[data-command]');
            commandButtons.forEach(btn => {
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });
                
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.execCommand(btn.dataset.command);
                });
            });

            // Sélecteur de format
            const formatSelect = document.getElementById('formatSelect');
            if (formatSelect) {
                formatSelect.addEventListener('change', (e) => {
                    if (e.target.value) {
                        this.applyFormat(e.target.value);
                    }
                });
            }

            // Sélecteur de couleur
            const textColor = document.getElementById('textColor');
            if (textColor) {
                textColor.addEventListener('change', (e) => {
                    this.applyTextColor(e.target.value);
                });
            }

            // Boutons spéciaux
            document.getElementById('linkBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.insertSimpleLink();
            });
            
            document.getElementById('imageBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.showImageModal();
            });
            
            document.getElementById('videoBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.showVideoModal();
            });

            // Bouton de debug
            document.getElementById('debugImagesBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.debugImageStyles();
            });

            // Événements de l'éditeur
            this.editor.addEventListener('input', () => {
                this.updateHiddenField();
                this.updateToolbar();
            });

            this.editor.addEventListener('mouseup', () => {
                this.saveSelection();
                this.updateToolbar();
            });
            
            this.editor.addEventListener('keyup', (e) => {
                this.saveSelection();
                this.updateToolbar();
            });
            
            this.editor.addEventListener('blur', () => {
                setTimeout(() => this.saveSelection(), 50);
            });
            
            // Clic ailleurs pour désélectionner les images
            this.editor.addEventListener('click', (e) => {
                if (!e.target.classList.contains('stable-image') && 
                    !e.target.classList.contains('resize-handle-new')) {
                    this.deselectAllImages();
                }
            });

            // Raccourcis clavier
            this.editor.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'b') {
                    e.preventDefault();
                    this.execCommand('bold');
                }
                if (e.ctrlKey && e.key === 'i') {
                    e.preventDefault();
                    this.execCommand('italic');
                }
                if (e.ctrlKey && e.key === 'u') {
                    e.preventDefault();
                    this.execCommand('underline');
                }
                if (e.key === 'Tab') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.execCommand('outdent');
                    } else {
                        this.execCommand('indent');
                    }
                }
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    const selectedImg = this.editor.querySelector('img.selected');
                    if (selectedImg) {
                        e.preventDefault();
                        this.deleteImage(selectedImg);
                    }
                }
            });
        }

        loadExistingContent() {
            if (this.hiddenField && this.hiddenField.value) {
                this.editor.innerHTML = this.hiddenField.value;
                
                // Setup du système d'images pour les images existantes
                setTimeout(() => {
                    this.setupImageSystem();
                }, 100);
            }
        }

        // ✅ NOUVEAU SYSTÈME D'IMAGES - VERSION STABLE
        setupImageSystem() {
            const images = this.editor.querySelectorAll('img');
            console.log(`🖼️ Configuration système images pour ${images.length} image(s)`);
            
            images.forEach(img => {
                this.makeImageStable(img);
            });
        }

        /**
         * Rend une image "stable" - elle ne bouge jamais de position
         */
        makeImageStable(img) {
            if (img.dataset.stableSetup === 'true') {
                return; // Déjà configurée
            }
            
            console.log('🔧 Configuration image stable:', img.src.substring(0, 50) + '...');
            
            // Marquer comme configurée
            img.dataset.stableSetup = 'true';
            
            // Ajouter les classes de base
            img.classList.add('stable-image');
            
            // Forcer les styles d'alignement selon les classes existantes
            this.applyStableImageStyles(img);
            
            // Créer un conteneur stable pour l'image
            this.createStableImageContainer(img);
            
            // Configurer les événements
            this.setupStableImageEvents(img);
        }

        /**
         * Applique les styles d'alignement de façon stable
         */
        applyStableImageStyles(img) {
            // Détecter l'alignement souhaité
            let alignment = 'default';
            
            if (img.classList.contains('align-left') || img.classList.contains('wrap-left')) {
                alignment = 'left';
            } else if (img.classList.contains('align-right') || img.classList.contains('wrap-right')) {
                alignment = 'right';
            } else if (img.classList.contains('align-center')) {
                alignment = 'center';
            }
            
            // Stocker l'alignement comme attribut
            img.dataset.alignment = alignment;
            
            // Appliquer les styles correspondants
            this.setImageAlignment(img, alignment);
        }

        /**
         * Définit l'alignement d'une image de façon permanente
         */
        setImageAlignment(img, alignment) {
            console.log(`📍 Application alignement "${alignment}" sur image`);
            
            // Supprimer toutes les classes d'alignement existantes
            const alignmentClasses = ['align-left', 'align-right', 'align-center', 'wrap-left', 'wrap-right'];
            alignmentClasses.forEach(cls => img.classList.remove(cls));
            
            // Réinitialiser les styles
            img.style.float = '';
            img.style.margin = '';
            img.style.display = '';
            
            // Appliquer le nouvel alignement
            switch(alignment) {
                case 'left':
                    img.classList.add('align-left');
                    img.style.cssText = `
                        float: left !important;
                        margin: 5px 15px 15px 5px !important;
                        clear: left !important;
                        max-width: 50% !important;
                        height: auto !important;
                        display: block !important;
                        cursor: pointer !important;
                    `;
                    break;
                    
                case 'right':
                    img.classList.add('align-right');
                    img.style.cssText = `
                        float: right !important;
                        margin: 5px 5px 15px 15px !important;
                        clear: right !important;
                        max-width: 50% !important;
                        height: auto !important;
                        display: block !important;
                        cursor: pointer !important;
                    `;
                    break;
                    
                case 'center':
                    img.classList.add('align-center');
                    img.style.cssText = `
                        display: block !important;
                        margin: 15px auto !important;
                        float: none !important;
                        max-width: 100% !important;
                        height: auto !important;
                        cursor: pointer !important;
                    `;
                    break;
                    
                default:
                    img.style.cssText = `
                        display: inline-block !important;
                        margin: 10px 5px !important;
                        max-width: 100% !important;
                        height: auto !important;
                        cursor: pointer !important;
                    `;
            }
            
            // Maintenir la largeur personnalisée si elle existe
            if (img.dataset.customWidth) {
                img.style.width = img.dataset.customWidth;
            }
        }

        /**
         * Crée un conteneur stable qui ne change jamais la position de l'image
         */
        createStableImageContainer(img) {
            // Ne pas créer de wrapper qui pourrait changer la position
            // L'image reste exactement où elle est
            
            // Juste ajouter un overlay invisible pour la sélection
            const overlay = document.createElement('div');
            overlay.className = 'image-selection-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border: 3px solid transparent;
                pointer-events: none;
                z-index: 100;
                border-radius: 4px;
                transition: border-color 0.2s ease;
            `;
            
            // Créer un conteneur relatif minimal
            const container = document.createElement('span');
            container.className = 'stable-image-container';
            container.style.cssText = `
                position: relative;
                display: inline-block;
                line-height: 0;
            `;
            
            // Insérer le conteneur sans changer la position de l'image
            img.parentNode.insertBefore(container, img);
            container.appendChild(img);
            container.appendChild(overlay);
            
            // Stocker les références
            img.dataset.overlay = 'true';
        }

        /**
         * Configure les événements pour une image stable
         */
        setupStableImageEvents(img) {
            // Clic pour sélectionner (SANS changer la position)
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectStableImage(img);
            });
            
            // Double-clic pour éditer
            img.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.editStableImage(img);
            });
            
            // Empêcher le drag
            img.addEventListener('dragstart', (e) => {
                e.preventDefault();
            });
        }

        /**
         * Sélectionne une image sans changer sa position
         */
        selectStableImage(img) {
            console.log('📌 Sélection image stable (position préservée)');
            
            // Désélectionner les autres
            this.deselectAllImages();
            
            // Marquer comme sélectionnée
            img.classList.add('selected');
            
            // Afficher la bordure de sélection via l'overlay
            const container = img.parentElement;
            if (container && container.classList.contains('stable-image-container')) {
                const overlay = container.querySelector('.image-selection-overlay');
                if (overlay) {
                    overlay.style.borderColor = '#007bff';
                    overlay.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.25)';
                }
            }
            
            // Ajouter la poignée de redimensionnement
            this.addStableResizeHandle(img);
        }

        /**
         * Désélectionne toutes les images
         */
        deselectAllImages() {
            this.editor.querySelectorAll('img.selected').forEach(img => {
                img.classList.remove('selected');
                
                // Cacher l'overlay
                const container = img.parentElement;
                if (container && container.classList.contains('stable-image-container')) {
                    const overlay = container.querySelector('.image-selection-overlay');
                    if (overlay) {
                        overlay.style.borderColor = 'transparent';
                        overlay.style.boxShadow = 'none';
                    }
                }
                
                // Supprimer la poignée
                this.removeStableResizeHandle(img);
            });
        }

        /**
         * Ajoute une poignée de redimensionnement stable
         */
        addStableResizeHandle(img) {
            this.removeStableResizeHandle(img); // Supprimer l'ancienne
            
            const container = img.parentElement;
            if (!container || !container.classList.contains('stable-image-container')) {
                return;
            }
            
            const handle = document.createElement('div');
            handle.className = 'resize-handle-new';
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
            
            // Événement de redimensionnement
            this.setupStableResize(handle, img);
            
            container.appendChild(handle);
        }

        /**
         * Supprime la poignée de redimensionnement
         */
        removeStableResizeHandle(img) {
            const container = img.parentElement;
            if (container && container.classList.contains('stable-image-container')) {
                const handle = container.querySelector('.resize-handle-new');
                if (handle) {
                    handle.remove();
                }
            }
        }

        /**
         * Configure le redimensionnement stable (sans changer la position)
         */
        setupStableResize(handle, img) {
            let isResizing = false;
            let startX, startWidth, startHeight, aspectRatio;
            
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                isResizing = true;
                startX = e.clientX;
                startWidth = img.offsetWidth;
                startHeight = img.offsetHeight;
                aspectRatio = startHeight / startWidth;
                
                document.body.style.cursor = 'se-resize';
                document.body.style.userSelect = 'none';
                
                console.log('🎯 Début redimensionnement stable');
            });
            
            const handleMouseMove = (e) => {
                if (!isResizing) return;
                
                e.preventDefault();
                
                const deltaX = e.clientX - startX;
                const newWidth = Math.max(50, Math.min(startWidth + deltaX, 600));
                
                // Appliquer la nouvelle taille SANS changer l'alignement
                img.style.width = newWidth + 'px';
                img.style.height = 'auto';
                
                // Stocker la largeur personnalisée
                img.dataset.customWidth = newWidth + 'px';
            };
            
            const handleMouseUp = () => {
                if (isResizing) {
                    isResizing = false;
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                    
                    // RE-FORCER l'alignement après redimensionnement
                    const alignment = img.dataset.alignment || 'default';
                    this.setImageAlignment(img, alignment);
                    
                    this.updateHiddenField();
                    
                    console.log(`✅ Redimensionnement terminé: ${img.style.width}, alignement préservé`);
                }
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        /**
         * Édite une image stable
         */
        editStableImage(img) {
            this.saveSelection();
            
            // Pré-remplir les champs avec les valeurs actuelles
            document.getElementById('imageUrl').value = img.src;
            document.getElementById('imageAlt').value = img.alt || '';
            
            // Déterminer l'alignement actuel
            const alignment = img.dataset.alignment || 'default';
            const alignSelect = document.getElementById('imageAlign');
            if (alignSelect) {
                alignSelect.value = alignment === 'default' ? '' : alignment;
            }
            
            // Largeur actuelle
            const widthInput = document.getElementById('imageWidth');
            if (widthInput && img.dataset.customWidth) {
                widthInput.value = parseInt(img.dataset.customWidth);
            }
            
            // Mode d'habillage
            const wrapSelect = document.getElementById('imageWrap');
            if (wrapSelect) {
                wrapSelect.value = 'none'; // Pour l'instant, mode simple
            }
            
            // Activer l'onglet URL
            const urlTab = document.getElementById('url-tab');
            const urlTabPane = document.getElementById('url');
            const uploadTab = document.getElementById('upload-tab');
            const uploadTabPane = document.getElementById('upload');
            
            if (urlTab && urlTabPane) {
                uploadTab.classList.remove('active');
                uploadTabPane.classList.remove('show', 'active');
                urlTab.classList.add('active');
                urlTabPane.classList.add('show', 'active');
                
                // Prévisualiser l'image
                this.previewImageUrl(img.src);
            }
            
            // Marquer l'image en cours d'édition
            this.editingImage = img;
            
            // Ouvrir la modale
            const modal = new bootstrap.Modal(document.getElementById('imageModal'));
            modal.show();
            
            console.log('✏️ Édition image stable ouverte');
        }

        /**
         * Met à jour une image existante en préservant sa stabilité
         */
        updateStableImage(img, src, alt, align, width) {
            console.log('🔄 Mise à jour image stable');
            
            // Mettre à jour les propriétés de base
            img.src = src;
            img.alt = alt;
            
            // Mettre à jour l'alignement
            const newAlignment = align || 'default';
            img.dataset.alignment = newAlignment;
            this.setImageAlignment(img, newAlignment);
            
            // Mettre à jour la largeur
            if (width) {
                img.dataset.customWidth = width + 'px';
                img.style.width = width + 'px';
                img.style.height = 'auto';
            }
            
            // Réappliquer l'alignement pour être sûr
            setTimeout(() => {
                this.setImageAlignment(img, newAlignment);
            }, 50);
            
            this.editingImage = null;
            console.log('✅ Image stable mise à jour avec succès');
        }

        /**
         * Supprime une image
         */
        deleteImage(img) {
            const container = img.parentElement;
            if (container && container.classList.contains('stable-image-container')) {
                container.remove();
            } else {
                img.remove();
            }
            this.updateHiddenField();
        }

        // ✅ GESTION DES MODALES ET INSERTION

        showImageModal() {
            this.saveSelection();
            
            const modal = new bootstrap.Modal(document.getElementById('imageModal'));
            modal.show();
            
            // Reset des formulaires
            document.getElementById('imageUrl').value = '';
            document.getElementById('imageFileInput').value = '';
            document.getElementById('uploadPreview').innerHTML = '';
            document.getElementById('urlPreview').innerHTML = '';
            document.getElementById('imageConfig').style.display = 'none';
            document.getElementById('insertImageBtn').disabled = true;
            
            this.setupImageModalEvents();
        }
        
        setupImageModalEvents() {
            if (this.imageEventsSetup) return;
            this.imageEventsSetup = true;
            
            document.getElementById('imageUrl')?.addEventListener('input', (e) => {
                this.previewImageUrl(e.target.value);
            });

            document.getElementById('imageFileInput')?.addEventListener('change', (e) => {
                this.handleImageUpload(e.target.files);
            });

            const uploadZone = document.getElementById('imageUploadZone');
            if (uploadZone) {
                uploadZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('dragover');
                });
                uploadZone.addEventListener('dragleave', (e) => {
                    e.currentTarget.classList.remove('dragover');
                });
                uploadZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('dragover');
                    this.handleImageUpload(e.dataTransfer.files);
                });
            }

            document.getElementById('insertImageBtn')?.addEventListener('click', () => {
                this.insertStableImage();
            });
        }
        
        previewImageUrl(url) {
            const preview = document.getElementById('urlPreview');
            const config = document.getElementById('imageConfig');
            const insertBtn = document.getElementById('insertImageBtn');
            
            if (!url) {
                preview.innerHTML = '';
                config.style.display = 'none';
                insertBtn.disabled = true;
                return;
            }
            
            preview.innerHTML = `
                <div class="preview-item">
                    <img src="${url}" alt="Aperçu" 
                         onerror="this.parentElement.innerHTML='<p class=text-danger>Impossible de charger l\\'image</p>'">
                </div>
            `;
            config.style.display = 'block';
            insertBtn.disabled = false;
        }
        
        handleImageUpload(files) {
            if (!files.length) return;
            
            const preview = document.getElementById('uploadPreview');
            const config = document.getElementById('imageConfig');
            const insertBtn = document.getElementById('insertImageBtn');
            
            preview.innerHTML = '';
            
            Array.from(files).forEach((file) => {
                if (!file.type.startsWith('image/')) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}">
                        <div class="preview-info">
                            <div>${file.name}</div>
                            <small>${(file.size / 1024).toFixed(1)} KB</small>
                        </div>
                        <button type="button" class="remove-btn" onclick="this.parentElement.remove(); window.richEditor.checkImagePreview();">
                            <i class="bi bi-x"></i>
                        </button>
                    `;
                    preview.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            });
            
            config.style.display = 'block';
            insertBtn.disabled = false;
        }
        
        checkImagePreview() {
            const preview = document.getElementById('uploadPreview');
            const insertBtn = document.getElementById('insertImageBtn');
            const config = document.getElementById('imageConfig');
            
            if (preview && preview.children.length === 0) {
                insertBtn.disabled = true;
                config.style.display = 'none';
            }
        }
        
        /**
         * Insère une nouvelle image stable
         */
        insertStableImage() {
            const urlTab = document.getElementById('url');
            const uploadTab = document.getElementById('upload');
            
            let imageSrc = '';
            let altText = document.getElementById('imageAlt').value || '';
            let align = document.getElementById('imageAlign').value || '';
            let width = document.getElementById('imageWidth').value || '';
            
            // Déterminer la source de l'image
            if (urlTab && urlTab.classList.contains('show')) {
                imageSrc = document.getElementById('imageUrl').value;
            } else if (uploadTab && uploadTab.classList.contains('show')) {
                const previewImg = document.querySelector('#uploadPreview img');
                if (previewImg) {
                    imageSrc = previewImg.src;
                }
            }
            
            if (!imageSrc) {
                alert('Veuillez sélectionner une image.');
                return;
            }
            
            // Si on modifie une image existante
            if (this.editingImage) {
                this.updateStableImage(this.editingImage, imageSrc, altText, align, width);
            } else {
                this.createNewStableImage(imageSrc, altText, align, width);
            }
            
            // Mettre à jour le champ caché
            this.updateHiddenField();
            
            // Fermer la modale
            bootstrap.Modal.getInstance(document.getElementById('imageModal')).hide();
            
            console.log('✅ Image stable insérée/mise à jour');
        }

        /**
         * Crée une nouvelle image stable
         */
        createNewStableImage(src, alt, align, width) {
            // Créer l'image
            const img = document.createElement('img');
            img.src = src;
            if (alt) img.alt = alt;
            
            // Définir l'alignement
            const alignment = align || 'default';
            img.dataset.alignment = alignment;
            
            // Définir la largeur personnalisée
            if (width) {
                img.dataset.customWidth = width + 'px';
            }
            
            // Insérer dans l'éditeur
            this.restoreSelection();
            this.execCommand('insertHTML', img.outerHTML);
            
            // Configurer l'image après insertion
            setTimeout(() => {
                const newImg = this.editor.querySelector(`img[src="${src}"]:not([data-stable-setup="true"])`);
                if (newImg) {
                    this.makeImageStable(newImg);
                }
            }, 100);
        }

        // ✅ MÉTHODES UTILITAIRES ET DEBUG

        updateHiddenField() {
            if (this.hiddenField) {
                this.hiddenField.value = this.editor.innerHTML;
                console.log('💾 Contenu sauvé avec système images stable');
            }
        }

        debugImageStyles() {
            console.log('🔍 === DEBUG SYSTÈME IMAGES STABLE ===');
            const images = this.editor.querySelectorAll('img');
            
            images.forEach((img, index) => {
                console.log(`--- IMAGE ${index + 1} ---`);
                console.log('SRC:', img.src.substring(0, 50) + '...');
                console.log('Classes:', img.className);
                console.log('Alignment:', img.dataset.alignment);
                console.log('Custom Width:', img.dataset.customWidth);
                console.log('Style inline:', img.style.cssText);
                
                const computed = window.getComputedStyle(img);
                console.log('Float computed:', computed.float);
                console.log('Container:', img.parentElement.className);
            });
            
            console.log('🔍 === FIN DEBUG ===');
        }

        // ✅ MÉTHODES STANDARD (inchangées)

        saveSelection() {
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && this.editor.contains(selection.focusNode)) {
                this.currentRange = selection.getRangeAt(0).cloneRange();
            }
        }

        restoreSelection() {
            if (this.currentRange) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                try {
                    selection.addRange(this.currentRange);
                } catch (e) {
                    this.editor.focus();
                }
            } else {
                this.editor.focus();
            }
        }

        execCommand(command, value = null) {
            this.editor.focus();
            
            if (this.currentRange) {
                this.restoreSelection();
            }
            
            try {
                const success = document.execCommand(command, false, value);
                if (!success) {
                    console.warn('Commande échouée:', command);
                }
            } catch (e) {
                console.error('Erreur lors de l\'exécution de la commande:', command, e);
            }
            
            this.updateToolbar();
            this.updateHiddenField();
            
            setTimeout(() => {
                this.saveSelection();
            }, 10);
        }

        applyFormat(tag) {
            this.editor.focus();
            if (this.currentRange) {
                this.restoreSelection();
            }
            
            try {
                const success = document.execCommand('formatBlock', false, tag);
                if (!success) {
                    document.execCommand('formatBlock', false, `<${tag}>`);
                }
            } catch (e) {
                console.error('Error applying format:', tag, e);
            }
            
            this.updateHiddenField();
            
            setTimeout(() => {
                this.updateToolbar();
                this.saveSelection();
            }, 10);
        }

        applyTextColor(color) {
            this.execCommand('foreColor', color);
        }

        updateToolbar() {
            const commands = ['bold', 'italic', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'];
            commands.forEach(command => {
                const btn = this.toolbar.querySelector(`[data-command="${command}"]`);
                if (btn) {
                    try {
                        const isActive = document.queryCommandState(command);
                        btn.classList.toggle('active', isActive);
                    } catch (e) {
                        // Ignorer les erreurs de queryCommandState
                    }
                }
            });
            
            this.updateFormatSelector();
        }
        
        updateFormatSelector() {
            const formatSelect = document.getElementById('formatSelect');
            if (!formatSelect) return;
            
            try {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    let element = selection.anchorNode;
                    
                    while (element && element.nodeType === Node.TEXT_NODE) {
                        element = element.parentElement;
                    }
                    
                    while (element && element !== this.editor) {
                        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
                        
                        const supportedFormats = ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'div'];
                        if (supportedFormats.includes(tagName)) {
                            for (let option of formatSelect.options) {
                                if (option.value === tagName || 
                                   (tagName === 'div' && option.value === 'p')) {
                                    formatSelect.value = option.value;
                                    return;
                                }
                            }
                        }
                        element = element.parentElement;
                    }
                }
                
                formatSelect.value = '';
            } catch (e) {
                formatSelect.value = '';
            }
        }

        insertSimpleLink() {
            this.saveSelection();
            
            const selectedText = this.currentRange ? this.currentRange.toString() : '';
            
            const url = prompt('Entrez l\'URL du lien:');
            if (url) {
                const text = prompt('Texte du lien (optionnel):', selectedText) || url;
                
                this.restoreSelection();
                const linkHTML = `<a href="${url}" target="_blank">${text}</a>`;
                this.execCommand('insertHTML', linkHTML);
            } else {
                this.restoreSelection();
            }
        }

        // Méthodes publiques
        getContent() {
            return this.editor.innerHTML;
        }

        setContent(content) {
            this.editor.innerHTML = content;
            this.updateHiddenField();
            setTimeout(() => {
                this.setupImageSystem();
            }, 100);
        }

        clear() {
            this.editor.innerHTML = '';
            this.updateHiddenField();
        }

        focus() {
            this.editor.focus();
        }

        // Méthodes vides pour la compatibilité (vidéos non implémentées dans cette version)
        showVideoModal() {
            alert('Fonction vidéo à implémenter dans une version ultérieure');
        }
    }

    // Initialisation automatique
    document.addEventListener('DOMContentLoaded', function() {
        const editorContainer = document.getElementById('richEditorContainer');
        if (editorContainer) {
            window.richEditor = new SimpleRichEditor('richEditorContainer');
        }
    });

    window.SimpleRichEditor = SimpleRichEditor;

})(window);