/**
 * Protection simple contre l'affichage des boutons d'édition sur les pages de détail
 * Ce script ne s'active que sur les pages sans éditeur (pages de lecture)
 */

(function() {
    'use strict';

    // Fonction simple de nettoyage
    function cleanupEditButtonsOnReadOnlyPages() {
        // Vérifier si on est sur une page avec éditeur
        const hasEditor = document.getElementById('richEditorContainer') || 
                         document.querySelector('.rich-editor-container') ||
                         document.querySelector('.editor-content[contenteditable="true"]') ||
                         window.richEditor;

        if (hasEditor) {
            console.log('✅ Éditeur détecté - Pas de nettoyage nécessaire');
            return;
        }

        // Sur les pages sans éditeur (détail/lecture), supprimer tous les boutons
        const allEditButtons = document.querySelectorAll('.table-edit-btn');
        
        if (allEditButtons.length > 0) {
            console.log(`🧹 Suppression de ${allEditButtons.length} bouton(s) d'édition (page de lecture)`);
            allEditButtons.forEach(button => button.remove());
        }
    }

    // Exécuter seulement sur les pages de détail
    if (document.querySelector('.post-detail-container') || 
        document.querySelector('.post-content')) {
        
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(cleanupEditButtonsOnReadOnlyPages, 1000);
        });

        console.log('🛡️ Protection activée pour page de lecture');
    }

})();
