/**
 * Protection contre l'affichage des boutons d'édition hors éditeur
 * Ce script s'assure que les boutons d'édition n'apparaissent que dans l'éditeur
 */

(function() {
    'use strict';

    // Fonction de nettoyage des boutons d'édition hors éditeur
    function cleanupEditButtonsOutsideEditor() {
        console.log('🛡️ Vérification des boutons d\'édition hors éditeur...');

        // Vérifier d'abord si on est sur une page avec éditeur
        const hasEditor = document.getElementById('richEditorContainer') || 
                         document.querySelector('.rich-editor-container') ||
                         document.querySelector('.editor-content[contenteditable="true"]') ||
                         window.richEditor;

        if (hasEditor) {
            console.log('✅ Éditeur détecté - Protection allégée');
            // Sur les pages d'édition, on ne supprime que les boutons vraiment hors éditeur
            const unauthorizedButtons = document.querySelectorAll('.post-content .table-edit-btn');
            if (unauthorizedButtons.length > 0) {
                console.log(`🧹 Suppression de ${unauthorizedButtons.length} bouton(s) hors contexte d'édition`);
                unauthorizedButtons.forEach(button => button.remove());
            }
            return;
        }

        // Sur les pages sans éditeur, supprimer tous les boutons
        const allEditButtons = document.querySelectorAll('.table-edit-btn');
        
        if (allEditButtons.length === 0) {
            console.log('✅ Aucun bouton d\'édition trouvé');
            return;
        }

        console.log(`🔍 ${allEditButtons.length} bouton(s) d'édition trouvé(s) sur page sans éditeur`);
        
        allEditButtons.forEach((button, index) => {
            console.log(`🗑️ Suppression du bouton ${index + 1} (page sans éditeur)`);
            button.remove();
        });

        console.log('✅ Nettoyage terminé');
    }

    // Exécuter le nettoyage après chargement de la page
    document.addEventListener('DOMContentLoaded', function() {
        // Attendre que tout soit chargé
        setTimeout(() => {
            cleanupEditButtonsOutsideEditor();
        }, 1000);
    });

    // Nettoyage périodique léger
    setInterval(() => {
        const unauthorizedButtons = document.querySelectorAll('.post-content .table-edit-btn, .post-detail-container .table-edit-btn');
        if (unauthorizedButtons.length > 0) {
            console.log(`🧹 Nettoyage périodique : ${unauthorizedButtons.length} bouton(s) non autorisé(s) supprimé(s)`);
            unauthorizedButtons.forEach(button => button.remove());
        }
    }, 5000);

    // Observer les changements DOM pour réagir rapidement
    const observer = new MutationObserver((mutations) => {
        // Vérifier d'abord si on a un éditeur sur la page
        const hasEditor = document.getElementById('richEditorContainer') || 
                         document.querySelector('.rich-editor-container') ||
                         window.richEditor;
        
        if (hasEditor) {
            // Sur les pages avec éditeur, surveillance allégée
            return;
        }

        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Vérifier s'il y a des boutons d'édition ajoutés
                        const newButtons = node.classList && node.classList.contains('table-edit-btn') 
                            ? [node] 
                            : node.querySelectorAll ? node.querySelectorAll('.table-edit-btn') : [];

                        newButtons.forEach(button => {
                            // Sur page sans éditeur, supprimer tous les nouveaux boutons
                            console.log('🚫 Bouton d\'édition non autorisé détecté et supprimé (page sans éditeur)');
                            button.remove();
                        });
                    }
                });
            }
        });
    });

    // Observer tout le document mais avec une configuration légère
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Rendre la fonction disponible globalement pour les tests
    window.cleanupEditButtonsOutsideEditor = cleanupEditButtonsOutsideEditor;

    console.log('🛡️ Protection des boutons d\'édition activée');

})();
