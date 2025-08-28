/**
 * VERSION DEBUG - RichEditor avec alignement simplifié
 * Pour identifier le problème d'alignement
 */

// Version de test avec logs détaillés
function debugImageAlignment() {
    console.log('🔍 DEBUT DEBUG ALIGNEMENT');
    
    // Trouver toutes les images dans l'éditeur
    const editor = document.querySelector('.editor-content');
    if (!editor) {
        console.error('❌ Éditeur non trouvé');
        return;
    }
    
    const images = editor.querySelectorAll('img');
    console.log(`📸 ${images.length} image(s) trouvée(s)`);
    
    images.forEach((img, index) => {
        console.log(`--- Image ${index + 1} ---`);
        console.log('Classes:', img.className);
        console.log('Styles inline:', img.style.cssText);
        
        const computed = window.getComputedStyle(img);
        console.log('Float computed:', computed.float);
        console.log('Margin computed:', computed.margin);
        console.log('Display computed:', computed.display);
        
        // Test d'alignement forcé
        if (img.classList.contains('align-left')) {
            console.log('🎯 Image avec align-left détectée - Application forcée');
            img.style.cssText = `
                float: left !important;
                margin: 5px 15px 15px 5px !important;
                clear: left !important;
                max-width: 50% !important;
                display: block !important;
            `;
            console.log('✅ Styles appliqués:', img.style.cssText);
        }
        
        if (img.classList.contains('align-right')) {
            console.log('🎯 Image avec align-right détectée - Application forcée');
            img.style.cssText = `
                float: right !important;
                margin: 5px 5px 15px 15px !important;
                clear: right !important;
                max-width: 50% !important;
                display: block !important;
            `;
            console.log('✅ Styles appliqués:', img.style.cssText);
        }
        
        if (img.classList.contains('align-center')) {
            console.log('🎯 Image avec align-center détectée - Application forcée');
            img.style.cssText = `
                display: block !important;
                margin: 15px auto !important;
                float: none !important;
                max-width: 100% !important;
            `;
            console.log('✅ Styles appliqués:', img.style.cssText);
        }
    });
    
    console.log('🔍 FIN DEBUG ALIGNEMENT');
}

// Fonction de test pour forcer l'alignement
function forceImageAlignment() {
    const images = document.querySelectorAll('.editor-content img');
    
    images.forEach(img => {
        if (img.classList.contains('align-left')) {
            img.style.float = 'left';
            img.style.margin = '5px 15px 15px 5px';
            img.style.clear = 'left';
            img.style.maxWidth = '50%';
            console.log('🔧 Alignement gauche forcé sur:', img);
        }
        
        if (img.classList.contains('align-right')) {
            img.style.float = 'right';
            img.style.margin = '5px 5px 15px 15px';
            img.style.clear = 'right';
            img.style.maxWidth = '50%';
            console.log('🔧 Alignement droite forcé sur:', img);
        }
        
        if (img.classList.contains('align-center')) {
            img.style.display = 'block';
            img.style.margin = '15px auto';
            img.style.float = 'none';
            console.log('🔧 Alignement centre forcé sur:', img);
        }
    });
}

// Ajouter les fonctions au window pour les tests
window.debugImageAlignment = debugImageAlignment;
window.forceImageAlignment = forceImageAlignment;

// Auto-execution au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Script debug alignement chargé');
    
    // Attendre que l'éditeur soit initialisé
    setTimeout(() => {
        if (document.querySelector('.editor-content')) {
            console.log('📝 Éditeur détecté - Debug automatique dans 2s');
            setTimeout(debugImageAlignment, 2000);
        }
    }, 1000);
});

console.log('📦 Script debug alignement initialisé');