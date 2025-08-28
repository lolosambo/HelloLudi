/**
 * Script de debug et correction pour l'éditeur
 * À ajouter temporairement pour résoudre les problèmes de dimensions
 */
document.addEventListener('DOMContentLoaded', function() {
    // Attendre un peu que l'éditeur se charge
    setTimeout(() => {
        console.log('=== DEBUG ÉDITEUR ===');
        
        const container = document.getElementById('richEditorContainer');
        const richEditor = document.querySelector('.rich-editor-container');
        const formContainer = document.querySelector('.form-container');
        
        console.log('Container trouvé:', !!container);
        console.log('Rich editor trouvé:', !!richEditor);
        console.log('Form container trouvé:', !!formContainer);
        
        if (richEditor) {
            console.log('Classes de l\'éditeur:', richEditor.className);
            console.log('Style de l\'éditeur:', richEditor.style.cssText);
            
            // Forcer les bonnes dimensions
            richEditor.style.position = 'relative';
            richEditor.style.width = '100%';
            richEditor.style.maxWidth = '100%';
            richEditor.style.left = 'auto';
            richEditor.style.top = 'auto';
            richEditor.style.right = 'auto';
            richEditor.style.bottom = 'auto';
            richEditor.style.zIndex = 'auto';
            
            // Retirer la classe fullscreen si elle existe
            if (richEditor.classList.contains('fullscreen')) {
                console.log('PROBLÈME: L\'éditeur est en mode plein écran !');
                richEditor.classList.remove('fullscreen');
                
                // Réinitialiser le bouton
                const fullscreenBtn = document.getElementById('fullscreenBtn');
                if (fullscreenBtn) {
                    fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
                    fullscreenBtn.title = 'Plein écran';
                }
            }
            
            console.log('Corrections appliquées');
        }
        
        // Vérifier la présence de CSS conflictuels
        const computedStyle = window.getComputedStyle(richEditor || document.body);
        console.log('Position calculée:', computedStyle.position);
        console.log('Width calculée:', computedStyle.width);
        console.log('Z-index calculé:', computedStyle.zIndex);
        
    }, 1000);
    
    // Fonction pour réinitialiser l'éditeur
    window.resetEditor = function() {
        const richEditor = document.querySelector('.rich-editor-container');
        if (richEditor) {
            richEditor.classList.remove('fullscreen');
            richEditor.style.cssText = '';
            console.log('Éditeur réinitialisé');
        }
    };
    
    // Surveiller les changements de classe
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList && target.classList.contains('rich-editor-container')) {
                    console.log('Changement de classe détecté:', target.className);
                    if (target.classList.contains('fullscreen')) {
                        console.log('ATTENTION: Mode plein écran activé !');
                    }
                }
            }
        });
    });
    
    setTimeout(() => {
        const richEditor = document.querySelector('.rich-editor-container');
        if (richEditor) {
            observer.observe(richEditor, { attributes: true, attributeFilter: ['class'] });
        }
    }, 500);
});
