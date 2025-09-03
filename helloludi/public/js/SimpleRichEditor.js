/**
 * SimpleRichEditor - Version 3.4 - DÉTECTION AUTOMATIQUE PAGES DÉTAIL
 * CORRIGE : Détection automatique basée sur présence richEditor
 * FONCTIONNALITÉS :
 * - Règle absolue : Pas de richEditor = Mode lecture forcé
 * - Nettoyage automatique des pages de détail
 * - Sélection manuelle uniquement en mode édition
 * - Redimensionnement temps réel fonctionnel
 */
(function(window) {
    'use strict';

    // ✅ NOUVEAU : Fonction globale de nettoyage automatique
    function autoCleanupImagesOnPageLoad() {
        console.log('🔍 === AUTO-NETTOYAGE IMAGES AU CHARGEMENT ===');
        
        // ✅ RÈGLE ABSOLUE : Pas de richEditor = Mode lecture FORCÉ
        const hasRichEditorContainer = !!document.getElementById('richEditorContainer');
        const hasRichEditorGlobal = !!window.richEditor;
        
        console.log('🎯 VÉRIFICATION CRITIQUE richEditor:');
        console.log(`   richEditorContainer: ${hasRichEditorContainer ? '✅ PRÉSENT' : '❌ ABSENT'}`);
        console.log(`   window.richEditor: ${hasRichEditorGlobal ? '✅ PRÉSENT' : '❌ ABSENT'}`);
        
        if (!hasRichEditorContainer && !hasRichEditorGlobal) {
            console.log('🎯 DÉCISION IMMÉDIATE: Aucun richEditor → FORCE MODE LECTURE');
            
            // Nettoyer toutes les interactions sur les images
            const wrappers = document.querySelectorAll('.image-selection-wrapper, .forced-wrapper');
            wrappers.forEach((wrapper, index) => {
                console.log(`   🗑️ Suppression wrapper ${index + 1}`);
                const img = wrapper.querySelector('img');
                if (img) {
                    const alignment = wrapper.dataset.alignment;
                    if (alignment && alignment !== 'default') {
                        img.classList.add(`align-${alignment}`);
                    }
                    wrapper.parentNode.insertBefore(img, wrapper);
                }
                wrapper.remove();
            });
            
            // Supprimer toutes les poignées
            const handles = document.querySelectorAll('.image-resize-handle, .forced-handle');
            handles.forEach((handle, index) => {
                console.log(`   🗑️ Suppression poignée ${index + 1}`);
                handle.remove();
            });
            
            // Supprimer les bordures
            const borders = document.querySelectorAll('.image-selection-border');
            borders.forEach(border => border.remove());
            
            // Configurer toutes les images en lecture seule
            const images = document.querySelectorAll('img');
            images.forEach((img, index) => {
                console.log(`   📷 Image ${index + 1}: Configuration LECTURE SEULE`);
                
                // Cloner pour supprimer événements
                const cleanImg = img.cloneNode(true);
                if (img.parentNode) {
                    img.parentNode.replaceChild(cleanImg, img);
                }
                
                // Styles lecture seule
                cleanImg.style.cursor = 'default';
                cleanImg.style.pointerEvents = 'none';
                cleanImg.title = '';
                
                // Nettoyer attributs
                cleanImg.removeAttribute('data-processed');
                cleanImg.removeAttribute('data-interactive');
                
                // Anti-drag
                cleanImg.addEventListener('dragstart', (e) => e.preventDefault());
                
                // Marquer comme lecture seule
                cleanImg.dataset.readOnly = 'true';
            });
            
            console.log('✅ MODE LECTURE FORCÉ - Page nettoyée automatiquement');
            
            // Vérification après 300ms
            setTimeout(() => {
                const remainingWrappers = document.querySelectorAll('.image-selection-wrapper');
                const remainingHandles = document.querySelectorAll('.image-resize-handle');
                
                console.log('📊 VÉRIFICATION FINALE:');
                console.log(`   Wrappers restants: ${remainingWrappers.length}`);
                console.log(`   Poignées restantes: ${remainingHandles.length}`);
                
                if (remainingWrappers.length === 0 && remainingHandles.length === 0) {
                    console.log('🎉 SUCCESS: Page de détail parfaitement nettoyée');
                } else {
                    console.log('🔧 Nettoyage supplémentaire...');
                    remainingWrappers.forEach(w => w.remove());
                    remainingHandles.forEach(h => h.remove());
                }
            }, 300);
            
            return true; // Indique que le nettoyage a été effectué
        }
        
        console.log('✏️ richEditor détecté - Initialisation normale');
        return false; // Pas de nettoyage, initialisation normale
    }

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
            this.selectedImage = null;
            this.currentEditingImage = null;
            this.isResizing = false;
            this.imageEventsSetup = false;

            // ✅ NOUVEAU : Détection améliorée du mode
            this.isEditMode = this.detectEditMode();

            this.init();
        }

        // ✅ AMÉLIORATION : Détection du mode avec vérification richEditor
        detectEditMode() {
            // Si pas de container richEditor, on est forcément pas en mode édition
            const hasContainer = !!document.getElementById(this.containerId);
            if (!hasContainer) {
                console.log('📝 Pas de container richEditor → Mode LECTURE');
                return false;
            }
            
            const indicators = {
                richEditor: true, // Puisqu'on est dans le constructeur
                editContainer: hasContainer,
                contentEditable: !!document.querySelector('[contenteditable="true"]'),
                toolbar: !!document.querySelector('.editor-toolbar'),
                hiddenField: !!document.getElementById(this.options.hiddenFieldId)
            };

            const editIndicators = Object.values(indicators).filter(Boolean).length;
            const isEditMode = editIndicators >= 3; // Seuil plus élevé
            
            console.log(`📝 Mode détecté: ${isEditMode ? 'ÉDITION' : 'LECTURE'} (score: ${editIndicators}/5)`);
            return isEditMode;
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
            
            console.log('✅ SimpleRichEditor v3.4 - Nettoyage automatique pages détail');
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
                btn.addEventListener('mousedown', (e) => e.preventDefault());
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

            // Événements de l'éditeur
            this.editor.addEventListener('input', () => {
                this.updateHiddenField();
                this.updateToolbar();
                this.processNewImages();
            });

            this.editor.addEventListener('mouseup', () => {
                this.saveSelection();
                this.updateToolbar();
            });
            
            this.editor.addEventListener('keyup', (e) => {
                this.saveSelection();
                this.updateToolbar();
            });

            // Événements spécifiques au mode édition
            if (this.isEditMode) {
                this.setupEditModeEvents();
            }

            // Raccourcis clavier
            this.editor.addEventListener('keydown', (e) => {
                this.handleKeyboardShortcuts(e);
            });

            // Configuration des images après changement
            this.setupMutationObserver();

            // Configuration des événements de la modale
            this.setupImageModalEvents();
        }

        setupEditModeEvents() {
            console.log('⚡ Configuration événements mode édition');

            // Délégation pour clic simple (sélection)
            this.editor.addEventListener('click', (e) => {
                if (e.target.tagName === 'IMG') {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📷 Clic délégué sur image - Sélection...');
                    this.selectImage(e.target);
                } else if (!this.isResizing && !e.target.closest('.image-selection-wrapper')) {
                    this.deselectImage();
                }
            }, true);

            // Délégation pour double-clic (édition)
            this.editor.addEventListener('dblclick', (e) => {
                if (e.target.tagName === 'IMG') {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📷📷 Double-clic délégué sur image - Édition...');
                    this.editImage(e.target);
                }
            }, true);
        }

        processNewImages() {
            const images = this.editor.querySelectorAll('img:not([data-processed="true"])');
            if (images.length > 0) {
                console.log(`🔧 Traitement de ${images.length} nouvelle(s) image(s)`);
                images.forEach(img => {
                    if (this.isEditMode) {
                        this.setupImageBasicStyles(img);
                    } else {
                        this.setupReadOnlyImage(img);
                    }
                    img.dataset.processed = 'true';
                });
            }
        }

        setupMutationObserver() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll('img');
                                images.forEach(img => {
                                    console.log('📷 Nouvelle image détectée via MutationObserver');
                                    if (this.isEditMode) {
                                        this.setupImageBasicStyles(img);
                                    } else {
                                        this.setupReadOnlyImage(img);
                                    }
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
        }

        handleKeyboardShortcuts(e) {
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
                this.execCommand(e.shiftKey ? 'outdent' : 'indent');
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedImage) {
                e.preventDefault();
                this.deleteSelectedImage();
            }
        }

        // Configuration de base des images (sans sélection automatique)
        setupImageBasicStyles(img) {
            console.log('🎨 Configuration styles de base - Mode édition');
            
            img.dataset.processed = 'true';
            img.addEventListener('dragstart', (e) => e.preventDefault());
            img.style.cursor = 'pointer';
            img.title = 'Clic: sélectionner | Double-clic: éditer';
            
            // Restaurer la taille personnalisée
            if (img.dataset.customWidth) {
                const width = parseInt(img.dataset.customWidth);
                img.style.setProperty('width', width + 'px', 'important');
                img.style.setProperty('height', 'auto', 'important');
                img.style.setProperty('max-width', width + 'px', 'important');
                console.log(`   ↳ Restauration taille: ${width}px`);
            } else if (img.style.width) {
                const inlineWidth = img.style.width;
                img.dataset.customWidth = inlineWidth;
                img.style.setProperty('max-width', inlineWidth, 'important');
                console.log(`   ↳ Extraction taille inline: ${inlineWidth}`);
            }
            
            console.log('   ✅ Styles configurés - Sélection manuelle uniquement');
        }

        // Configuration images en mode lecture
        setupReadOnlyImage(img) {
            console.log('👁️ Configuration image - Mode lecture');
            
            img.dataset.processed = 'true';
            
            // Supprimer tous les événements
            const cleanImg = img.cloneNode(true);
            if (img.parentNode) {
                img.parentNode.replaceChild(cleanImg, img);
            }
            
            // Styles lecture seule
            cleanImg.style.cursor = 'default';
            cleanImg.style.pointerEvents = 'none';
            cleanImg.title = '';
            
            // Nettoyer attributs
            cleanImg.removeAttribute('data-interactive');
            cleanImg.addEventListener('dragstart', (e) => e.preventDefault());
            
            console.log('   ✅ Image configurée en LECTURE SEULE');
        }

        selectImage(img) {
            console.log('📌 Sélection image');
            
            if (!this.isEditMode) {
                console.log('🚫 Sélection désactivée - Mode lecture');
                return;
            }
            
            this.deselectImage();
            this.selectedImage = img;
            this.createSelectionWrapper(img);
        }

        createSelectionWrapper(img) {
            const alignment = this.getImageAlignment(img);
            
            const wrapper = document.createElement('div');
            wrapper.className = 'image-selection-wrapper';
            wrapper.dataset.alignment = alignment;
            
            this.applyAlignmentToWrapper(wrapper, alignment);
            
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            
            img.classList.remove('align-left', 'align-right', 'align-center');
            
            const border = document.createElement('div');
            border.className = 'image-selection-border';
            wrapper.appendChild(border);
            
            const handle = document.createElement('div');
            handle.className = 'image-resize-handle';
            wrapper.appendChild(handle);
            
            this.setupImageResizing(handle, img, wrapper);
            
            console.log('✅ Wrapper de sélection créé avec alignement:', alignment);
        }

        getImageAlignment(img) {
            if (img.classList.contains('align-left')) return 'left';
            if (img.classList.contains('align-right')) return 'right';
            if (img.classList.contains('align-center')) return 'center';
            
            const style = window.getComputedStyle(img);
            if (style.float === 'left') return 'left';
            if (style.float === 'right') return 'right';
            if (style.display === 'block' && style.marginLeft === 'auto' && style.marginRight === 'auto') {
                return 'center';
            }
            
            return 'default';
        }

        applyAlignmentToWrapper(wrapper, alignment) {
            wrapper.classList.add(`align-${alignment}`);
            
            switch (alignment) {
                case 'left':
                    wrapper.style.cssText = `
                        float: left !important;
                        clear: left !important;
                        margin: 0 15px 15px 0 !important;
                        max-width: 50% !important;
                        display: block !important;
                        position: relative !important;
                    `;
                    break;
                    
                case 'right':
                    wrapper.style.cssText = `
                        float: right !important;
                        clear: right !important;
                        margin: 0 0 15px 15px !important;
                        max-width: 50% !important;
                        display: block !important;
                        position: relative !important;
                    `;
                    break;
                    
                case 'center':
                    wrapper.style.cssText = `
                        display: block !important;
                        float: none !important;
                        clear: both !important;
                        margin: 15px auto !important;
                        text-align: center !important;
                        max-width: 100% !important;
                        position: relative !important;
                    `;
                    break;
                    
                default:
                    wrapper.style.cssText = `
                        display: inline-block !important;
                        margin: 10px 5px !important;
                        max-width: 100% !important;
                        position: relative !important;
                    `;
            }
        }

        // Redimensionnement perfectionné
        setupImageResizing(handle, img, wrapper) {
            let isDragging = false;
            let startX, startWidth;
            
            handle.style.cssText = `
                position: absolute !important;
                bottom: -12px !important;
                right: -12px !important;
                width: 24px !important;
                height: 24px !important;
                background: #007bff !important;
                border: 3px solid white !important;
                border-radius: 50% !important;
                cursor: se-resize !important;
                z-index: 1000 !important;
                font-size: 14px !important;
                color: white !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-weight: bold !important;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;
                user-select: none !important;
                pointer-events: all !important;
            `;
            
            handle.innerHTML = '↘';
            
            const startResize = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🎯 Début redimensionnement');
                
                isDragging = true;
                this.isResizing = true;
                
                startX = e.clientX;
                startWidth = img.offsetWidth;
                
                document.body.style.cursor = 'se-resize';
                document.body.style.userSelect = 'none';
                handle.style.backgroundColor = '#0056b3';
                handle.style.transform = 'scale(1.1)';
                
                const handleMove = (e) => {
                    if (!isDragging) return;
                    
                    e.preventDefault();
                    
                    const deltaX = e.clientX - startX;
                    let newWidth = startWidth + deltaX;
                    
                    newWidth = Math.max(50, Math.min(newWidth, 800));
                    
                    img.style.setProperty('width', newWidth + 'px', 'important');
                    img.style.setProperty('height', 'auto', 'important');
                    img.style.removeProperty('max-width');
                    
                    img.dataset.customWidth = newWidth + 'px';
                };
                
                const stopResize = (e) => {
                    if (!isDragging) return;
                    
                    console.log('🏁 Fin redimensionnement');
                    
                    isDragging = false;
                    this.isResizing = false;
                    
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                    handle.style.backgroundColor = '#007bff';
                    handle.style.transform = 'scale(1)';
                    
                    const finalWidth = parseInt(img.dataset.customWidth) || img.offsetWidth;
                    img.style.setProperty('max-width', finalWidth + 'px', 'important');
                    
                    document.removeEventListener('mousemove', handleMove);
                    document.removeEventListener('mouseup', stopResize);
                    document.removeEventListener('selectstart', preventSelection);
                    
                    setTimeout(() => {
                        this.updateHiddenField();
                    }, 100);
                    
                    console.log('✅ Redimensionnement terminé');
                };
                
                const preventSelection = (e) => {
                    e.preventDefault();
                    return false;
                };
                
                document.addEventListener('selectstart', preventSelection, { passive: false });
                document.addEventListener('mousemove', handleMove, { passive: false });
                document.addEventListener('mouseup', stopResize, { passive: false });
            };
            
            handle.addEventListener('mousedown', startResize, { passive: false });
            
            // Support tactile
            handle.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                startResize({
                    preventDefault: () => e.preventDefault(),
                    stopPropagation: () => e.stopPropagation(),
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            }, { passive: false });
            
            console.log('🔧 Gestionnaire de redimensionnement configuré');
        }

        deselectImage() {
            if (!this.selectedImage) return;
            
            const wrapper = this.selectedImage.closest('.image-selection-wrapper');
            if (wrapper) {
                const alignment = wrapper.dataset.alignment;
                if (alignment && alignment !== 'default') {
                    this.selectedImage.classList.add(`align-${alignment}`);
                }
                
                wrapper.parentNode.insertBefore(this.selectedImage, wrapper);
                wrapper.remove();
            }
            
            this.selectedImage = null;
            console.log('📌 Image désélectionnée');
        }

        deleteSelectedImage() {
            if (!this.selectedImage) return;
            
            const wrapper = this.selectedImage.closest('.image-selection-wrapper');
            if (wrapper) {
                wrapper.remove();
            } else {
                this.selectedImage.remove();
            }
            
            this.selectedImage = null;
            this.updateHiddenField();
            
            console.log('🗑️ Image supprimée');
        }

        editImage(img) {
            console.log('✏️ Début édition image:', img.src.substring(0, 50) + '...');
            
            this.currentEditingImage = img;
            
            const modal = document.getElementById('imageModal');
            if (!modal) {
                console.error('❌ Erreur: Modale imageModal introuvable!');
                alert('Erreur: Impossible d\'ouvrir l\'éditeur d\'image. Modale manquante.');
                return;
            }
            
            this.fillImageEditFields(img);
            
            try {
                const bootstrapModal = new bootstrap.Modal(modal);
                bootstrapModal.show();
                console.log('✅ Modale ouverte avec succès');
            } catch (error) {
                console.error('❌ Erreur ouverture modale:', error);
                alert('Erreur: Impossible d\'ouvrir l\'éditeur d\'image.');
                return;
            }
        }

        fillImageEditFields(img) {
            const urlInput = document.getElementById('imageUrl');
            if (urlInput) {
                urlInput.value = img.src;
                console.log('   ↳ URL pré-remplie');
            }
            
            const altInput = document.getElementById('imageAlt');
            if (altInput) {
                altInput.value = img.alt || '';
                console.log('   ↳ Alt pré-rempli');
            }
            
            const alignment = this.getImageAlignment(img);
            const alignSelect = document.getElementById('imageAlign');
            if (alignSelect) {
                alignSelect.value = alignment === 'default' ? '' : alignment;
                console.log('   ↳ Alignement détecté:', alignment);
            }
            
            const widthInput = document.getElementById('imageWidth');
            if (widthInput) {
                if (img.dataset.customWidth) {
                    const width = parseInt(img.dataset.customWidth);
                    widthInput.value = width;
                    console.log('   ↳ Largeur détectée (dataset):', width + 'px');
                } else if (img.style.width) {
                    const width = parseInt(img.style.width);
                    widthInput.value = width;
                    console.log('   ↳ Largeur détectée (style):', width + 'px');
                }
            }
            
            const urlTab = document.getElementById('url-tab');
            const urlTabPane = document.getElementById('url');
            const uploadTab = document.getElementById('upload-tab');
            const uploadTabPane = document.getElementById('upload');
            
            if (urlTab && urlTabPane && uploadTab && uploadTabPane) {
                uploadTab.classList.remove('active');
                uploadTabPane.classList.remove('show', 'active');
                urlTab.classList.add('active');
                urlTabPane.classList.add('show', 'active');
                
                this.previewImageUrl(img.src);
                console.log('   ↳ Onglet URL activé et image prévisualisée');
            }
        }

        updateExistingImage(img, src, alt, align, width) {
            console.log('🔄 Mise à jour image');
            
            img.src = src;
            if (alt) img.alt = alt;
            
            if (align) {
                img.classList.remove('align-left', 'align-right', 'align-center');
                
                if (align !== 'default') {
                    img.classList.add(`align-${align}`);
                }
            }
            
            if (width) {
                img.style.width = width + 'px';
                img.dataset.customWidth = width + 'px';
            }
            
            this.currentEditingImage = null;
            this.updateHiddenField();
            
            console.log('✅ Image mise à jour');
        }

        // Gestion des modales
        showImageModal() {
            this.saveSelection();
            
            const modal = new bootstrap.Modal(document.getElementById('imageModal'));
            modal.show();
            
            this.resetImageModal();
        }
        
        showVideoModal() {
            this.saveSelection();
            
            const modal = new bootstrap.Modal(document.getElementById('videoModal'));
            modal.show();
            
            this.resetVideoModal();
        }

        resetImageModal() {
            document.getElementById('imageUrl').value = '';
            document.getElementById('imageFileInput').value = '';
            document.getElementById('uploadPreview').innerHTML = '';
            document.getElementById('urlPreview').innerHTML = '';
            document.getElementById('imageConfig').style.display = 'none';
            document.getElementById('insertImageBtn').disabled = true;
            
            document.getElementById('imageAlign').value = '';
            document.getElementById('imageWidth').value = '';
            
            this.currentEditingImage = null;
        }
        
        resetVideoModal() {
            document.getElementById('videoUrl').value = '';
            document.getElementById('videoPreview').innerHTML = '';
            document.getElementById('videoConfig').style.display = 'none';
            document.getElementById('insertVideoBtn').disabled = true;
            
            // Réinitialiser les champs de configuration
            document.getElementById('videoAlign').value = 'center';
            document.getElementById('videoWidth').value = '560';
            document.getElementById('videoHeight').value = '315';
            document.getElementById('videoAutoplay').checked = false;
        }

        setupImageModalEvents() {
            if (this.imageEventsSetup) return;
            this.imageEventsSetup = true;
            
            console.log('🔧 Configuration événements modales image et vidéo...');
            
            // Événements pour la modale image
            const imageUrl = document.getElementById('imageUrl');
            const imageFileInput = document.getElementById('imageFileInput');
            const insertImageBtn = document.getElementById('insertImageBtn');
            
            if (imageUrl) {
                imageUrl.addEventListener('input', (e) => {
                    this.previewImageUrl(e.target.value);
                });
            }

            if (imageFileInput) {
                imageFileInput.addEventListener('change', (e) => {
                    this.handleImageUpload(e.target.files);
                });
            }

            if (insertImageBtn) {
                insertImageBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🎯 Clic sur bouton insertion image');
                    this.insertImage();
                });
            }
            
            // Événements pour la modale vidéo
            const videoUrl = document.getElementById('videoUrl');
            const insertVideoBtn = document.getElementById('insertVideoBtn');
            
            if (videoUrl) {
                videoUrl.addEventListener('input', (e) => {
                    this.previewVideo(e.target.value);
                });
            }
            
            if (insertVideoBtn) {
                insertVideoBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🎯 Clic sur bouton insertion vidéo');
                    this.insertVideo();
                });
            }
            
            console.log('✅ Événements modales configurés');
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
                        <button type="button" class="remove-btn" onclick="this.parentElement.remove();">
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
            console.log('🎯 Insertion/mise à jour image');
            
            const urlTab = document.getElementById('url');
            let imageSrc = '';
            let altText = document.getElementById('imageAlt').value || '';
            let align = document.getElementById('imageAlign').value || 'default';
            let width = document.getElementById('imageWidth').value || '';
            
            if (urlTab && urlTab.classList.contains('show')) {
                imageSrc = document.getElementById('imageUrl').value;
            } else {
                const previewImg = document.querySelector('#uploadPreview img');
                if (previewImg) {
                    imageSrc = previewImg.src;
                }
            }
            
            if (!imageSrc) {
                alert('Veuillez sélectionner une image.');
                return;
            }
            
            console.log('📝 Source image:', imageSrc.substring(0, 50) + '...');
            console.log('📝 Mode édition:', this.currentEditingImage ? 'MISE À JOUR' : 'CRÉATION');
            
            if (this.currentEditingImage) {
                this.updateExistingImage(this.currentEditingImage, imageSrc, altText, align, width);
            } else {
                this.createNewImage(imageSrc, altText, align, width);
            }
            
            const modal = document.getElementById('imageModal');
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
                console.log('✅ Modale fermée');
            }
            
            this.updateHiddenField();
            
            console.log('✅ Image insérée/mise à jour avec succès');
        }

        createNewImage(src, alt, align, width) {
            const img = document.createElement('img');
            img.src = src;
            if (alt) img.alt = alt;
            
            if (align && align !== 'default') {
                img.classList.add(`align-${align}`);
            }
            
            if (width) {
                img.style.width = width + 'px';
                img.dataset.customWidth = width + 'px';
            }
            
            this.restoreSelection();
            this.execCommand('insertHTML', img.outerHTML);
            
            setTimeout(() => {
                const newImg = this.editor.querySelector(`img[src="${src}"]:not([data-processed="true"])`);
                if (newImg) {
                    this.setupImageBasicStyles(newImg);
                }
            }, 100);
            
            console.log('✅ Nouvelle image créée');
        }
        
        // Méthodes pour la gestion des vidéos
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
            
            const videoData = this.parseVideoUrl(url);
            if (!videoData) {
                preview.innerHTML = '<p class="text-danger">URL vidéo non supportée ou invalide</p>';
                config.style.display = 'none';
                insertBtn.disabled = true;
                return;
            }
            
            preview.innerHTML = `
                <div class="video-container">
                    <iframe src="${videoData.embedUrl}" 
                            frameborder="0" 
                            allowfullscreen 
                            style="width: 100%; height: 200px;">
                    </iframe>
                </div>
                <p class="mt-2 text-muted">${videoData.platform} - ${videoData.id}</p>
            `;
            
            config.style.display = 'block';
            insertBtn.disabled = false;
        }
        
        parseVideoUrl(url) {
            // YouTube
            let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
            if (match) {
                return {
                    platform: 'YouTube',
                    id: match[1],
                    embedUrl: `https://www.youtube.com/embed/${match[1]}`
                };
            }
            
            // Vimeo
            match = url.match(/vimeo\.com\/(\d+)/);
            if (match) {
                return {
                    platform: 'Vimeo',
                    id: match[1],
                    embedUrl: `https://player.vimeo.com/video/${match[1]}`
                };
            }
            
            // Dailymotion
            match = url.match(/dailymotion\.com\/video\/([^_]+)/);
            if (match) {
                return {
                    platform: 'Dailymotion',
                    id: match[1],
                    embedUrl: `https://www.dailymotion.com/embed/video/${match[1]}`
                };
            }
            
            return null;
        }
        
        insertVideo() {
            console.log('🎯 Insertion vidéo');
            
            const url = document.getElementById('videoUrl').value;
            const align = document.getElementById('videoAlign').value || 'center';
            const width = document.getElementById('videoWidth').value || '560';
            const height = document.getElementById('videoHeight').value || '315';
            const autoplay = document.getElementById('videoAutoplay').checked;
            
            if (!url) {
                alert('Veuillez saisir une URL de vidéo.');
                return;
            }
            
            const videoData = this.parseVideoUrl(url);
            if (!videoData) {
                alert('URL vidéo non supportée. Formats supportés : YouTube, Vimeo, Dailymotion.');
                return;
            }
            
            let embedUrl = videoData.embedUrl;
            if (autoplay && videoData.platform === 'YouTube') {
                embedUrl += '?autoplay=1';
            }
            
            const videoHTML = `
                <div class="video-container video-${align}" style="width: ${width}px; margin: 20px ${align === 'center' ? 'auto' : align === 'right' ? '0 0 20px 20px' : '0 20px 20px 0'}; ${align === 'left' ? 'float: left;' : align === 'right' ? 'float: right;' : ''}">
                    <div class="ratio" style="--bs-aspect-ratio: ${(parseInt(height) / parseInt(width) * 100).toFixed(2)}%;">
                        <iframe src="${embedUrl}" 
                                frameborder="0" 
                                allowfullscreen 
                                data-video-platform="${videoData.platform.toLowerCase()}"
                                data-video-id="${videoData.id}">
                        </iframe>
                    </div>
                </div>
            `;
            
            this.restoreSelection();
            this.execCommand('insertHTML', videoHTML);
            
            const modal = document.getElementById('videoModal');
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
            
            this.updateHiddenField();
            
            console.log(`✅ Vidéo ${videoData.platform} insérée: ${videoData.id}`);
        }

        // ✅ CHARGEMENT CONTENU SANS SÉLECTION AUTOMATIQUE
        loadExistingContent() {
            if (this.hiddenField && this.hiddenField.value) {
                this.editor.innerHTML = this.hiddenField.value;
                
                setTimeout(() => {
                    const images = this.editor.querySelectorAll('img');
                    console.log(`🔄 Chargement contenu existant : ${images.length} image(s) détectée(s)`);
                    
                    images.forEach((img, index) => {
                        console.log(`📷 Configuration image ${index + 1}:`, img.src.substring(0, 50) + '...');
                        
                        if (this.isEditMode) {
                            this.setupImageBasicStyles(img);
                        } else {
                            this.setupReadOnlyImage(img);
                        }
                    });
                    
                    console.log('✅ Contenu existant chargé - Système opérationnel');
                    
                }, 100);
            }
        }

        // Méthodes standard
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
                        // Ignorer les erreurs
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

        updateHiddenField() {
            if (this.hiddenField) {
                this.hiddenField.value = this.editor.innerHTML;
            }
        }

        // Méthodes publiques
        getContent() {
            return this.editor.innerHTML;
        }

        setContent(content) {
            console.log('📝 Définition nouveau contenu dans l\'éditeur');
            this.editor.innerHTML = content;
            this.updateHiddenField();
            
            setTimeout(() => {
                const images = this.editor.querySelectorAll('img');
                console.log(`📷 Configuration de ${images.length} image(s) après setContent`);
                
                images.forEach((img, index) => {
                    console.log(`   📷 Image ${index + 1}: Configuration...`);
                    if (this.isEditMode) {
                        this.setupImageBasicStyles(img);
                    } else {
                        this.setupReadOnlyImage(img);
                    }
                });
                
                console.log('✅ setContent terminé');
            }, 100);
        }

        clear() {
            console.log('🧯 Nettoyage de l\'éditeur');
            this.editor.innerHTML = '';
            this.selectedImage = null;
            this.updateHiddenField();
        }

        focus() {
            this.editor.focus();
        }

        // ✅ NETTOYAGE AUTOMATIQUE DES SÉLECTIONS PARASITES
        cleanupAutoSelections() {
            const wrappers = document.querySelectorAll('.image-selection-wrapper');
            wrappers.forEach((wrapper) => {
                const img = wrapper.querySelector('img');
                if (img) {
                    const alignment = wrapper.dataset.alignment;
                    if (alignment && alignment !== 'default') {
                        img.classList.add(`align-${alignment}`);
                    }
                    wrapper.parentNode.insertBefore(img, wrapper);
                }
                wrapper.remove();
            });
            
            this.selectedImage = null;
            console.log('✅ Sélections automatiques nettoyées');
        }
    }

    // ✅ INITIALISATION AVEC NETTOYAGE AUTOMATIQUE
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Initialisation SimpleRichEditor v3.4...');
        
        // ✅ PREMIÈRE VÉRIFICATION : Nettoyage automatique si pas de richEditor
        const wasCleanedUp = autoCleanupImagesOnPageLoad();
        
        if (wasCleanedUp) {
            console.log('🎯 Page nettoyée automatiquement - Arrêt initialisation richEditor');
            return; // Pas besoin d'initialiser richEditor
        }
        
        // Initialisation normale si richEditor présent
        const editorContainer = document.getElementById('richEditorContainer');
        if (editorContainer) {
            window.richEditor = new SimpleRichEditor('richEditorContainer');
            console.log('✅ SimpleRichEditor v3.4 initialisé avec nettoyage automatique');
            
            // Nettoyage des sélections parasites après initialisation
            setTimeout(() => {
                if (window.richEditor) {
                    window.richEditor.cleanupAutoSelections();
                }
                
                console.log('🔍 === VÉRIFICATION FINALE ===');
                const images = document.querySelectorAll('.editor-content img, img');
                const wrappers = document.querySelectorAll('.image-selection-wrapper');
                const handles = document.querySelectorAll('.image-resize-handle');
                
                console.log(`📊 Images: ${images.length}`);
                console.log(`📦 Sélections auto: ${wrappers.length} (devrait être 0)`);
                console.log(`🎛️ Poignées auto: ${handles.length} (devrait être 0)`);
                console.log(`📝 Mode: ${window.richEditor?.isEditMode ? 'ÉDITION' : 'LECTURE'}`);
                
                if (window.richEditor?.isEditMode) {
                    console.log('💡 Mode ÉDITION: Cliquez sur une image pour la sélectionner');
                    console.log('💡 Double-cliquez sur une image pour l\'éditer');
                } else {
                    console.log('💡 Mode LECTURE: Images non interactives');
                }
                
                console.log('✅ Système prêt et opérationnel');
            }, 500);
            
        } else {
            console.error('❌ Container richEditorContainer introuvable!');
        }
    });

    window.SimpleRichEditor = SimpleRichEditor;

})(window);
