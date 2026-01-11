/**
 * ============================================
 * BASE LAYOUT JAVASCRIPT - Fonctionnalités communes à toutes les pages
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏛️ Template de base - Initialisation des fonctionnalités communes');
    
    initializeTooltips();
    initializeEditorButtonsFix();
});

/**
 * Initialise les tooltips Bootstrap
 */
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    console.log(`✅ ${tooltipList.length} tooltips initialisés`);
}

/**
 * Fix pour les boutons de l'éditeur qui ne répondent pas
 */
function initializeEditorButtonsFix() {
    setTimeout(() => {
        const editorButtons = document.querySelectorAll('.editor-btn');
        if (editorButtons.length === 0) {
            return; // Pas d'éditeur sur cette page
        }
        
        console.log(`🔧 Fix pour ${editorButtons.length} boutons d'éditeur`);
        
        // Réattacher manuellement les événements aux boutons
        editorButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const editor = window.EditorAPI?.getInstance();
                if (!editor) return;

                const command = this.dataset.command;
                if (command) {
                    console.log('Executing command:', command);
                    editor.execCommand(command);
                } else {
                    console.log('Special button clicked:', this.id);
                    // Actions spéciales
                    switch(this.id) {
                        case 'linkBtn':
                            editor.showModal('link');
                            break;
                        case 'imageBtn':
                            editor.showModal('image');
                            break;
                        case 'quoteBtn':
                            editor.insertQuote();
                            break;
                        case 'codeBtn':
                            editor.insertCode();
                            break;
                    }
                }
            });
        });

        console.log('✅ Événements manuels attachés aux boutons d\'éditeur');
    }, 1000);
}

/**
 * Utilitaires globaux
 */
window.BaseUtils = {
    /**
     * Affiche un message de notification
     */
    showNotification: function(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Insérer au début du body
        document.body.insertBefore(alertDiv, document.body.firstChild);
        
        // Auto-supprimer après 5 secondes
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    },
    
    /**
     * Débounce une fonction
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Vérifie si un élément est visible dans la viewport
     */
    isElementInViewport: function(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};
