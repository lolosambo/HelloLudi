/**
 * EditorHistory.js
 * Système d'historique pour undo/redo
 */
(function(window) {
    'use strict';

    class EditorHistory {
        constructor(editorCore) {
            this.editor = editorCore;
            this.history = [];
            this.historyIndex = -1;
            this.maxHistory = 50;
            this.isUpdating = false;
        }

        saveState() {
            if (this.isUpdating) return;

            const state = this.editor.editor.innerHTML;

            if (this.history.length === 0 || this.history[this.historyIndex] !== state) {
                this.history = this.history.slice(0, this.historyIndex + 1);
                this.history.push(state);
                this.historyIndex++;

                if (this.history.length > this.maxHistory) {
                    this.history.shift();
                    this.historyIndex--;
                }
            }
        }

        undo() {
            if (this.canUndo()) {
                this.isUpdating = true;
                this.historyIndex--;
                this.restoreState(this.history[this.historyIndex]);
                this.isUpdating = false;
                return true;
            }
            return false;
        }

        redo() {
            if (this.canRedo()) {
                this.isUpdating = true;
                this.historyIndex++;
                this.restoreState(this.history[this.historyIndex]);
                this.isUpdating = false;
                return true;
            }
            return false;
        }

        restoreState(state) {
            this.editor.editor.innerHTML = state;
            this.editor.updateHiddenField();

            if (this.editor.applyHeadingStyles) {
                this.editor.applyHeadingStyles();
            }
        }

        canUndo() {
            return this.historyIndex > 0;
        }

        canRedo() {
            return this.historyIndex < this.history.length - 1;
        }

        clear() {
            this.history = [this.editor.editor.innerHTML];
            this.historyIndex = 0;
        }

        getStats() {
            return {
                total: this.history.length,
                current: this.historyIndex + 1,
                canUndo: this.canUndo(),
                canRedo: this.canRedo()
            };
        }
    }

    // Exposer la classe globalement
    window.EditorHistory = EditorHistory;

})(window);