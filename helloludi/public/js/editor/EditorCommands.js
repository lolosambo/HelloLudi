/**
 * EditorCommands.js
 * Commandes d'édition et formatage
 */
(function(window) {
    'use strict';

    class EditorCommands {
        constructor(editorCore) {
            this.editor = editorCore;
        }

        execCommand(command, value = null) {
            this.editor.focus();
            this.editor.restoreRange();
            const result = document.execCommand(command, false, value);
            this.editor.updateHiddenField();
            return result;
        }

        applyFormat(format) {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);

            if (format === 'removeFormat') {
                this.execCommand('removeFormat');
                return;
            }

            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'blockquote', 'pre'].includes(format)) {
                let currentBlock = this.getBlockContainer(range.commonAncestorContainer);

                if (currentBlock && currentBlock !== this.editor.editor) {
                    const newElement = document.createElement(format);

                    const attributesToCopy = ['class', 'id'];
                    attributesToCopy.forEach(attr => {
                        if (currentBlock.hasAttribute(attr)) {
                            newElement.setAttribute(attr, currentBlock.getAttribute(attr));
                        }
                    });

                    while (currentBlock.firstChild) {
                        newElement.appendChild(currentBlock.firstChild);
                    }

                    currentBlock.parentNode.replaceChild(newElement, currentBlock);

                    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(format)) {
                        this.applyHeadingStyles(newElement);
                    }

                    const newRange = document.createRange();
                    newRange.selectNodeContents(newElement);
                    newRange.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } else {
                    this.execCommand('formatBlock', format);

                    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(format)) {
                        setTimeout(() => {
                            const headings = this.editor.editor.querySelectorAll(format);
                            headings.forEach(heading => this.applyHeadingStyles(heading));
                        }, 10);
                    }
                }
            }

            this.editor.updateHiddenField();

            setTimeout(() => {
                const formatSelect = document.getElementById('formatSelect');
                if (formatSelect) formatSelect.value = '';
            }, 100);
        }

        applyFont(fontFamily) {
            if (!fontFamily) return;

            this.editor.focus();
            this.editor.restoreRange();

            const selection = window.getSelection();
            if (selection.rangeCount > 0 && !selection.isCollapsed) {
                const span = document.createElement('span');
                span.style.fontFamily = fontFamily;

                try {
                    const range = selection.getRangeAt(0);
                    range.surroundContents(span);
                } catch (e) {
                    const range = selection.getRangeAt(0);
                    const contents = range.extractContents();
                    span.appendChild(contents);
                    range.insertNode(span);

                    range.selectNodeContents(span);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            } else {
                const container = this.getBlockContainer();
                if (container && container !== this.editor.editor) {
                    container.style.fontFamily = fontFamily;
                }
            }

            this.editor.updateHiddenField();
        }

        applyFontSize(size) {
            if (!size) return;

            this.editor.focus();
            this.editor.restoreRange();

            const selection = window.getSelection();
            if (selection.rangeCount > 0 && !selection.isCollapsed) {
                const span = document.createElement('span');
                span.style.fontSize = size;

                try {
                    const range = selection.getRangeAt(0);
                    range.surroundContents(span);
                } catch (e) {
                    const range = selection.getRangeAt(0);
                    const contents = range.extractContents();
                    span.appendChild(contents);
                    range.insertNode(span);

                    range.selectNodeContents(span);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            } else {
                const container = this.getBlockContainer();
                if (container && container !== this.editor.editor) {
                    container.style.fontSize = size;
                }
            }

            this.editor.updateHiddenField();
        }

        applyHeadingStyles(heading) {
            heading.style.removeProperty('font-family');
            heading.style.removeProperty('font-size');
            heading.style.removeProperty('font-weight');
            heading.style.removeProperty('font-style');

            heading.classList.add('editor-heading');
            heading.setAttribute('data-heading-level', heading.tagName.toLowerCase());

            heading.style.fontFamily = '"Delius Swash Caps", serif';
            heading.style.fontWeight = '400';
            heading.style.fontStyle = 'normal';
        }

        getBlockContainer(node = null) {
            if (!node) {
                const selection = window.getSelection();
                if (selection.rangeCount === 0) return null;
                node = selection.getRangeAt(0).commonAncestorContainer;
            }

            let currentBlock = node;

            while (currentBlock && currentBlock !== this.editor.editor) {
                if (currentBlock.nodeType === 1 &&
                    ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV', 'BLOCKQUOTE', 'PRE'].includes(currentBlock.tagName)) {
                    return currentBlock;
                }
                currentBlock = currentBlock.parentNode;
            }

            return null;
        }

        applyTextColor(color) {
            this.editor.focus();
            this.editor.restoreRange();
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && !selection.isCollapsed) {
                this.execCommand('foreColor', color);
            }
        }

        applyBackgroundColor(color) {
            this.editor.focus();
            this.editor.restoreRange();
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && !selection.isCollapsed) {
                this.execCommand('hiliteColor', color);
            }
        }

        insertQuote() {
            this.editor.focus();
            this.editor.restoreRange();

            const selection = window.getSelection();
            const selectedText = selection.toString();

            if (selectedText) {
                const blockquote = document.createElement('blockquote');
                blockquote.textContent = selectedText;
                this.insertHTML(blockquote.outerHTML);
            } else {
                this.insertHTML('<blockquote>Votre citation ici...</blockquote><p><br></p>');
            }
        }

        insertCode() {
            this.editor.focus();
            this.editor.restoreRange();

            const selection = window.getSelection();
            const selectedText = selection.toString();

            if (selectedText) {
                const code = document.createElement('code');
                code.textContent = selectedText;
                this.insertHTML(code.outerHTML);
            } else {
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                code.textContent = 'Votre code ici...';
                pre.appendChild(code);
                this.insertHTML(pre.outerHTML + '<p><br></p>');
            }
        }

        insertHTML(html) {
            this.editor.focus();

            if (this.editor.currentRange) {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(this.editor.currentRange);
            }

            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();

                const fragment = range.createContextualFragment(html);
                const lastNode = fragment.lastChild;

                range.insertNode(fragment);

                if (lastNode) {
                    range.setStartAfter(lastNode);
                    range.setEndAfter(lastNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            } else {
                this.editor.editor.insertAdjacentHTML('beforeend', html);
            }

            this.editor.updateHiddenField();
        }
    }

    // Exposer la classe globalement
    window.EditorCommands = EditorCommands;

})(window);