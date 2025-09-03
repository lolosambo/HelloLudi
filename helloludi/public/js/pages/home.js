/**
 * ============================================
 * HOME PAGE JAVASCRIPT - Fonctionnalités de la page d'accueil
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 Page d\'accueil - Initialisation des fonctionnalités');
    
    initializeShareDropdowns();
});

/**
 * Initialise les dropdowns de partage
 */
function initializeShareDropdowns() {
    console.log('Initialisation des dropdowns de partage...');
    
    // Gestion du bouton copier
    const copyButtons = document.querySelectorAll('.share-link.copy');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const url = this.getAttribute('data-copy-url');
            const originalHTML = this.innerHTML;
            
            // Copier dans le presse-papiers
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(url).then(() => {
                    showCopySuccess(this, originalHTML);
                }).catch(() => {
                    fallbackCopy(url, this, originalHTML);
                });
            } else {
                fallbackCopy(url, this, originalHTML);
            }
        });
    });
    
    console.log(`✅ ${copyButtons.length} boutons de copie initialisés`);
}

/**
 * Affiche le succès de la copie
 */
function showCopySuccess(button, originalHTML) {
    button.innerHTML = '<i class="fas fa-check"></i> Copié !';
    button.style.color = '#28a745';
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.color = '';
    }, 2500);
}

/**
 * Méthode de fallback pour la copie
 */
function fallbackCopy(text, button, originalHTML) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const success = document.execCommand('copy');
        if (success) {
            showCopySuccess(button, originalHTML);
        }
    } catch (err) {
        console.error('Erreur lors de la copie:', err);
    }
    
    document.body.removeChild(textArea);
}
