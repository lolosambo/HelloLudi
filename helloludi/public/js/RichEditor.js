/**
 * RichEditor - Version 1.5.0 - Alignement Forcé
 * Correction définitive du problème d'alignement
 */
(function(window) {
    'use strict';

    class RichEditor {
        constructor(containerId, options = {}) {
            this.containerId = containerId;
            this.options = {
                hiddenFieldId: 'post_content',
                placeholder: 'Commencez à écrire votre contenu ici...',
                uploadUrl: '/upload',
                ...options
            };

            this.container = null;
            this.toolbar = null;
            this.editor = null;
            this.hiddenField = null;
            this.isInitialized = false;
            this.currentRange = null;
            this.uploadedFiles = [];
            
            // Variables pour la gestion des images redimensionnables
            this.selectedImage = null;
            this.resizeHandle = null;
            this.isResizing = false;
            this.startX = 0;
            this.startY = 0;
            this.startWidth = 0;
            this.startHeight = 0;
            this.aspectRatio = 1;

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
            this.isInitialized = true;
            
            console.log('🚀 RichEditor initialisé - Version alignement forcé');
        }

        createEditor() {
            // Créer la structure HTML de l'éditeur
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

            // Rechercher le champ caché
            this.hiddenField = document.getElementById(this.options.hiddenFieldId);
            if (!this.hiddenField) {
                console.warn('Hidden field not found:', this.options.hiddenFieldId);
            }
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

                <!-- Groupe indentation -->
                <div class="editor-group">
                    <button type="button" class="editor-btn" data-command="indent" title="Augmenter l'indentation">
                        <i class="bi bi-indent"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="outdent" title="Diminuer l'indentation">
                        <i class="bi bi-unindent"></i>
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
                        <i class="bi bi-camera-video"></i>
                    </button>
                </div>

                <!-- Groupe utilitaires -->
                <div class="editor-group">
                    <button type="button" class="editor-btn" data-command="removeFormat" title="Supprimer le formatage">
                        <i class="bi bi-eraser"></i>
                    </button>
                    <button type="button" class="editor-btn" id="fullscreenBtn" title="Plein écran">
                        <i class="bi bi-fullscreen"></i>
                    </button>
                    <button type="button" class="editor-btn" id="debugBtn" title="Debug Alignement">
                        🔍
                    </button>
                </div>
            `;
        }

        setupEventListeners() {
            this.setupToolbarEvents();
            this.setupEditorEvents();
            this.setupModalEvents();
            this.setupImageEvents();
        }

        setupToolbarEvents() {
            const commandButtons = this.toolbar.querySelectorAll('[data-command]');
            commandButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.execCommand(btn.dataset.command);
                });
            });

            const formatSelect = document.getElementById('formatSelect');
            if (formatSelect) {
                formatSelect.addEventListener('change', (e) => {
                    if (e.target.value) {
                        this.applyFormat(e.target.value);
                    }
                });
            }

            const textColor = document.getElementById('textColor');
            if (textColor) {
                textColor.addEventListener('change', (e) => {
                    this.applyTextColor(e.target.value);
                });
            }

            document.getElementById('linkBtn')?.addEventListener('click', () => this.showLinkModal());
            document.getElementById('imageBtn')?.addEventListener('click', () => this.showImageModal());
            document.getElementById('videoBtn')?.addEventListener('click', () => this.showVideoModal());
            document.getElementById('fullscreenBtn')?.addEventListener('click', () => this.toggleFullscreen());
            document.getElementById('debugBtn')?.addEventListener('click', () => this.debugAlignment());
        }

        setupEditorEvents() {
            this.editor.addEventListener('input', () => {
                this.updateHiddenField();
                this.updateToolbar();
                // Forcer l'alignement après chaque modification
                setTimeout(() => this.forceAllImageAlignment(), 100);
            });

            this.editor.addEventListener('mouseup', () => this.saveSelection());
            this.editor.addEventListener('keyup', () => this.saveSelection());

            // Événement pour gérer les clics dans l'éditeur
            this.editor.addEventListener('click', (e) => {
                if (!e.target.matches('img')) {
                    this.deselectImage();
                }
            });

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
                
                // Raccourcis pour l'indentation
                if (e.key === 'Tab') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.execCommand('outdent');
                    } else {
                        this.execCommand('indent');
                    }
                }
                
                // Raccourcis pour l'alignement
                if (e.ctrlKey && e.key === 'l') {
                    e.preventDefault();
                    this.execCommand('justifyLeft');
                }
                if (e.ctrlKey && e.key === 'e') {
                    e.preventDefault();
                    this.execCommand('justifyCenter');
                }
                if (e.ctrlKey && e.key === 'r') {
                    e.preventDefault();
                    this.execCommand('justifyRight');
                }
                if (e.ctrlKey && e.key === 'j') {
                    e.preventDefault();
                    this.execCommand('justifyFull');
                }
            });

            this.editor.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                this.insertText(text);
            });
        }

        setupImageEvents() {
            // Gestionnaire global pour les événements de souris
            document.addEventListener('mousemove', (e) => {
                if (this.isResizing && this.selectedImage) {
                    e.preventDefault();
                    this.handleResize(e);
                }
            });

            document.addEventListener('mouseup', () => {
                if (this.isResizing) {
                    this.stopResize();
                }
            });

            // Observer pour les nouvelles images
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                                images.forEach(img => {
                                    this.makeImageInteractive(img);
                                    this.forceImageAlignment(img);
                                });
                            }
                        });
                    }
                });
            });

            observer.observe(this.editor, {
                childList: true,
                subtree: true
            });

            // Rendre les images existantes interactives
            this.editor.querySelectorAll('img').forEach(img => {
                this.makeImageInteractive(img);
                this.forceImageAlignment(img);
            });
        }

        makeImageInteractive(img) {
            if (img.classList.contains('interactive-image')) {
                return;
            }

            console.log('🖼️ Rendre image interactive:', img.className);
            img.classList.add('interactive-image');

            // FORCER L'ALIGNEMENT IMMÉDIATEMENT
            this.forceImageAlignment(img);

            // Événements
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectImage(img);
            });

            img.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.deselectImage();
            });

            img.addEventListener('dragstart', (e) => {
                e.preventDefault();
            });
        }

        forceImageAlignment(img) {
            console.log('🎯 FORCER alignement pour:', img.className);
            
            // APPROACH AGRESSIVE - Styles forcés avec !important
            if (img.classList.contains('align-left')) {
                console.log('📍 Application GAUCHE forcée');
                img.style.cssText = `
                    float: left !important;
                    margin: 5px 15px 15px 5px !important;
                    clear: left !important;
                    max-width: 50% !important;
                    height: auto !important;
                    display: block !important;
                    cursor: pointer !important;
                    position: static !important;
                `;
                console.log('✅ Styles GAUCHE appliqués');
            } else if (img.classList.contains('align-right')) {
                console.log('📍 Application DROITE forcée');
                img.style.cssText = `
                    float: right !important;
                    margin: 5px 5px 15px 15px !important;
                    clear: right !important;
                    max-width: 50% !important;
                    height: auto !important;
                    display: block !important;
                    cursor: pointer !important;
                    position: static !important;
                `;
                console.log('✅ Styles DROITE appliqués');
            } else if (img.classList.contains('align-center')) {
                console.log('📍 Application CENTRE forcée');
                img.style.cssText = `
                    display: block !important;
                    margin: 15px auto !important;
                    float: none !important;
                    max-width: 100% !important;
                    height: auto !important;
                    cursor: pointer !important;
                    position: static !important;
                `;
                console.log('✅ Styles CENTRE appliqués');
            } else {
                console.log('📍 Application DÉFAUT forcée');
                img.style.cssText = `
                    display: inline-block !important;
                    margin: 10px 0 !important;
                    max-width: 100% !important;
                    height: auto !important;
                    float: none !important;
                    cursor: pointer !important;
                    position: static !important;
                `;
                console.log('✅ Styles DÉFAUT appliqués');
            }
        }

        forceAllImageAlignment() {
            const images = this.editor.querySelectorAll('img');
            console.log(`🔄 Forcer alignement sur ${images.length} image(s)`);
            images.forEach(img => this.forceImageAlignment(img));
        }

        debugAlignment() {
            console.log('🔍 DEBUG ALIGNEMENT - DÉBUT');
            const images = this.editor.querySelectorAll('img');
            
            images.forEach((img, index) => {
                console.log(`--- IMAGE ${index + 1} ---`);
                console.log('Classes:', img.className);
                console.log('Styles inline:', img.style.cssText);
                
                const computed = window.getComputedStyle(img);
                console.log('Float computed:', computed.float);
                console.log('Margin computed:', computed.margin);
                console.log('Display computed:', computed.display);
            });
            
            // Force un réalignement
            this.forceAllImageAlignment();
            console.log('🔍 DEBUG ALIGNEMENT - FIN');
        }

        selectImage(img) {
            console.log('📸 Image sélectionnée');
            
            // Forcer l'alignement avant la sélection
            this.forceImageAlignment(img);
            
            this.deselectImage();
            this.selectedImage = img;
            img.classList.add('selected');
            this.addResizeHandle(img);
        }

        deselectImage() {
            if (this.selectedImage) {
                console.log('❌ Désélection image');
                this.selectedImage.classList.remove('selected');
                this.removeResizeHandle();
                
                // Restaurer l'alignement après désélection
                this.forceImageAlignment(this.selectedImage);
                this.selectedImage = null;
            }
        }

        addResizeHandle(img) {
            console.log('🔧 Ajout poignée de redimensionnement');
            this.removeResizeHandle();
            
            // Créer wrapper simple
            const wrapper = document.createElement('div');
            wrapper.className = 'image-resize-wrapper';
            wrapper.style.cssText = `
                position: relative;
                display: inline-block;
            `;
            
            // Insérer wrapper
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            
            // Créer poignée
            this.resizeHandle = document.createElement('div');
            this.resizeHandle.className = 'image-resize-handle';
            this.resizeHandle.innerHTML = '⤡';
            
            Object.assign(this.resizeHandle.style, {
                position: 'absolute',
                bottom: '-8px',
                right: '-8px',
                width: '16px',
                height: '16px',
                background: '#007bff',
                border: '2px solid #fff',
                borderRadius: '50%',
                cursor: 'se-resize',
                zIndex: '1000',
                fontSize: '10px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            });
            
            wrapper.appendChild(this.resizeHandle);
            
            this.resizeHandle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.startResize(e, img);
            });
        }

        removeResizeHandle() {
            if (this.resizeHandle) {
                const wrapper = this.resizeHandle.parentNode;
                if (wrapper && wrapper.classList.contains('image-resize-wrapper')) {
                    const img = wrapper.querySelector('img');
                    if (img) {
                        wrapper.parentNode.insertBefore(img, wrapper);
                        // Forcer l'alignement après suppression du wrapper
                        this.forceImageAlignment(img);
                    }
                    wrapper.remove();
                }
                this.resizeHandle = null;
            }
        }

        startResize(e, img) {
            console.log('🎯 Début redimensionnement');
            this.isResizing = true;
            this.selectedImage = img;
            
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.startWidth = img.offsetWidth;
            this.startHeight = img.offsetHeight;
            this.aspectRatio = this.startHeight / this.startWidth;
            
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'se-resize';
        }

        handleResize(e) {
            if (!this.isResizing || !this.selectedImage) return;
            
            const deltaX = e.clientX - this.startX;
            const newWidth = Math.max(50, this.startWidth + deltaX);
            const newHeight = newWidth * this.aspectRatio;
            
            // Appliquer la taille sans changer l'alignement
            const currentCssText = this.selectedImage.style.cssText;
            this.selectedImage.style.width = `${newWidth}px`;
            this.selectedImage.style.height = `${newHeight}px`;
            
            // Maintenir les autres styles
            if (!currentCssText.includes('width:')) {
                this.selectedImage.style.cssText = currentCssText + ` width: ${newWidth}px; height: ${newHeight}px;`;
            }
        }

        stopResize() {
            if (!this.isResizing) return;
            
            console.log(`✅ Fin redimensionnement: ${this.selectedImage.offsetWidth}px`);
            this.isResizing = false;
            
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            
            // Forcer l'alignement après redimensionnement
            this.forceImageAlignment(this.selectedImage);
            this.updateHiddenField();
        }

        // Reste des méthodes (setupModalEvents, loadExistingContent, etc.)
        setupModalEvents() {
            document.getElementById('insertLinkBtn')?.addEventListener('click', () => {
                this.insertLink();
            });

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
                    e.target.classList.add('dragover');
                });
                uploadZone.addEventListener('dragleave', (e) => {
                    e.target.classList.remove('dragover');
                });
                uploadZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.target.classList.remove('dragover');
                    this.handleImageUpload(e.dataTransfer.files);
                });
            }

            document.getElementById('insertImageBtn')?.addEventListener('click', () => {
                this.insertImage();
            });

            document.getElementById('insertVideoBtn')?.addEventListener('click', () => {
                this.insertVideo();
            });

            document.getElementById('youtubeUrl')?.addEventListener('input', (e) => {
                this.previewYouTube(e.target.value);
            });
        }

        loadExistingContent() {
            if (this.hiddenField && this.hiddenField.value) {
                this.editor.innerHTML = this.hiddenField.value;
                setTimeout(() => {
                    this.editor.querySelectorAll('img').forEach(img => {
                        this.makeImageInteractive(img);
                        this.forceImageAlignment(img);
                    });
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
            if (selection.rangeCount > 0) {
                this.currentRange = selection.getRangeAt(0);
            }
        }

        restoreSelection() {
            if (this.currentRange) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(this.currentRange);
            }
        }

        execCommand(command, value = null) {
            this.editor.focus();
            if (this.currentRange) {
                this.restoreSelection();
            }
            document.execCommand(command, false, value);
            this.updateToolbar();
            this.updateHiddenField();
        }

        applyFormat(tag) {
            this.execCommand('formatBlock', `<${tag}>`);
        }

        applyTextColor(color) {
            this.execCommand('foreColor', color);
        }

        insertText(text) {
            this.execCommand('insertText', text);
        }

        updateToolbar() {
            const commands = ['bold', 'italic', 'underline', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'];
            commands.forEach(command => {
                const btn = this.toolbar.querySelector(`[data-command="${command}"]`);
                if (btn) {
                    btn.classList.toggle('active', document.queryCommandState(command));
                }
            });
        }

        showLinkModal() {
            const modal = new bootstrap.Modal(document.getElementById('linkModal'));
            modal.show();
            
            const selection = window.getSelection().toString();
            if (selection) {
                document.getElementById('linkText').value = selection;
            }
        }

        insertLink() {
            const text = document.getElementById('linkText').value;
            const url = document.getElementById('linkUrl').value;
            const target = document.getElementById('linkTarget').checked;
            
            if (!url) return;
            
            this.restoreSelection();
            const linkHTML = `<a href="${url}"${target ? ' target="_blank"' : ''}>${text || url}</a>`;
            this.execCommand('insertHTML', linkHTML);
            
            bootstrap.Modal.getInstance(document.getElementById('linkModal')).hide();
        }

        showImageModal() {
            const modal = new bootstrap.Modal(document.getElementById('imageModal'));
            modal.show();
            
            document.getElementById('imageUrl').value = '';
            document.getElementById('imageFileInput').value = '';
            document.getElementById('uploadPreview').innerHTML = '';
            document.getElementById('urlPreview').innerHTML = '';
            document.getElementById('imageConfig').style.display = 'none';
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
                    <img src="${url}" alt="Aperçu" onerror="this.parentElement.innerHTML='<p class=text-danger>Impossible de charger l\\'image</p>'">
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
                        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">
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

        insertImage() {
            const urlTab = document.getElementById('url');
            const uploadTab = document.getElementById('upload');
            
            let imageSrc = '';
            let altText = document.getElementById('imageAlt').value;
            let align = document.getElementById('imageAlign').value;
            let width = document.getElementById('imageWidth').value;
            
            if (urlTab.classList.contains('show')) {
                imageSrc = document.getElementById('imageUrl').value;
            } else if (uploadTab.classList.contains('show')) {
                const previewImg = document.querySelector('#uploadPreview img');
                if (previewImg) {
                    imageSrc = previewImg.src;
                }
            }
            
            if (!imageSrc) return;
            
            // Construire les classes CSS
            let imageClasses = 'editor-image interactive-image';
            if (align) {
                imageClasses += ` align-${align}`;
            }
            
            // Construire le HTML de l'image
            let imageHTML = `<img src="${imageSrc}" class="${imageClasses}"`;
            if (altText) imageHTML += ` alt="${altText}"`;
            if (width) imageHTML += ` style="width: ${width}px;"`;
            imageHTML += `>`;
            
            this.restoreSelection();
            this.execCommand('insertHTML', imageHTML);
            
            // Rendre interactive et forcer alignement
            setTimeout(() => {
                const newImages = this.editor.querySelectorAll('img:not(.interactive-image)');
                newImages.forEach(img => {
                    this.makeImageInteractive(img);
                    this.forceImageAlignment(img);
                });
            }, 100);
            
            bootstrap.Modal.getInstance(document.getElementById('imageModal')).hide();
        }

        showVideoModal() {
            const modal = new bootstrap.Modal(document.getElementById('videoModal'));
            modal.show();
        }

        previewYouTube(url) {
            const preview = document.getElementById('youtubePreview');
            const config = document.getElementById('videoConfig');
            const insertBtn = document.getElementById('insertVideoBtn');
            
            if (!url) {
                preview.innerHTML = '';
                config.style.display = 'none';
                insertBtn.disabled = true;
                return;
            }
            
            const videoId = this.extractYouTubeId(url);
            if (!videoId) {
                preview.innerHTML = '<p class="text-danger">URL YouTube invalide</p>';
                insertBtn.disabled = true;
                return;
            }
            
            preview.innerHTML = `
                <div class="video-container">
                    <iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>
                </div>
            `;
            config.style.display = 'block';
            insertBtn.disabled = false;
        }

        extractYouTubeId(url) {
            const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
            const match = url.match(regex);
            return match ? match[1] : null;
        }

        insertVideo() {
            const url = document.getElementById('youtubeUrl').value;
            const align = document.getElementById('videoAlign').value;
            const width = document.getElementById('videoWidth').value;
            
            if (!url) return;
            
            const videoId = this.extractYouTubeId(url);
            if (!videoId) return;
            
            let videoHTML = `<div class="video-container${align ? ` align-${align}` : ''}"${width !== '100' ? ` style="width: ${width}%;"` : ''}>`;
            videoHTML += `<iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>`;
            videoHTML += `</div>`;
            
            this.restoreSelection();
            this.execCommand('insertHTML', videoHTML);
            
            bootstrap.Modal.getInstance(document.getElementById('videoModal')).hide();
        }

        toggleFullscreen() {
            const container = this.container.querySelector('.rich-editor-container');
            const btn = document.getElementById('fullscreenBtn');
            
            if (!btn || !container) return;
            
            if (container.classList.contains('fullscreen')) {
                container.classList.remove('fullscreen');
                btn.innerHTML = '<i class="bi bi-fullscreen"></i>';
                btn.title = 'Plein écran';
            } else {
                container.classList.add('fullscreen');
                btn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
                btn.title = 'Quitter le plein écran';
            }
        }

        getContent() {
            return this.editor.innerHTML;
        }

        setContent(content) {
            this.editor.innerHTML = content;
            this.updateHiddenField();
            setTimeout(() => {
                this.editor.querySelectorAll('img').forEach(img => {
                    this.makeImageInteractive(img);
                    this.forceImageAlignment(img);
                });
            }, 100);
        }

        clear() {
            this.editor.innerHTML = '';
            this.updateHiddenField();
            this.deselectImage();
        }

        focus() {
            this.editor.focus();
        }

        destroy() {
            this.deselectImage();
            if (this.container) {
                this.container.innerHTML = '';
            }
            this.isInitialized = false;
        }
    }

    // Auto-initialisation
    document.addEventListener('DOMContentLoaded', function() {
        const editorContainer = document.getElementById('richEditorContainer');
        if (editorContainer) {
            window.richEditor = new RichEditor('richEditorContainer');
        }
    });

    // Export de la classe
    window.RichEditor = RichEditor;

})(window);