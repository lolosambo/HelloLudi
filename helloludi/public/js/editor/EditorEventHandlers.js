/**
 * EditorEventHandlers.js
 * Gestionnaires d'événements pour l'éditeur
 */
(function(window) {
    'use strict';

    class EditorEventHandlers {
        constructor(editorCore) {
            this.editor = editorCore;
            this.mutationObserver = null;
            this.inputTimeout = null;
            this.selectionChangeHandler = null;
        }

        setupAll() {
            this.setupEditorEvents();
            this.setupKeyboardShortcuts();
            this.setupPasteHandler();
            this.setupMutationObserver();
            this.setupFormEvents();
        }

        setupEditorEvents() {
            const editor = this.editor.editor;

            editor.addEventListener('input', () => {
                this.onInput();
            });

            editor.addEventListener('blur', () => {
                this.editor.saveCurrentRange();
                this.editor.updateHiddenField();
            });

            editor.addEventListener('click', () => this.editor.saveCurrentRange());
            editor.addEventListener('keyup', () => {
                this.editor.saveCurrentRange();
                if (this.editor.toolbar) {
                    this.editor.toolbar.updateButtonStates();
                    this.editor.toolbar.updateSelectors();
                }
            });

            editor.addEventListener('focus', () => {
                if (this.editor.toolbar) {
                    this.editor.toolbar.updateButtonStates();
                }
            });

            // Selection change
            this.selectionChangeHandler = () => {
                if (this.editor.editor.contains(window.getSelection().anchorNode)) {
                    if (this.editor.toolbar) {
                        this.editor.toolbar.updateButtonStates();
                        this.editor.toolbar.updateSelectors();
                    }
                }
            };
            document.addEventListener('selectionchange', this.selectionChangeHandler);
        }

        onInput() {
            this.editor.updateHiddenField();

            clearTimeout(this.inputTimeout);
            this.inputTimeout = setTimeout(() => {
                if (this.editor.history) {
                    this.editor.history.saveState();
                }
            }, 500);

            if (this.editor.styles) {
                this.editor.styles.applyHeadingStyles();
            }

            this.updatePlaceholder();
        }

        updatePlaceholder() {
            const isEmpty = !this.editor.editor.textContent.trim() &&
                !this.editor.editor.querySelector('img, iframe, table');

            this.editor.editor.classList.toggle('empty', isEmpty);
        }

        setupKeyboardShortcuts() {
            this.editor.editor.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    switch (e.key.toLowerCase()) {
                        case 'z':
                            e.preventDefault();
                            if (e.shiftKey) {
                                this.editor.history?.redo();
                            } else {
                                this.editor.history?.undo();
                            }
                            break;
                        case 'y':
                            e.preventDefault();
                            this.editor.history?.redo();
                            break;
                        case 'b':
                            e.preventDefault();
                            this.editor.commands?.execCommand('bold');
                            break;
                        case 'i':
                            e.preventDefault();
                            this.editor.commands?.execCommand('italic');
                            break;
                        case 'u':
                            e.preventDefault();
                            this.editor.commands?.execCommand('underline');
                            break;
                        case 'k':
                            e.preventDefault();
                            this.editor.mediaManager?.showLinkModal();
                            break;
                    }
                }

                if (e.key === 'Tab') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.editor.commands?.execCommand('outdent');
                    } else {
                        this.editor.commands?.execCommand('indent');
                    }
                }
            });
        }

        setupPasteHandler() {
            this.editor.editor.addEventListener('paste', (e) => {
                e.preventDefault();

                let html = '';
                let text = '';

                if (e.clipboardData) {
                    html = e.clipboardData.getData('text/html');
                    text = e.clipboardData.getData('text/plain');
                }

                if (html) {
                    const cleaned = this.cleanPastedHTML(html);
                    this.editor.commands?.insertHTML(cleaned);
                } else if (text) {
                    const lines = text.split('\n');
                    const htmlLines = lines.map(line => {
                        if (line.trim()) {
                            return `<p>${this.escapeHTML(line)}</p>`;
                        }
                        return '';
                    }).filter(line => line);

                    this.editor.commands?.insertHTML(htmlLines.join(''));
                }

                setTimeout(() => {
                    this.editor.history?.saveState();
                }, 100);
            });
        }

        cleanPastedHTML(html) {
            const temp = document.createElement('div');
            temp.innerHTML = html;

            temp.querySelectorAll('script, style, link, meta').forEach(el => el.remove());

            const allElements = temp.querySelectorAll('*');
            allElements.forEach(el => {
                const allowedAttrs = ['href', 'src', 'alt', 'title'];
                const attrs = Array.from(el.attributes);

                attrs.forEach(attr => {
                    if (!allowedAttrs.includes(attr.name)) {
                        el.removeAttribute(attr.name);
                    }
                });

                if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName)) {
                    el.removeAttribute('style');
                    el.removeAttribute('class');
                }
            });

            return temp.innerHTML;
        }

        escapeHTML(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        setupMutationObserver() {
            this.mutationObserver = new MutationObserver((mutations) => {
                let headingsModified = false;

                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.tagName && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.tagName)) {
                                headingsModified = true;
                            } else if (node.querySelector) {
                                const headings = node.querySelectorAll('h1, h2, h3, h4, h5, h6');
                                if (headings.length > 0) {
                                    headingsModified = true;
                                }
                            }
                        }
                    });
                });

                if (headingsModified && this.editor.styles) {
                    setTimeout(() => this.editor.styles.applyHeadingStyles(), 10);
                }
            });

            this.mutationObserver.observe(this.editor.editor, {
                childList: true,
                subtree: true
            });
        }

        setupFormEvents() {
            if (!this.editor.hiddenField) return;

            const form = this.editor.hiddenField.closest('form');
            if (!form) return;

            form.addEventListener('submit', () => {
                this.editor.updateHiddenField();
            });

            if (this.editor.hiddenField.hasAttribute('required')) {
                form.addEventListener('submit', (e) => {
                    if (!this.editor.getText().trim()) {
                        e.preventDefault();
                        alert('Le contenu est requis');
                        this.editor.focus();
                    }
                });
            }
        }

        cleanup() {
            if (this.mutationObserver) {
                this.mutationObserver.disconnect();
            }

            if (this.selectionChangeHandler) {
                document.removeEventListener('selectionchange', this.selectionChangeHandler);
            }
        }
    }

    // Exposer la classe globalement
    window.EditorEventHandlers = EditorEventHandlers;

})(window);