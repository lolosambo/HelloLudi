/**
 * EditorCore.js
 * Classe de base pour l'éditeur
 */
(function(window) {
    'use strict';

    class EditorCore {
        constructor(containerId, options = {}) {
            this.containerId = containerId;
            this.container = document.getElementById(containerId);
            this.options = {
                hiddenFieldId: 'content',
                uploadUrl: '/upload_image',
                placeholder: 'Commencez à taper votre contenu ici...',
                ...options
            };

            // États
            this.isInitialized = false;
            this.isFullscreen = false;
            this.isProcessing = false;
            this.currentRange = null;

            // Éléments DOM
            this.toolbar = null;
            this.editor = null;
            this.hiddenField = null;
        }

        createEditorStructure() {
            if (!this.container) {
                throw new Error(`Container with ID '${this.containerId}' not found`);
            }

            this.container.innerHTML = `
                <div class="rich-editor-container">
                    <div class="editor-toolbar"></div>
                    <div class="editor-content" 
                         contenteditable="true" 
                         data-placeholder="${this.options.placeholder}">
                    </div>
                </div>
            `;

            this.toolbar = this.container.querySelector('.editor-toolbar');
            this.editor = this.container.querySelector('.editor-content');

            this.initializeHiddenField();
        }

        initializeHiddenField() {
            const fieldName = this.options.hiddenFieldId
                .replace(/\[/g, '_')
                .replace(/\]/g, '')
                .replace(/__/g, '_');

            this.hiddenField = document.getElementById(fieldName) ||
                document.getElementById(this.options.hiddenFieldId);

            if (!this.hiddenField) {
                console.warn('Hidden field not found:', this.options.hiddenFieldId);
            } else if (this.hiddenField.value) {
                this.editor.innerHTML = this.hiddenField.value;
            }
        }

        updateHiddenField() {
            if (this.hiddenField) {
                this.hiddenField.value = this.cleanHTML(this.editor.innerHTML);
            }
        }

        cleanHTML(html) {
            html = html.replace(/&nbsp;{2,}/g, '&nbsp;');
            html = html.replace(/<p>\s*<\/p>/gi, '');
            html = html.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br>');
            html = html.replace(/\sstyle=""\s?/gi, '');
            return html.trim();
        }

        saveCurrentRange() {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                this.currentRange = selection.getRangeAt(0);
            }
        }

        restoreRange() {
            if (this.currentRange) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(this.currentRange);
            }
        }

        setContent(content) {
            this.editor.innerHTML = content;
            this.updateHiddenField();
        }

        getContent() {
            return this.editor.innerHTML;
        }

        getText() {
            return this.editor.textContent || this.editor.innerText;
        }

        clear() {
            this.editor.innerHTML = '<p><br></p>';
            this.updateHiddenField();
        }

        focus() {
            this.editor.focus();
        }

        isReady() {
            return this.isInitialized;
        }

        destroy() {
            this.isInitialized = false;
        }
    }

    // Exposer la classe globalement
    window.EditorCore = EditorCore;

})(window);