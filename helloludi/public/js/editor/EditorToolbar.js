/**
 * EditorToolbar.js
 * Gestion de la barre d'outils
 */
(function(window) {
    'use strict';

    class EditorToolbar {
        constructor(editorCore) {
            this.editor = editorCore;
            this.toolbar = editorCore.toolbar;
        }

        create() {
            this.toolbar.innerHTML = this.getToolbarHTML();
            this.setupEventListeners();
        }

        getToolbarHTML() {
            return `
                <!-- Groupe historique -->
                <div class="editor-group">
                    <button type="button" class="editor-btn" data-command="undo" title="Annuler (Ctrl+Z)">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="redo" title="Rétablir (Ctrl+Y)">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                </div>

                <!-- Groupe format de texte -->
                <div class="editor-group">
                    <select class="editor-select" id="formatSelect" title="Format du texte">
                        <option value="">Format</option>
                        <option value="h1">Titre 1</option>
                        <option value="h2">Titre 2</option>
                        <option value="h3">Titre 3</option>
                        <option value="h4">Titre 4</option>
                        <option value="h5">Titre 5</option>
                        <option value="p">Paragraphe</option>
                    </select>
                </div>

                <!-- Groupe police et taille -->
                <div class="editor-group">
                    <select class="editor-select" id="fontSelect" title="Police">
                        <option value="">Police par défaut</option>
                        <option value="'Delius Swash Caps', serif">Delius Swash Caps</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="Georgia, serif">Georgia</option>
                    </select>

                    <select class="editor-select" id="sizeSelect" title="Taille">
                        <option value="">Taille</option>
                        <option value="10px">10px</option>
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                        <option value="24px">24px</option>
                        <option value="32px">32px</option>
                    </select>
                </div>

                <!-- Groupe mise en forme -->
                <div class="editor-group">
                    <button type="button" class="editor-btn" data-command="bold" title="Gras (Ctrl+B)">
                        <i class="bi bi-type-bold"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="italic" title="Italique (Ctrl+I)">
                        <i class="bi bi-type-italic"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="underline" title="Souligné (Ctrl+U)">
                        <i class="bi bi-type-underline"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="strikeThrough" title="Barré">
                        <i class="bi bi-type-strikethrough"></i>
                    </button>
                </div>

                <!-- Groupe couleurs -->
                <div class="editor-group">
                    <div class="color-picker-wrapper">
                        <input type="color" id="textColor" title="Couleur du texte" value="#000000">
                        <label for="textColor"><i class="bi bi-palette"></i></label>
                    </div>
                    <div class="color-picker-wrapper">
                        <input type="color" id="bgColor" title="Couleur de fond" value="#ffff00">
                        <label for="bgColor"><i class="bi bi-paint-bucket"></i></label>
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
                    <button type="button" class="editor-btn" data-command="outdent" title="Diminuer le retrait">
                        <i class="bi bi-text-indent-left"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="indent" title="Augmenter le retrait">
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
                    <button type="button" class="editor-btn" id="tableBtn" title="Insérer un tableau">
                        <i class="bi bi-table"></i>
                    </button>
                    <button type="button" class="editor-btn" id="videoBtn" title="Insérer une vidéo YouTube">
                        <i class="bi bi-youtube"></i>
                    </button>
                </div>

                <!-- Groupe format spécial -->
                <div class="editor-group">
                    <button type="button" class="editor-btn" id="quoteBtn" title="Citation">
                        <i class="bi bi-quote"></i>
                    </button>
                    <button type="button" class="editor-btn" id="codeBtn" title="Code">
                        <i class="bi bi-code-square"></i>
                    </button>
                    <button type="button" class="editor-btn" data-command="insertHorizontalRule" title="Ligne horizontale">
                        <i class="bi bi-hr"></i>
                    </button>
                </div>

                <!-- Groupe utilitaires -->
                <div class="editor-group">
                    <button type="button" class="editor-btn" id="fullscreenBtn" title="Plein écran">
                        <i class="bi bi-fullscreen"></i>
                    </button>
                </div>
            `;
        }

        setupEventListeners() {
            // Boutons de commande simple
            const commandButtons = this.toolbar.querySelectorAll('[data-command]');
            commandButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const command = btn.dataset.command;
                    this.editor.execCommand(command);
                    this.updateButtonStates();
                });
            });

            // Sélecteurs
            this.setupSelectListeners();

            // Boutons spéciaux
            this.setupSpecialButtons();

            // Couleurs
            this.setupColorPickers();
        }

        setupSelectListeners() {
            const formatSelect = document.getElementById('formatSelect');
            const fontSelect = document.getElementById('fontSelect');
            const sizeSelect = document.getElementById('sizeSelect');

            if (formatSelect) {
                formatSelect.addEventListener('change', (e) => {
                    if (e.target.value) {
                        this.editor.applyFormat(e.target.value);
                    }
                });
            }

            if (fontSelect) {
                fontSelect.addEventListener('change', (e) => {
                    if (e.target.value) {
                        this.editor.applyFont(e.target.value);
                    }
                });
            }

            if (sizeSelect) {
                sizeSelect.addEventListener('change', (e) => {
                    if (e.target.value) {
                        this.editor.applyFontSize(e.target.value);
                    }
                });
            }
        }

        setupSpecialButtons() {
            const specialButtons = {
                'linkBtn': () => this.editor.showLinkModal(),
                'imageBtn': () => this.editor.showImageModal(),
                'tableBtn': () => this.editor.showTableModal(),
                'videoBtn': () => this.editor.showVideoModal(),
                'quoteBtn': () => this.editor.insertQuote(),
                'codeBtn': () => this.editor.insertCode(),
                'fullscreenBtn': () => this.editor.toggleFullscreen()
            };

            Object.entries(specialButtons).forEach(([id, handler]) => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.addEventListener('click', handler);
                }
            });
        }

        setupColorPickers() {
            const textColorPicker = document.getElementById('textColor');
            const bgColorPicker = document.getElementById('bgColor');

            if (textColorPicker) {
                textColorPicker.addEventListener('change', (e) => {
                    this.editor.applyTextColor(e.target.value);
                });
            }

            if (bgColorPicker) {
                bgColorPicker.addEventListener('change', (e) => {
                    this.editor.applyBackgroundColor(e.target.value);
                });
            }
        }

        updateButtonStates() {
            const commands = ['bold', 'italic', 'underline', 'strikeThrough',
                'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'];

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
        }

        updateSelectors() {
            // Mise à jour du format
            const formatSelect = document.getElementById('formatSelect');
            if (formatSelect) {
                const container = this.editor.getBlockContainer();
                if (container && container.tagName) {
                    formatSelect.value = container.tagName.toLowerCase();
                } else {
                    formatSelect.value = '';
                }
            }

            // Mise à jour de la police et de la taille
            this.updateFontSelectors();
        }

        updateFontSelectors() {
            const fontSelect = document.getElementById('fontSelect');
            const sizeSelect = document.getElementById('sizeSelect');

            const container = this.editor.getBlockContainer();
            if (!container) return;

            const computedStyle = window.getComputedStyle(container);

            // Police
            if (fontSelect) {
                const fontFamily = computedStyle.fontFamily;
                let found = false;

                for (let option of fontSelect.options) {
                    if (option.value && fontFamily.includes(option.value.split(',')[0].replace(/['"]/g, ''))) {
                        fontSelect.value = option.value;
                        found = true;
                        break;
                    }
                }

                if (!found) fontSelect.value = '';
            }

            // Taille
            if (sizeSelect) {
                const fontSize = computedStyle.fontSize;
                sizeSelect.value = fontSize || '';
            }
        }
    }

    // Exposer la classe globalement
    window.EditorToolbar = EditorToolbar;

})(window);