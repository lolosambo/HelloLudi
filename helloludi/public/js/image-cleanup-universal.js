/**
 * Image Cleanup - Script universel pour toutes les pages
 * À inclure sur TOUTES les pages (détail + édition)
 * Nettoie automatiquement les images sur les pages sans richEditor
 */
(function() {
    'use strict';
    
    console.log('🔍 === IMAGE CLEANUP UNIVERSEL ===');
    
    function universalImageCleanup() {
        console.log('🧹 Nettoyage universel des images...');
        
        // ✅ RÈGLE ABSOLUE : Pas de richEditor = Nettoyage immédiat
        const hasRichEditorContainer = !!document.getElementById('richEditorContainer');
        const hasRichEditorScript = !!window.SimpleRichEditor || !!window.richEditor;
        
        console.log('🎯 VÉRIFICATION:');
        console.log(`   richEditorContainer: ${hasRichEditorContainer ? '✅ PRÉSENT' : '❌ ABSENT'}`);
        console.log(`   richEditor script: ${hasRichEditorScript ? '✅ PRÉSENT' : '❌ ABSENT'}`);
        
        // Si aucun richEditor détecté, nettoyer immédiatement
        if (!hasRichEditorContainer && !hasRichEditorScript) {
            console.log('🎯 AUCUN richEditor → NETTOYAGE IMMÉDIAT');
            performCleanup();
            return true;
        }
        
        // Si richEditor présent mais on est sur une page de détail (URL detection)
        const isLikelyDetailPage = detectDetailPage();
        if (isLikelyDetailPage && hasRichEditorScript) {
            console.log('🎯 Page détail avec richEditor fantôme → NETTOYAGE');
            performCleanup();
            return true;
        }
        
        console.log('✏️ Page d\'édition détectée - Pas de nettoyage');
        return false;
    }
    
    function detectDetailPage() {
        const url = window.location.href;
        const path = window.location.pathname;
        
        // Indicateurs de page de détail
        const detailIndicators = [
            /\/show\/\d+/i.test(path),           // /show/123
            /\/article\/\d+/i.test(path),        // /article/123
            /\/post\/\d+/i.test(path),           // /post/123
            /\/detail\/\d+/i.test(path),         // /detail/123
            /\/\d+\/?$/i.test(path),             // /123 ou /123/
            !!document.querySelector('.article-content, .post-content, .blog-post'),
            !!document.querySelector('.comments, .comment-section'),
            !document.querySelector('form[method="POST"]'),
            !document.querySelector('button[type="submit"]'),
            !/edit|admin|create/i.test(path)
        ];
        
        const score = detailIndicators.filter(Boolean).length;
        console.log(`📊 Score page détail: ${score}/10`);
        
        return score >= 4;
    }
    
    function performCleanup() {
        console.log('🧹 === NETTOYAGE EN COURS ===');
        
        let cleanupCount = 0;
        
        // 1. Supprimer tous les wrappers de sélection
        const wrappers = document.querySelectorAll('.image-selection-wrapper, .forced-wrapper');
        console.log(`   🗑️ Suppression de ${wrappers.length} wrapper(s)`);
        
        wrappers.forEach((wrapper, index) => {
            const img = wrapper.querySelector('img');
            if (img) {
                // Restaurer alignement
                const alignment = wrapper.dataset.alignment;
                if (alignment && alignment !== 'default') {
                    img.classList.add(`align-${alignment}`);
                }
                wrapper.parentNode.insertBefore(img, wrapper);
                cleanupCount++;
            }
            wrapper.remove();
        });
        
        // 2. Supprimer toutes les poignées
        const handles = document.querySelectorAll('.image-resize-handle, .forced-handle');
        console.log(`   🗑️ Suppression de ${handles.length} poignée(s)`);
        handles.forEach(handle => {
            handle.remove();
            cleanupCount++;
        });
        
        // 3. Supprimer bordures de sélection
        const borders = document.querySelectorAll('.image-selection-border');
        console.log(`   🗑️ Suppression de ${borders.length} bordure(s)`);
        borders.forEach(border => {
            border.remove();
            cleanupCount++;
        });
        
        // 4. Nettoyer TOUTES les images
        const images = document.querySelectorAll('img');
        console.log(`   📷 Configuration de ${images.length} image(s) en lecture seule`);
        
        images.forEach((img, index) => {
            // Cloner pour supprimer tous événements
            const cleanImg = img.cloneNode(true);
            if (img.parentNode) {
                img.parentNode.replaceChild(cleanImg, img);
            }
            
            // Styles lecture seule FORCÉS
            cleanImg.style.cssText += `
                cursor: default !important;
                pointer-events: none !important;
            `;
            cleanImg.title = '';
            
            // Nettoyer attributs
            cleanImg.removeAttribute('data-processed');
            cleanImg.removeAttribute('data-interactive');
            cleanImg.removeAttribute('onclick');
            cleanImg.removeAttribute('ondblclick');
            
            // Anti-drag
            cleanImg.addEventListener('dragstart', (e) => e.preventDefault());
            
            // Marquer comme nettoyée
            cleanImg.dataset.cleanedUp = 'true';
            cleanupCount++;
        });
        
        console.log(`✅ NETTOYAGE TERMINÉ - ${cleanupCount} élément(s) traité(s)`);
        
        // Vérification après 500ms
        setTimeout(() => {
            verifyCleanup();
        }, 500);
    }
    
    function verifyCleanup() {
        console.log('🔍 === VÉRIFICATION POST-NETTOYAGE ===');
        
        const remainingWrappers = document.querySelectorAll('.image-selection-wrapper');
        const remainingHandles = document.querySelectorAll('.image-resize-handle');
        const interactiveImages = document.querySelectorAll('img:not([data-cleaned-up="true"])');
        const cleanedImages = document.querySelectorAll('img[data-cleaned-up="true"]');
        
        console.log(`📊 RÉSULTATS:`);
        console.log(`   Wrappers restants: ${remainingWrappers.length} (devrait être 0)`);
        console.log(`   Poignées restantes: ${remainingHandles.length} (devrait être 0)`);
        console.log(`   Images interactives: ${interactiveImages.length} (devrait être 0)`);
        console.log(`   Images nettoyées: ${cleanedImages.length}`);
        
        if (remainingWrappers.length === 0 && remainingHandles.length === 0) {
            console.log('🎉 SUCCESS: Page parfaitement nettoyée');
        } else {
            console.log('⚠️ Nettoyage supplémentaire nécessaire...');
            
            // Nettoyage forcé des éléments restants
            remainingWrappers.forEach(w => {
                console.log('   🔧 Force suppression wrapper restant');
                w.remove();
            });
            
            remainingHandles.forEach(h => {
                console.log('   🔧 Force suppression poignée restante');
                h.remove();
            });
            
            // Forcer les images restantes
            interactiveImages.forEach(img => {
                console.log('   🔧 Force nettoyage image restante');
                img.style.cursor = 'default';
                img.style.pointerEvents = 'none';
                img.dataset.cleanedUp = 'true';
            });
            
            console.log('✅ Nettoyage forcé terminé');
        }
    }
    
    // Surveillance continue pour les éléments ajoutés dynamiquement
    function setupContinuousMonitoring() {
        console.log('👁️ Mise en place surveillance continue...');
        
        const observer = new MutationObserver((mutations) => {
            let needsCleanup = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Vérifier si des éléments suspects sont ajoutés
                            if (node.classList?.contains('image-selection-wrapper') ||
                                node.classList?.contains('image-resize-handle') ||
                                node.tagName === 'IMG' ||
                                node.querySelector?.('img, .image-selection-wrapper, .image-resize-handle')) {
                                needsCleanup = true;
                            }
                        }
                    });
                }
            });
            
            if (needsCleanup) {
                console.log('🚨 Éléments suspects détectés - Nettoyage automatique');
                setTimeout(performCleanup, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('✅ Surveillance continue active');
    }
    
    // === EXÉCUTION AUTOMATIQUE ===
    
    function init() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        console.log('🚀 Initialisation Image Cleanup Universel');
        
        // Délai pour laisser le temps aux autres scripts de se charger
        setTimeout(() => {
            const wasCleanedUp = universalImageCleanup();
            
            if (wasCleanedUp) {
                console.log('🛡️ Mode surveillance activé');
                setupContinuousMonitoring();
            } else {
                console.log('✏️ Page d\'édition - Pas de surveillance');
            }
        }, 200);
    }
    
    // Lancer immédiatement si DOM déjà prêt, sinon attendre
    init();
    
    // Export pour tests manuels
    window.imageCleanup = {
        performCleanup: performCleanup,
        verifyCleanup: verifyCleanup,
        universalImageCleanup: universalImageCleanup
    };
    
    console.log('💡 Test manuel disponible: window.imageCleanup.performCleanup()');
    
})();
