/**
 * RichEditor - Version simplifiée sans mode plein écran
 * Pour résoudre les problèmes de dimensionnement
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
            
            console.log('SimpleRichEditor initialized successfully');
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
            `;
        }

        setupEventListeners() {
            // Boutons de commande simples
            const commandButtons = this.toolbar.querySelectorAll('[data-command]');
            commandButtons.forEach(btn => {
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault(); // Empêcher la perte de focus
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
                formatSelect.addEventListener('mousedown', (e) => {
                    // Ne pas empêcher la perte de focus pour les select
                    // e.preventDefault();
                });
                
                formatSelect.addEventListener('change', (e) => {
                    if (e.target.value) {
                        this.applyFormat(e.target.value);
                        // Ne pas remettre à zéro immédiatement, laisser updateFormatSelector gérer
                        // setTimeout(() => e.target.value = '', 100);
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

            // Bouton lien
            const linkBtn = document.getElementById('linkBtn');
            if (linkBtn) {
                linkBtn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });
                linkBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.insertSimpleLink();
                });
            }
            
            // Bouton image
            const imageBtn = document.getElementById('imageBtn');
            if (imageBtn) {
                imageBtn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });
                imageBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showImageModal();
                });
            }
            
            // Bouton vidéo
            const videoBtn = document.getElementById('videoBtn');
            if (videoBtn) {
                videoBtn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });
                videoBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showVideoModal();
                });
            }

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
            
            // Sauvegarder la sélection avant que les boutons prennent le focus
            this.editor.addEventListener('blur', () => {
                // Petit délai pour permettre aux boutons de traiter le clic
                setTimeout(() => this.saveSelection(), 50);
            });
            
            // Clic ailleurs pour désélectionner les images
            this.editor.addEventListener('click', (e) => {
                // Si on ne clique pas sur une image ou une poignée, désélectionner
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
                // Gestion de la tabulation
                if (e.key === 'Tab') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        // Shift+Tab pour désindenter
                        this.execCommand('outdent');
                    } else {
                        // Tab pour indenter
                        this.execCommand('indent');
                    }
                }
                // Supprimer l'image sélectionnée avec la touche Suppr
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
                }, 100);
            }
        }

        updateHiddenField() {
            if (this.hiddenField) {
                this.hiddenField.value = this.editor.innerHTML;
            }
        }

        saveSelection() {
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && this.editor.contains(selection.focusNode)) {
                this.currentRange = selection.getRangeAt(0).cloneRange();
                // Debug: Afficher le texte sélectionné
                const selectedText = this.currentRange.toString();
                if (selectedText) {
                    console.log('Sélection sauvée:', selectedText);
                }
            }
        }

        restoreSelection() {
            if (this.currentRange) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                try {
                    selection.addRange(this.currentRange);
                    console.log('Sélection restaurée');
                } catch (e) {
                    console.warn('Impossible de restaurer la sélection:', e);
                    // Fallback: remettre le focus dans l'éditeur
                    this.editor.focus();
                }
            } else {
                // Si pas de sélection sauvée, remettre le focus
                this.editor.focus();
            }
        }

        execCommand(command, value = null) {
            console.log('Exécution commande:', command);
            
            // Assurer que l'éditeur a le focus et restaurer la sélection
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
            
            // Mettre à jour immédiatement
            this.updateToolbar();
            this.updateHiddenField();
            
            // Sauvegarder la nouvelle sélection après un délai
            setTimeout(() => {
                this.saveSelection();
            }, 10);
        }

        applyFormat(tag) {
            // Méthode améliorée pour appliquer les formats
            this.editor.focus();
            if (this.currentRange) {
                this.restoreSelection();
            }
            
            try {
                // Utiliser formatBlock pour les éléments de bloc
                const success = document.execCommand('formatBlock', false, tag);
                if (!success) {
                    console.warn('formatBlock failed for:', tag);
                    // Fallback: essayer avec les balises HTML
                    document.execCommand('formatBlock', false, `<${tag}>`);
                }
            } catch (e) {
                console.error('Error applying format:', tag, e);
            }
            
            // Mettre à jour immédiatement
            this.updateHiddenField();
            
            // Délai pour que le DOM se mette à jour avant de mettre à jour la toolbar
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
            
            // Mettre à jour le sélecteur de format
            this.updateFormatSelector();
        }
        
        updateFormatSelector() {
            const formatSelect = document.getElementById('formatSelect');
            if (!formatSelect) return;
            
            try {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    // Obtenir l'élément parent de la sélection
                    let element = selection.anchorNode;
                    
                    // Si c'est un noeud de texte, obtenir son parent
                    while (element && element.nodeType === Node.TEXT_NODE) {
                        element = element.parentElement;
                    }
                    
                    // Remonter jusqu'à trouver un élément de formatage valide
                    while (element && element !== this.editor) {
                        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
                        
                        // Vérifier si c'est un des formats supportés
                        const supportedFormats = ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'div'];
                        if (supportedFormats.includes(tagName)) {
                            // Trouver l'option correspondante dans le select
                            for (let option of formatSelect.options) {
                                if (option.value === tagName || 
                                   (tagName === 'div' && option.value === 'p')) { // Traiter div comme p
                                    formatSelect.value = option.value;
                                    return;
                                }
                            }
                        }
                        element = element.parentElement;
                    }
                }
                
                // Par défaut, aucune sélection
                formatSelect.value = '';
            } catch (e) {
                formatSelect.value = '';
            }
        }

        insertSimpleLink() {
            // Sauvegarder la sélection actuelle avant les prompts
            this.saveSelection();
            
            const selectedText = this.currentRange ? this.currentRange.toString() : '';
            
            const url = prompt('Entrez l\'URL du lien:');
            if (url) {
                const text = prompt('Texte du lien (optionnel):', selectedText) || url;
                
                // Restaurer la sélection et insérer le lien
                this.restoreSelection();
                const linkHTML = `<a href="${url}" target="_blank">${text}</a>`;
                this.execCommand('insertHTML', linkHTML);
            } else {
                // Restaurer la sélection même si annulé
                this.restoreSelection();
            }
        }

        // === GESTION DES IMAGES ===
        
        showImageModal() {
            this.saveSelection(); // Sauvegarder la sélection avant d'ouvrir la modale
            
            const modal = new bootstrap.Modal(document.getElementById('imageModal'));
            modal.show();
            
            // Reset des formulaires
            document.getElementById('imageUrl').value = '';
            document.getElementById('imageFileInput').value = '';
            document.getElementById('uploadPreview').innerHTML = '';
            document.getElementById('urlPreview').innerHTML = '';
            document.getElementById('imageConfig').style.display = 'none';
            document.getElementById('insertImageBtn').disabled = true;
            
            // Setup des événements de la modale si pas déjà fait
            this.setupImageModalEvents();
        }
        
        // === GESTION DES VIDÉOS ===
        
        showVideoModal() {
            this.saveSelection(); // Sauvegarder la sélection avant d'ouvrir la modale
            
            const modal = new bootstrap.Modal(document.getElementById('videoModal'));
            modal.show();
            
            // Reset des formulaires
            document.getElementById('videoUrl').value = '';
            document.getElementById('videoPreview').innerHTML = '';
            document.getElementById('videoConfig').style.display = 'none';
            document.getElementById('insertVideoBtn').disabled = true;
            
            // Setup des événements de la modale si pas déjà fait
            this.setupVideoModalEvents();
        }
        
        setupImageModalEvents() {
            // Pour éviter les doublons d'événements
            if (this.imageEventsSetup) return;
            this.imageEventsSetup = true;
            
            // Modal d'image - URL
            document.getElementById('imageUrl')?.addEventListener('input', (e) => {
                this.previewImageUrl(e.target.value);
            });

            // Modal d'image - Upload
            document.getElementById('imageFileInput')?.addEventListener('change', (e) => {
                this.handleImageUpload(e.target.files);
            });

            // Modal d'image - Drag & Drop
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

            // Bouton d'insertion d'image
            document.getElementById('insertImageBtn')?.addEventListener('click', () => {
                this.insertImage();
            });
        }
        
        setupVideoModalEvents() {
            // Pour éviter les doublons d'événements
            if (this.videoEventsSetup) return;
            this.videoEventsSetup = true;
            
            // Champ URL vidéo
            document.getElementById('videoUrl')?.addEventListener('input', (e) => {
                this.previewVideo(e.target.value);
            });
            
            // Bouton d'insertion de vidéo
            document.getElementById('insertVideoBtn')?.addEventListener('click', () => {
                this.insertVideo();
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
        
        // Vérifier s'il reste des images en prévisualisation
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
        
        // === FONCTIONS VIDÉOS ===
        
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
            
            // Créer l'aperçu de la vidéo
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
            
            // Construire l'URL d'embed avec les options
            let embedUrl = videoInfo.embedUrl;
            
            // Ajouter l'autoplay si demandé
            if (autoplay) {
                const separator = embedUrl.includes('?') ? '&' : '?';
                if (videoInfo.platform === 'YouTube') {
                    embedUrl += separator + 'autoplay=1';
                } else if (videoInfo.platform === 'Vimeo') {
                    embedUrl += separator + 'autoplay=1';
                } else if (videoInfo.platform === 'Dailymotion') {
                    embedUrl += separator + 'autoplay=1';
                }
            }
            
            // Créer le conteneur vidéo
            const videoContainer = document.createElement('div');
            videoContainer.className = `video-container video-${align}`;
            videoContainer.style.cssText = `
                width: ${width}px;
                max-width: 100%;
                margin: 20px ${align === 'center' ? 'auto' : (align === 'right' ? '0 0 20px 20px' : '0 20px 20px 0')};
                ${align === 'left' ? 'float: left;' : ''}
                ${align === 'right' ? 'float: right;' : ''}
            `;
            
            // Créer l'iframe avec ratio responsive
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
            
            // Insérer dans l'éditeur
            this.restoreSelection();
            this.execCommand('insertHTML', videoContainer.outerHTML);
            
            // Fermer la modale
            bootstrap.Modal.getInstance(document.getElementById('videoModal')).hide();
            
            // Mettre à jour le champ caché
            this.updateHiddenField();
            
            console.log(`Vidéo ${videoInfo.platform} insérée: ${videoInfo.id}`);
        }
        
        updateExistingImage(img, src, alt, align, width, wrapMode) {
            // Mettre à jour l'image existante
            img.src = src;
            img.alt = alt;
            
            // Supprimer toutes les anciennes classes d'alignement et d'habillage
            const oldClasses = ['align-left', 'align-center', 'align-right', 'wrap-left', 'wrap-right', 'wrap-both', 'background'];
            oldClasses.forEach(cls => img.classList.remove(cls));
            
            // Appliquer le nouveau style
            this.applyImageStyle(img, align, wrapMode);
            
            // Mettre à jour la largeur
            if (width) {
                img.style.width = width + 'px';
            } else {
                img.style.width = '';
            }
            
            this.editingImage = null; // Réinitialiser
        }
        
        createNewImage(src, alt, align, width, wrapMode) {
            // Créer une nouvelle image
            const img = document.createElement('img');
            img.src = src;
            if (alt) img.alt = alt;
            img.className = 'editor-image resizable';
            
            // Appliquer les styles
            this.applyImageStyle(img, align, wrapMode);
            
            if (width) {
                img.style.width = width + 'px';
            }
            
            // Insérer l'image selon le mode d'habillage
            this.insertImageWithWrap(img, wrapMode);
        }
        
        applyImageStyle(img, align, wrapMode) {
            // Appliquer les classes selon le mode d'habillage
            switch(wrapMode) {
                case 'wrap-left':
                    img.classList.add('wrap-left');
                    break;
                case 'wrap-right':
                    img.classList.add('wrap-right');
                    break;
                case 'wrap-both':
                    img.classList.add('wrap-both');
                    break;
                case 'background':
                    img.classList.add('background');
                    break;
                default: // 'none'
                    if (align) {
                        img.classList.add(`align-${align}`);
                    }
            }
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
                `;
                
                // Utiliser l'image comme background-image au lieu de balise img
                container.style.backgroundImage = `url('${img.src}')`;
                
                // Ajouter du texte d'exemple éditable
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
                textNode.innerHTML = 'Tapez votre texte ici. L\'image est maintenant en arrière-plan. Vous pouvez modifier ce texte.';
                
                container.appendChild(textNode);
                
                // Stocker l'URL de l'image comme attribut pour la modification ulterieure
                container.setAttribute('data-bg-image', img.src);
                
                this.execCommand('insertHTML', container.outerHTML);
                
                console.log('Image en arrière-plan insérée avec conteneur');
            } else {
                // Insertion normale
                this.execCommand('insertHTML', img.outerHTML);
            }
        }
        
        // Fonction pour rendre les images redimensionnables
        setupImageResizing() {
            const images = this.editor.querySelectorAll('img.editor-image');
            images.forEach(img => {
                if (!img.dataset.eventsSetup) {
                    img.dataset.eventsSetup = 'true';
                    
                    // Gestion des clics sur l'image - Améliorée
                    img.addEventListener('click', (e) => {
                        // Vérifier si c'est un clic sur la zone de redimensionnement
                        if (img.classList.contains('selected')) {
                            const wrapper = img.parentElement;
                            if (wrapper && wrapper.classList.contains('image-wrapper')) {
                                const handle = wrapper.querySelector('.resize-handle');
                                if (handle) {
                                    const rect = handle.getBoundingClientRect();
                                    const clickX = e.clientX;
                                    const clickY = e.clientY;
                                    
                                    // Vérifier si le clic est sur la poignée
                                    if (clickX >= rect.left && clickX <= rect.right &&
                                        clickY >= rect.top && clickY <= rect.bottom) {
                                        // C'est un clic sur la poignée, ne pas traiter comme sélection
                                        return;
                                    }
                                }
                            }
                        }
                        
                        // C'est un clic normal pour sélectionner
                        e.preventDefault();
                        e.stopPropagation();
                        this.selectImage(img);
                    });
                    
                    // Double-clic pour modifier - Amélioré
                    img.addEventListener('dblclick', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Double-clic détecté sur image pour édition');
                        this.editImage(img);
                    });
                    
                    console.log('Events setup pour image:', img.src.substring(0, 50) + '...');
                }
            });
        }
        
        // Gestion des interactions avec les vidéos
        setupVideoInteractions() {
            const videoContainers = this.editor.querySelectorAll('.video-container');
            videoContainers.forEach(container => {
                if (!container.dataset.eventsSetup) {
                    container.dataset.eventsSetup = 'true';
                    
                    // Clic simple pour sélectionner la vidéo
                    container.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.selectVideo(container);
                    });
                    
                    // Double-clic pour modifier la vidéo
                    container.addEventListener('dblclick', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Double-clic détecté sur vidéo pour édition');
                        this.editVideo(container);
                    });
                    
                    console.log('Events setup pour vidéo:', container.className);
                }
            });
        }
        
        // Sélectionner une vidéo
        selectVideo(container) {
            // Désélectionner toutes les autres vidéos
            this.editor.querySelectorAll('.video-container.selected').forEach(v => {
                v.classList.remove('selected');
            });
            
            // Désélectionner toutes les images
            this.editor.querySelectorAll('img.selected').forEach(img => {
                img.classList.remove('selected');
                this.removeResizeHandle(img);
            });
            
            // Sélectionner cette vidéo
            container.classList.add('selected');
            
            console.log('Vidéo sélectionnée - Double-cliquez pour modifier, Suppr pour supprimer');
        }
        
        // Éditer une vidéo existante
        editVideo(container) {
            const iframe = container.querySelector('iframe');
            if (!iframe) {
                console.error('Iframe non trouvée dans le conteneur vidéo');
                return;
            }
            
            this.saveSelection();
            
            // Extraire les informations de la vidéo
            const originalUrl = iframe.dataset.originalUrl;
            const platform = iframe.dataset.videoPlatform;
            const videoId = iframe.dataset.videoId;
            
            if (!originalUrl) {
                console.error('URL originale non trouvée');
                return;
            }
            
            // Pré-remplir les champs de la modale
            document.getElementById('videoUrl').value = originalUrl;
            
            // Extraire les dimensions actuelles
            const containerStyle = container.style;
            const width = parseInt(containerStyle.width) || 560;
            const ratio = container.querySelector('.ratio');
            const aspectRatio = ratio ? parseFloat(ratio.style.getPropertyValue('--bs-aspect-ratio')) : 56.25;
            const height = Math.round(width * aspectRatio / 100);
            
            document.getElementById('videoWidth').value = width;
            document.getElementById('videoHeight').value = height;
            
            // Déterminer l'alignement actuel
            let currentAlign = 'center';
            if (container.classList.contains('video-left')) currentAlign = 'left';
            else if (container.classList.contains('video-right')) currentAlign = 'right';
            document.getElementById('videoAlign').value = currentAlign;
            
            // Vérifier l'autoplay
            const autoplay = iframe.src.includes('autoplay=1');
            document.getElementById('videoAutoplay').checked = autoplay;
            
            // Déclencher la prévisualisation
            this.previewVideo(originalUrl);
            
            // Marquer comme édition
            this.editingVideo = container;
            
            // Ouvrir la modale
            const modal = new bootstrap.Modal(document.getElementById('videoModal'));
            modal.show();
            
            console.log('Modale d\'edition vidéo ouverte pour:', platform, videoId);
        }
        
        selectImage(img) {
            // Déselectionner toutes les autres images
            this.editor.querySelectorAll('img.selected').forEach(i => {
                i.classList.remove('selected');
                this.removeResizeHandle(i); // Supprimer l'ancienne poignée
            });
            
            // Sélectionner cette image
            img.classList.add('selected');
            
            // Ajouter la poignée de redimensionnement
            this.addResizeHandle(img);
            
            // Setup du redimensionnement
            this.setupImageDragResize(img);
            
            console.log('Image sélectionnée avec poignée ajoutée');
        }
        
        // Ajouter une poignée de redimensionnement visible
        addResizeHandle(img) {
            // Vérifier qu'il n'y a pas déjà une poignée
            const existingHandle = img.parentNode.querySelector('.resize-handle');
            if (existingHandle) {
                existingHandle.remove();
            }
            
            // Vérifier si l'image est déjà dans un wrapper
            if (img.parentElement.classList.contains('image-wrapper')) {
                // Si déjà dans un wrapper, juste ajouter la poignée
                const handle = this.createResizeHandle();
                img.parentElement.appendChild(handle);
                console.log('Poignée ajoutée au wrapper existant');
                return;
            }
            
            // Créer un conteneur wrapper pour l'image + poignée
            const wrapper = document.createElement('span');
            wrapper.className = 'image-wrapper';
            wrapper.style.cssText = `
                position: relative;
                display: inline-block;
                line-height: 0;
            `;
            
            // IMPORTANT: Insérer le wrapper à la position EXACTE de l'image
            const parent = img.parentNode;
            const nextSibling = img.nextSibling;
            
            // Envelopper l'image sans la déplacer dans le document
            parent.removeChild(img);
            wrapper.appendChild(img);
            
            if (nextSibling) {
                parent.insertBefore(wrapper, nextSibling);
            } else {
                parent.appendChild(wrapper);
            }
            
            // Créer la poignée
            const handle = this.createResizeHandle();
            wrapper.appendChild(handle);
            
            console.log('Poignée de redimensionnement ajoutée avec wrapper positionné');
        }
        
        // Fonction pour créer une poignée standardisée
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
        
        // Supprimer la poignée de redimensionnement
        removeResizeHandle(img) {
            const wrapper = img.parentNode;
            if (wrapper && wrapper.classList.contains('image-wrapper')) {
                const handle = wrapper.querySelector('.resize-handle');
                if (handle) {
                    handle.remove();
                    
                    // Déplacer l'image hors du wrapper
                    const parent = wrapper.parentNode;
                    parent.insertBefore(img, wrapper);
                    wrapper.remove();
                    
                    console.log('Poignée et wrapper supprimés');
                }
            }
        }
        
        // Configuration du redimensionnement par drag - Version avec vraie poignée
        setupImageDragResize(img) {
            // Éviter les doublons d'événements
            if (img.dataset.resizeSetup === 'true') {
                return; // Déjà configuré
            }
            
            img.dataset.resizeSetup = 'true';
            
            let isResizing = false;
            let startX, startWidth;
            
            const handleMouseMove = (e) => {
                if (!isResizing) return;
                
                e.preventDefault();
                
                const deltaX = e.clientX - startX;
                
                // Calculer la nouvelle largeur avec limites intelligentes
                let newWidth = Math.max(50, startWidth + deltaX);
                
                // Limiter la largeur selon le type d'habillage
                const containerWidth = this.editor.offsetWidth;
                let maxWidth = containerWidth;
                
                if (img.classList.contains('wrap-left') || img.classList.contains('wrap-right')) {
                    maxWidth = containerWidth * 0.6; // 60% max pour habillage
                } else if (img.classList.contains('wrap-both')) {
                    maxWidth = containerWidth * 0.5; // 50% max pour texte autour
                } else {
                    maxWidth = containerWidth * 0.9; // 90% max pour image normale
                }
                
                newWidth = Math.min(newWidth, maxWidth);
                
                // Appliquer les nouvelles dimensions
                img.style.width = newWidth + 'px';
                img.style.height = 'auto';
            };
            
            const handleMouseUp = (e) => {
                if (isResizing) {
                    isResizing = false;
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    
                    // Restaurer le curseur
                    document.body.style.cursor = '';
                    
                    // Mettre à jour le champ caché
                    this.updateHiddenField();
                    
                    console.log(`Image redimensionnée: ${img.style.width}`);
                }
            };
            
            // Écouter les clics sur la poignée de redimensionnement
            const handleResizeStart = (e) => {
                // Vérifier si on clique sur une poignée
                if (e.target.classList.contains('resize-handle')) {
                    // Trouver l'image correspondante
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
                        
                        // Changer le curseur
                        document.body.style.cursor = 'se-resize';
                        
                        console.log('Début redimensionnement - Poignée cliquée avec wrapper');
                    }
                }
            };
            
            // Ajouter l'événement sur le document pour capturer les clics sur la poignée
            document.addEventListener('mousedown', handleResizeStart);
        }
        
        // Modifier une image existante
        editImage(img) {
            this.saveSelection();
            
            // Pré-remplir les champs avec les valeurs actuelles
            document.getElementById('imageUrl').value = img.src;
            document.getElementById('imageAlt').value = img.alt || '';
            
            // Déterminer l'alignement et l'habillage actuels
            let currentAlign = '';
            let currentWrap = 'none';
            
            // Vérifier les classes d'habillage en premier
            if (img.classList.contains('wrap-left')) {
                currentWrap = 'wrap-left';
            } else if (img.classList.contains('wrap-right')) {
                currentWrap = 'wrap-right';
            } else if (img.classList.contains('wrap-both')) {
                currentWrap = 'wrap-both';
            } else if (img.classList.contains('background')) {
                currentWrap = 'background';
            } else {
                // Vérifier l'alignement classique
                if (img.classList.contains('align-left')) currentAlign = 'left';
                else if (img.classList.contains('align-center')) currentAlign = 'center';
                else if (img.classList.contains('align-right')) currentAlign = 'right';
            }
            
            document.getElementById('imageAlign').value = currentAlign;
            document.getElementById('imageWrap').value = currentWrap;
            
            // Largeur actuelle
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
        
        // Supprimer l'image sélectionnée
        deleteSelectedImage() {
            const selectedImg = this.editor.querySelector('img.selected');
            if (selectedImg) {
                selectedImg.remove();
                this.updateHiddenField();
                console.log('Image supprimée');
            }
        }

        // Méthode utilitaire pour exécuter plusieurs commandes sur la même sélection
        executeMultipleCommands(commands) {
            if (!this.currentRange) {
                console.warn('Aucune sélection pour les commandes multiples');
                return;
            }
            
            this.editor.focus();
            this.restoreSelection();
            
            commands.forEach(command => {
                try {
                    if (typeof command === 'string') {
                        document.execCommand(command, false, null);
                    } else if (command.command && command.value) {
                        document.execCommand(command.command, false, command.value);
                    }
                } catch (e) {
                    console.error('Erreur commande multiple:', command, e);
                }
            });
            
            this.updateToolbar();
            this.updateHiddenField();
            this.saveSelection();
        }

        // API publique
        getContent() {
            return this.editor.innerHTML;
        }

        setContent(content) {
            this.editor.innerHTML = content;
            this.updateHiddenField();
        }

        clear() {
            this.editor.innerHTML = '';
            this.updateHiddenField();
        }

        focus() {
            this.editor.focus();
        }
        
        // Méthodes de debug et utilitaires
        getSelectionInfo() {
            const selection = window.getSelection();
            return {
                hasSelection: selection.rangeCount > 0,
                selectedText: selection.toString(),
                currentRange: this.currentRange ? this.currentRange.toString() : 'Aucune',
                focusNode: selection.focusNode ? selection.focusNode.nodeName : 'Aucun'
            };
        }
        
        // Test des commandes multiples (exemple d'utilisation)
        makeBoldAndItalic() {
            this.executeMultipleCommands(['bold', 'italic']);
        }
        
        makeBoldAndColored(color = '#ff0000') {
            this.executeMultipleCommands([
                'bold',
                { command: 'foreColor', value: color }
            ]);
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
