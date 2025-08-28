/**
 * EditorUtils.js
 * Fonctions utilitaires pour l'éditeur
 */
(function(window) {
    'use strict';

    class EditorUtils {
        static generateId(prefix = 'editor') {
            return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        static debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        static throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }

        static isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }

        static getCaretPosition(element) {
            const selection = window.getSelection();
            if (selection.rangeCount === 0) return 0;

            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);

            return preCaretRange.toString().length;
        }

        static setCaretPosition(element, position) {
            const selection = window.getSelection();
            const range = document.createRange();

            let currentPos = 0;
            let found = false;

            function traverse(node) {
                if (found) return;

                if (node.nodeType === 3) {
                    const nextPos = currentPos + node.length;
                    if (position <= nextPos) {
                        range.setStart(node, position - currentPos);
                        range.setEnd(node, position - currentPos);
                        found = true;
                    }
                    currentPos = nextPos;
                } else {
                    for (let child of node.childNodes) {
                        traverse(child);
                        if (found) break;
                    }
                }
            }

            traverse(element);

            if (found) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        static formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';

            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        static isValidImageType(file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            return validTypes.includes(file.type);
        }

        static createElement(tag, attributes = {}, children = []) {
            const element = document.createElement(tag);

            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'style' && typeof value === 'object') {
                    Object.assign(element.style, value);
                } else if (key.startsWith('on') && typeof value === 'function') {
                    element.addEventListener(key.substring(2).toLowerCase(), value);
                } else {
                    element.setAttribute(key, value);
                }
            });

            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });

            return element;
        }

        static async copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return true;
                } catch (err) {
                    document.body.removeChild(textArea);
                    return false;
                }
            }
        }

        static getSelectedText() {
            const selection = window.getSelection();
            return selection.toString();
        }

        static log(...args) {
            if (window.EDITOR_DEBUG) {
                console.log('[RichEditor]', ...args);
            }
        }

        static isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }
    }

    // Exposer la classe globalement
    window.EditorUtils = EditorUtils;

})(window);