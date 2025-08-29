/**
 * SimpleRichEditor - Version corrigée pour la persistance des alignements d'images
 * PROBLÈME RÉSOLU : Les images gardent maintenant leur alignement après validation
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
                this.setupImageResizing();
                this.setupVideoInteractions();
            }, 500);
            
            console.log('✅ SimpleRichEditor initialisé - Version avec correction alignement images');
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
                if (!e.target.classList.contains('editor-image') && 
                    !e.target.classList.contains('resize-handle')) {
                    this.editor.querySelectorAll('img.selected').forEach(img => {
                        img.classList.remove('selected');
                        this.removeResizeHandle(img);
                    });
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
                        this.deleteSelectedImage();
                    }
                }
            });
        }

        loadExistingContent() {
            if (this.hiddenField && this.hiddenField.value) {
                this.editor.innerHTML = this.hiddenField.value;
                
                // Setup du redimensionnement pour les images existantes
                setTimeout(() => {
                    this.setupImageResizing();
                    
                    // NOUVEAU: Restaurer l'interactivité des images existantes
                    if (window.ImageInteractivityRestorer) {
                        window.ImageInteractivityRestorer.restore();
                        console.log('🔄 Interactivité des images existantes restaurée');
                    }
                }, 100);
            }
        }

        // ✅ CORRECTION: updateHiddenField avec vérification des styles
        updateHiddenField() {
            if (this.hiddenField) {
                // Vérifier et corriger les styles avant la sauvegarde
                this.editor.querySelectorAll('img.editor-image').forEach(img => {
                    this.forceImageStylePersistence(img);
                });
                
                // Attendre que les corrections soient appliquées
                setTimeout(() => {
                    this.hiddenField.value = this.editor.innerHTML;
                    console.log('💾 Contenu sauvé avec styles d\'images vérifiés');
                }, 50);
            }
        }

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
                    console.warn('Impossible de restaurer la sélection:', e);
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

        // === GESTION DES IMAGES - VERSION CORRIGÉE ===
        
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
                this.insertImage();
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
        
        insertImage() {
            const urlTab = document.getElementById('url');
            const uploadTab = document.getElementById('upload');
            
            let imageSrc = '';
            let altText = document.getElementById('imageAlt').value || '';
            let align = document.getElementById('imageAlign').value || '';
            let width = document.getElementById('imageWidth').value || '';
            let wrapMode = document.getElementById('imageWrap').value || 'none';
            
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
                this.updateExistingImage(this.editingImage, imageSrc, altText, align, width, wrapMode);
            } else {
                this.createNewImage(imageSrc, altText, align, width, wrapMode);
            }
            
            // Mettre à jour le champ caché
            this.updateHiddenField();
            
            // Fermer la modale
            bootstrap.Modal.getInstance(document.getElementById('imageModal')).hide();
            
            // Setup du redimensionnement pour les nouvelles images
            setTimeout(() => this.setupImageResizing(), 100);
        }

        // ✅ CORRECTION: Méthode applyImageStyle avec styles inline forcés
        applyImageStyle(img, align, wrapMode) {
            // SUPPRESSION des anciennes classes pour éviter les conflits
            const oldClasses = ['align-left', 'align-center', 'align-right', 'wrap-left', 'wrap-right', 'wrap-both', 'background'];
            oldClasses.forEach(cls => img.classList.remove(cls));
            
            // Sauvegarder la largeur existante
            const existingWidth = img.style.width;
            
            // Ajouter la classe pour référence, mais SURTOUT appliquer les styles inline
            switch(wrapMode) {
                case 'wrap-left':
                    img.classList.add('wrap-left');
                    img.style.cssText = `
                        float: left !important;
                        margin: 5px 15px 10px 5px !important;
                        clear: left !important;
                        max-width: 50% !important;
                        height: auto !important;
                        display: block !important;
                        cursor: pointer !important;
                        position: static !important;
                        ${existingWidth ? `width: ${existingWidth} !important;` : ''}
                    `;
                    break;
                case 'wrap-right':
                    img.classList.add('wrap-right');
                    img.style.cssText = `
                        float: right !important;
                        margin: 5px 5px 10px 15px !important;
                        clear: right !important;
                        max-width: 50% !important;
                        height: auto !important;
                        display: block !important;
                        cursor: pointer !important;
                        position: static !important;
                        ${existingWidth ? `width: ${existingWidth} !important;` : ''}
                    `;
                    break;
                case 'wrap-both':
                    img.classList.add('wrap-both');
                    img.style.cssText = `
                        float: left !important;
                        margin: 5px 15px 10px 5px !important;
                        clear: none !important;
                        max-width: 40% !important;
                        height: auto !important;
                        display: block !important;
                        cursor: pointer !important;
                        position: static !important;
                        ${existingWidth ? `width: ${existingWidth} !important;` : ''}
                    `;
                    break;
                case 'background':
                    img.classList.add('background');
                    // Le mode background est géré différemment dans insertImageWithWrap
                    break;
                default: // 'none' ou alignement classique
                    if (align === 'left') {
                        img.classList.add('align-left');
                        img.style.cssText = `
                            float: left !important;
                            margin: 5px 15px 15px 5px !important;
                            clear: left !important;
                            max-width: 50% !important;
                            height: auto !important;
                            display: block !important;
                            cursor: pointer !important;
                            position: static !important;
                            ${existingWidth ? `width: ${existingWidth} !important;` : ''}
                        `;
                    } else if (align === 'right') {
                        img.classList.add('align-right');
                        img.style.cssText = `
                            float: right !important;
                            margin: 5px 5px 15px 15px !important;
                            clear: right !important;
                            max-width: 50% !important;
                            height: auto !important;
                            display: block !important;
                            cursor: pointer !important;
                            position: static !important;
                            ${existingWidth ? `width: ${existingWidth} !important;` : ''}
                        `;
                    } else if (align === 'center') {
                        img.classList.add('align-center');
                        img.style.cssText = `
                            display: block !important;
                            margin: 15px auto !important;
                            float: none !important;
                            max-width: 100% !important;
                            height: auto !important;
                            cursor: pointer !important;
                            position: static !important;
                            ${existingWidth ? `width: ${existingWidth} !important;` : ''}
                        `;
                    } else {
                        // Par défaut
                        img.style.cssText = `
                            display: inline-block !important;
                            margin: 10px 0 !important;
                            max-width: 100% !important;
                            height: auto !important;
                            float: none !important;
                            cursor: pointer !important;
                            position: static !important;
                            ${existingWidth ? `width: ${existingWidth} !important;` : ''}
                        `;
                    }
            }
            
            console.log('✅ Styles inline appliqués pour alignement persistant');
        }

        // ✅ CORRECTION: updateExistingImage avec persistance forcée
        updateExistingImage(img, src, alt, align, width, wrapMode) {
            img.src = src;
            img.alt = alt;
            
            // Sauvegarder la largeur actuelle si elle existe
            const currentWidth = img.style.width;
            
            // Appliquer le nouveau style (qui inclut déjà les styles inline)
            this.applyImageStyle(img, align, wrapMode);
            
            // Mettre à jour la largeur si spécifiée, sinon conserver l'actuelle
            if (width) {
                img.style.width = width + 'px';
                img.style.height = 'auto';
            } else if (currentWidth) {
                img.style.width = currentWidth;
            }
            
            // ✅ FORCER la réapplication des styles pour garantir la persistance
            this.forceImageStylePersistence(img);
            
            this.editingImage = null;
            console.log('✅ Image existante mise à jour avec styles persistants');
        }

        // ✅ NOUVELLE MÉTHODE: Forcer la persistance des styles
        forceImageStylePersistence(img) {
            // Attendre que le DOM soit stable puis réappliquer les styles
            setTimeout(() => {
                const currentStyle = img.style.cssText;
                if (currentStyle) {
                    // Forcer la réapplication en recréant le style
                    img.style.cssText = '';
                    img.style.cssText = currentStyle;
                }
            }, 50);
            
            // Vérifier après la mise à jour du champ caché
            setTimeout(() => {
                if (!img.style.float && (img.classList.contains('align-left') || img.classList.contains('wrap-left'))) {
                    console.warn('⚠️ Styles perdus détectés - réapplication forcée');
                    // Réappliquer selon les classes présentes
                    if (img.classList.contains('align-left') || img.classList.contains('wrap-left')) {
                        img.style.float = 'left';
                        img.style.marginRight = '15px';
                    } else if (img.classList.contains('align-right') || img.classList.contains('wrap-right')) {
                        img.style.float = 'right';
                        img.style.marginLeft = '15px';
                    }
                }
            }, 200);
        }
        
        createNewImage(src, alt, align, width, wrapMode) {
            const img = document.createElement('img');
            img.src = src;
            if (alt) img.alt = alt;
            img.className = 'editor-image resizable';
            
            // Appliquer les styles (inclut déjà les styles inline)
            this.applyImageStyle(img, align, wrapMode);
            
            if (width) {
                img.style.width = width + 'px';
            }
            
            // Insérer l'image selon le mode d'habillage
            this.insertImageWithWrap(img, wrapMode);
        }
        
        insertImageWithWrap(img, wrapMode) {
            this.restoreSelection();
            
            if (wrapMode === 'background') {
                // Pour l'arrière-plan, créer un conteneur spécial
                const container = document.createElement('div');
                container.className = 'background-image-container';
                container.style.cssText = `
                    position: relative;
                    min-height: 200px;
                    padding: 20px;
                    margin: 20px 0;
                    border: 2px dashed #ccc;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-image: url('${img.src}');
                `;
                
                const textNode = document.createElement('div');
                textNode.contentEditable = true;
                textNode.style.cssText = `
                    position: relative;
                    z-index: 2;
                    color: #333;
                    font-weight: bold;
                    text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
                    padding: 10px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 5px;
                `;
                textNode.innerHTML = 'Tapez votre texte ici. L\'image est maintenant en arrière-plan.';
                
                container.appendChild(textNode);
                container.setAttribute('data-bg-image', img.src);
                
                this.execCommand('insertHTML', container.outerHTML);
                console.log('Image en arrière-plan insérée avec conteneur');
            } else {
                // Insertion normale
                this.execCommand('insertHTML', img.outerHTML);
            }
        }

        // ✅ AMÉLIORATION: setupImageResizing avec persistance forcée
        setupImageResizing() {
            const images = this.editor.querySelectorAll('img.editor-image');
            images.forEach(img => {
                if (!img.dataset.eventsSetup) {
                    img.dataset.eventsSetup = 'true';
                    
                    // ✅ FORCER la persistance des styles au setup
                    this.forceImageStylePersistence(img);
                    
                    // Gestion des clics sur l'image
                    img.addEventListener('click', (e) => {
                        if (img.classList.contains('selected')) {
                            const wrapper = img.parentElement;
                            if (wrapper && wrapper.classList.contains('image-wrapper')) {
                                const handle = wrapper.querySelector('.resize-handle');
                                if (handle) {
                                    const rect = handle.getBoundingClientRect();
                                    const clickX = e.clientX;
                                    const clickY = e.clientY;
                                    
                                    if (clickX >= rect.left && clickX <= rect.right &&
                                        clickY >= rect.top && clickY <= rect.bottom) {
                                        return;
                                    }
                                }
                            }
                        }
                        
                        e.preventDefault();
                        e.stopPropagation();
                        this.selectImage(img);
                    });
                    
                    // Double-clic pour modifier
                    img.addEventListener('dblclick', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.editImage(img);
                    });
                    
                    console.log('✅ Events setup pour image avec styles persistants');
                }
            });
        }

        // ✅ NOUVELLE MÉTHODE: Debug complet des styles d'images
        debugImageStyles() {
            console.log('🔍 === DEBUG STYLES D\'IMAGES ===');
            const images = this.editor.querySelectorAll('img.editor-image');
            
            images.forEach((img, index) => {
                console.log(`--- IMAGE ${index + 1} ---`);
                console.log('SRC:', img.src.substring(0, 50) + '...');
                console.log('Classes:', img.className);
                console.log('Style inline:', img.style.cssText);
                
                const computed = window.getComputedStyle(img);
                console.log('Float computed:', computed.float);
                console.log('Margin computed:', computed.margin);
                console.log('Display computed:', computed.display);
                
                // Vérifier la cohérence
                if ((img.classList.contains('align-left') || img.classList.contains('wrap-left')) && computed.float !== 'left') {
                    console.warn('❌ INCOHÉRENCE: Image devrait flotter à gauche');
                }
                if ((img.classList.contains('align-right') || img.classList.contains('wrap-right')) && computed.float !== 'right') {
                    console.warn('❌ INCOHÉRENCE: Image devrait flotter à droite');
                }
            });
            
            console.log('🔍 === FIN DEBUG ===');
        }

        // Reste des méthodes (inchangées mais incluses pour completude)
        selectImage(img) {
            this.editor.querySelectorAll('img.selected').forEach(i => {
                i.classList.remove('selected');
                this.removeResizeHandle(i);
            });
            
            img.classList.add('selected');
            this.addResizeHandle(img);
            this.setupImageDragResize(img);
        }
        
        addResizeHandle(img) {
            const existingHandle = img.parentNode.querySelector('.resize-handle');
            if (existingHandle) {
                existingHandle.remove();
            }
            
            if (img.parentElement.classList.contains('image-wrapper')) {
                const handle = this.createResizeHandle();
                img.parentElement.appendChild(handle);
                return;
            }
            
            const wrapper = document.createElement('span');
            wrapper.className = 'image-wrapper';
            wrapper.style.cssText = `
                position: relative;
                display: inline-block;
                line-height: 0;
            `;
            
            const parent = img.parentNode;
            const nextSibling = img.nextSibling;
            
            parent.removeChild(img);
            wrapper.appendChild(img);
            
            if (nextSibling) {
                parent.insertBefore(wrapper, nextSibling);
            } else {
                parent.appendChild(wrapper);
            }
            
            const handle = this.createResizeHandle();
            wrapper.appendChild(handle);
        }
        
        createResizeHandle() {
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
                border-radius: 3px;
                cursor: se-resize;
                font-size: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                z-index: 1001;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                user-select: none;
                pointer-events: auto;
            `;
            return handle;
        }
        
        removeResizeHandle(img) {
            const wrapper = img.parentNode;
            if (wrapper && wrapper.classList.contains('image-wrapper')) {
                const handle = wrapper.querySelector('.resize-handle');
                if (handle) {
                    handle.remove();
                    
                    const parent = wrapper.parentNode;
                    parent.insertBefore(img, wrapper);
                    wrapper.remove();
                }
            }
        }
        
        setupImageDragResize(img) {
            if (img.dataset.resizeSetup === 'true') {
                return;
            }
            
            img.dataset.resizeSetup = 'true';
            
            let isResizing = false;
            let startX, startWidth;
            
            const handleMouseMove = (e) => {
                if (!isResizing) return;
                
                e.preventDefault();
                
                const deltaX = e.clientX - startX;
                let newWidth = Math.max(50, startWidth + deltaX);
                
                const containerWidth = this.editor.offsetWidth;
                let maxWidth = containerWidth;
                
                if (img.classList.contains('wrap-left') || img.classList.contains('wrap-right')) {
                    maxWidth = containerWidth * 0.6;
                } else if (img.classList.contains('wrap-both')) {
                    maxWidth = containerWidth * 0.5;
                } else {
                    maxWidth = containerWidth * 0.9;
                }
                
                newWidth = Math.min(newWidth, maxWidth);
                
                img.style.width = newWidth + 'px';
                img.style.height = 'auto';
            };
            
            const handleMouseUp = (e) => {
                if (isResizing) {
                    isResizing = false;
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    
                    document.body.style.cursor = '';
                    
                    // ✅ FORCER la persistance après redimensionnement
                    this.forceImageStylePersistence(img);
                    this.updateHiddenField();
                }
            };
            
            const handleResizeStart = (e) => {
                if (e.target.classList.contains('resize-handle')) {
                    const wrapper = e.target.parentNode;
                    const relatedImg = wrapper ? wrapper.querySelector('img.editor-image') : null;
                    
                    if (relatedImg && relatedImg === img) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        isResizing = true;
                        startX = e.clientX;
                        startWidth = img.offsetWidth;
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                        
                        document.body.style.cursor = 'se-resize';
                    }
                }
            };
            
            document.addEventListener('mousedown', handleResizeStart);
        }
        
        editImage(img) {
            this.saveSelection();
            
            document.getElementById('imageUrl').value = img.src;
            document.getElementById('imageAlt').value = img.alt || '';
            
            let currentAlign = '';
            let currentWrap = 'none';
            
            if (img.classList.contains('wrap-left')) {
                currentWrap = 'wrap-left';
            } else if (img.classList.contains('wrap-right')) {
                currentWrap = 'wrap-right';
            } else if (img.classList.contains('wrap-both')) {
                currentWrap = 'wrap-both';
            } else if (img.classList.contains('background')) {
                currentWrap = 'background';
            } else {
                if (img.classList.contains('align-left')) currentAlign = 'left';
                else if (img.classList.contains('align-center')) currentAlign = 'center';
                else if (img.classList.contains('align-right')) currentAlign = 'right';
            }
            
            document.getElementById('imageAlign').value = currentAlign;
            document.getElementById('imageWrap').value = currentWrap;
            
            if (img.style.width) {
                document.getElementById('imageWidth').value = parseInt(img.style.width);
            } else {
                document.getElementById('imageWidth').value = '';
            }
            
            // Activer l'onglet URL et afficher la prévisualisation
            const urlTab = document.getElementById('url-tab');
            const urlTabPane = document.getElementById('url');
            const uploadTab = document.getElementById('upload-tab');
            const uploadTabPane = document.getElementById('upload');
            
            // Changer vers l'onglet URL
            uploadTab.classList.remove('active');
            uploadTabPane.classList.remove('show', 'active');
            urlTab.classList.add('active');
            urlTabPane.classList.add('show', 'active');
            
            // Prévisualiser l'image
            this.previewImageUrl(img.src);
            
            // Sauvegarder l'image en cours de modification
            this.editingImage = img;
            
            // Ouvrir la modale
            const modal = new bootstrap.Modal(document.getElementById('imageModal'));
            modal.show();
        }
        
        deleteSelectedImage() {
            const selectedImg = this.editor.querySelector('img.selected');
            if (selectedImg) {
                selectedImg.remove();
                this.updateHiddenField();
                console.log('Image supprimée');
            }
        }

        // === GESTION VIDÉOS (méthodes basiques) ===
        
        showVideoModal() {
            this.saveSelection();
            
            const modal = new bootstrap.Modal(document.getElementById('videoModal'));
            modal.show();
            
            document.getElementById('videoUrl').value = '';
            document.getElementById('videoPreview').innerHTML = '';
            document.getElementById('videoConfig').style.display = 'none';
            document.getElementById('insertVideoBtn').disabled = true;
            
            this.setupVideoModalEvents();
        }
        
        setupVideoModalEvents() {
            if (this.videoEventsSetup) return;
            this.videoEventsSetup = true;
            
            document.getElementById('videoUrl')?.addEventListener('input', (e) => {
                this.previewVideo(e.target.value);
            });
            
            document.getElementById('insertVideoBtn')?.addEventListener('click', () => {
                this.insertVideo();
            });
        }
        
        previewVideo(url) {
            const preview = document.getElementById('videoPreview');
            const config = document.getElementById('videoConfig');
            const insertBtn = document.getElementById('insertVideoBtn');
            
            if (!url) {
                preview.innerHTML = '';
                config.style.display = 'none';
                insertBtn.disabled = true;
                return;
            }
            
            const videoInfo = this.parseVideoUrl(url);
            
            if (!videoInfo) {
                preview.innerHTML = '<div class="alert alert-warning">URL vidéo non supportée ou invalide</div>';
                config.style.display = 'none';
                insertBtn.disabled = true;
                return;
            }
            
            preview.innerHTML = `
                <div class="video-preview-item">
                    <div class="ratio ratio-16x9">
                        <iframe src="${videoInfo.embedUrl}" frameborder="0" allowfullscreen></iframe>
                    </div>
                    <div class="preview-info mt-2">
                        <strong>${videoInfo.platform}</strong> - ${videoInfo.id}
                    </div>
                </div>
            `;
            
            config.style.display = 'block';
            insertBtn.disabled = false;
        }
        
        parseVideoUrl(url) {
            // YouTube
            let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
            if (match) {
                return {
                    platform: 'YouTube',
                    id: match[1],
                    embedUrl: `https://www.youtube.com/embed/${match[1]}`,
                    originalUrl: url
                };
            }
            
            // Vimeo
            match = url.match(/vimeo\.com\/(\d+)/);
            if (match) {
                return {
                    platform: 'Vimeo',
                    id: match[1],
                    embedUrl: `https://player.vimeo.com/video/${match[1]}`,
                    originalUrl: url
                };
            }
            
            // Dailymotion
            match = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9_-]+)/);
            if (match) {
                return {
                    platform: 'Dailymotion',
                    id: match[1],
                    embedUrl: `https://www.dailymotion.com/embed/video/${match[1]}`,
                    originalUrl: url
                };
            }
            
            return null;
        }
        
        insertVideo() {
            const url = document.getElementById('videoUrl').value;
            const width = document.getElementById('videoWidth').value || 560;
            const height = document.getElementById('videoHeight').value || 315;
            const align = document.getElementById('videoAlign').value || 'center';
            const autoplay = document.getElementById('videoAutoplay').checked;
            
            const videoInfo = this.parseVideoUrl(url);
            
            if (!videoInfo) {
                alert('URL vidéo invalide.');
                return;
            }
            
            let embedUrl = videoInfo.embedUrl;
            
            if (autoplay) {
                const separator = embedUrl.includes('?') ? '&' : '?';
                embedUrl += separator + 'autoplay=1';
            }
            
            const videoContainer = document.createElement('div');
            videoContainer.className = `video-container video-${align}`;
            videoContainer.style.cssText = `
                width: ${width}px;
                max-width: 100%;
                margin: 20px ${align === 'center' ? 'auto' : (align === 'right' ? '0 0 20px 20px' : '0 20px 20px 0')};
                ${align === 'left' ? 'float: left;' : ''}
                ${align === 'right' ? 'float: right;' : ''}
            `;
            
            videoContainer.innerHTML = `
                <div class="ratio" style="--bs-aspect-ratio: ${(height/width*100).toFixed(2)}%">
                    <iframe src="${embedUrl}" 
                            frameborder="0" 
                            allowfullscreen 
                            data-video-platform="${videoInfo.platform.toLowerCase()}"
                            data-video-id="${videoInfo.id}"
                            data-original-url="${videoInfo.originalUrl}">
                    </iframe>
                </div>
            `;
            
            this.restoreSelection();
            this.execCommand('insertHTML', videoContainer.outerHTML);
            
            bootstrap.Modal.getInstance(document.getElementById('videoModal')).hide();
            this.updateHiddenField();
        }
        
        setupVideoInteractions() {
            const videoContainers = this.editor.querySelectorAll('.video-container');
            videoContainers.forEach(container => {
                if (!container.dataset.eventsSetup) {
                    container.dataset.eventsSetup = 'true';
                    
                    container.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.selectVideo(container);
                    });
                    
                    container.addEventListener('dblclick', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Double-clic détecté sur vidéo pour édition');
                    });
                }
            });
        }
        
        selectVideo(container) {
            this.editor.querySelectorAll('.video-container.selected').forEach(v => {
                v.classList.remove('selected');
            });
            
            this.editor.querySelectorAll('img.selected').forEach(img => {
                img.classList.remove('selected');
                this.removeResizeHandle(img);
            });
            
            container.classList.add('selected');
        }

        // API publique
        getContent() {
            return this.editor.innerHTML;
        }

        setContent(content) {
            this.editor.innerHTML = content;
            this.updateHiddenField();
            setTimeout(() => {
                this.setupImageResizing();
            }, 100);
        }

        clear() {
            this.editor.innerHTML = '';
            this.updateHiddenField();
        }

        focus() {
            this.editor.focus();
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