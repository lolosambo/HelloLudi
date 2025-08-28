/**
 * EditorStyles.js
 * Gestion des styles et du formatage
 */
(function(window) {
    'use strict';

    class EditorStyles {
        constructor(editorCore) {
            this.editor = editorCore;
        }

        applyHeadingStyles() {
            const headings = this.editor.editor.querySelectorAll('h1, h2, h3, h4, h5, h6');

            headings.forEach(heading => {
                this.styleHeading(heading);
            });
        }

        styleHeading(heading) {
            const existingStyles = this.parseStyles(heading.getAttribute('style') || '');

            delete existingStyles['font-family'];
            delete existingStyles['font-size'];
            delete existingStyles['font-weight'];
            delete existingStyles['font-style'];

            existingStyles['font-family'] = '"Delius Swash Caps", serif';
            existingStyles['font-weight'] = '400';
            existingStyles['font-style'] = 'normal';

            const newStyle = Object.entries(existingStyles)
                .map(([prop, val]) => `${prop}: ${val}`)
                .join('; ');

            heading.setAttribute('style', newStyle);

            heading.classList.add('editor-heading');
            heading.setAttribute('data-heading-level', heading.tagName.toLowerCase());
        }

        parseStyles(styleString) {
            const styles = {};

            if (styleString) {
                styleString.split(';').forEach(style => {
                    if (style.trim()) {
                        const [property, value] = style.split(':').map(s => s.trim());
                        if (property && value) {
                            styles[property] = value;
                        }
                    }
                });
            }

            return styles;
        }

        toggleFullscreen() {
            this.editor.isFullscreen = !this.editor.isFullscreen;
            const container = this.editor.container;
            const fullscreenBtn = document.getElementById('fullscreenBtn');

            if (this.editor.isFullscreen) {
                container.classList.add('fullscreen-editor');
                if (fullscreenBtn) {
                    fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
                }
                document.body.style.overflow = 'hidden';

                this.addFullscreenStyles();
            } else {
                container.classList.remove('fullscreen-editor');
                if (fullscreenBtn) {
                    fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
                }
                document.body.style.overflow = '';

                this.removeFullscreenStyles();
            }
        }

        addFullscreenStyles() {
            if (document.getElementById('editor-fullscreen-styles')) return;

            const style = document.createElement('style');
            style.id = 'editor-fullscreen-styles';
            style.textContent = `
                .fullscreen-editor {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    z-index: 9999 !important;
                    background: white !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                
                .fullscreen-editor .rich-editor-container {
                    height: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                    border-radius: 0 !important;
                }
                
                .fullscreen-editor .editor-content {
                    flex: 1 !important;
                    overflow-y: auto !important;
                    max-height: none !important;
                }
            `;

            document.head.appendChild(style);
        }

        removeFullscreenStyles() {
            const style = document.getElementById('editor-fullscreen-styles');
            if (style) {
                style.remove();
            }
        }

        getComputedStyles(element) {
            return window.getComputedStyle(element);
        }

        applyColorTheme(theme) {
            const themes = {
                'default': {
                    '--editor-primary': '#007bff',
                    '--editor-border': '#dee2e6',
                    '--editor-bg': '#ffffff',
                    '--editor-toolbar-bg': '#f8f9fa'
                },
                'dark': {
                    '--editor-primary': '#0d6efd',
                    '--editor-border': '#495057',
                    '--editor-bg': '#212529',
                    '--editor-toolbar-bg': '#343a40'
                },
                'minimal': {
                    '--editor-primary': '#6c757d',
                    '--editor-border': '#e9ecef',
                    '--editor-bg': '#ffffff',
                    '--editor-toolbar-bg': '#ffffff'
                }
            };

            const selectedTheme = themes[theme] || themes['default'];
            const container = this.editor.container.querySelector('.rich-editor-container');

            if (container) {
                Object.entries(selectedTheme).forEach(([property, value]) => {
                    container.style.setProperty(property, value);
                });
            }
        }
    }

    // Exposer la classe globalement
    window.EditorStyles = EditorStyles;

})(window);