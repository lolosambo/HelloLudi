/**
 * Fonction de diagnostic pour tester les événements double-clic sur les images
 * À ajouter directement dans la console pour diagnostiquer les problèmes
 */

// Fonction pour tester manuellement les événements sur les images
function testImageEdit() {
    console.log('🧪 === TEST MANUEL ÉDITION IMAGE ===');
    
    const img = document.querySelector('.editor-content img');
    if (!img) {
        console.log('❌ Aucune image trouvée dans l\'éditeur');
        return;
    }
    
    console.log('📷 Image trouvée:', img.src.substring(0, 50) + '...');
    console.log('   - Cursor style:', img.style.cursor);
    console.log('   - Processed:', img.dataset.processed);
    
    // Test du double-clic
    console.log('🎯 Simulation double-clic...');
    
    const dblClickEvent = new MouseEvent('dblclick', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    
    img.dispatchEvent(dblClickEvent);
    
    // Vérifier si la modale s'ouvre
    setTimeout(() => {
        const modal = document.getElementById('imageModal');
        const isModalOpen = modal && modal.classList.contains('show');
        
        console.log('🎯 Résultat:');
        console.log(`   - Modale trouvée: ${modal ? '✅ OUI' : '❌ NON'}`);
        console.log(`   - Modale ouverte: ${isModalOpen ? '✅ OUI' : '❌ NON'}`);
        
        if (!isModalOpen) {
            console.log('❌ PROBLÈME: La modale ne s\'ouvre pas');
            console.log('🔧 Tentative d\'ouverture manuelle via richEditor...');
            
            if (window.richEditor && window.richEditor.editImage) {
                window.richEditor.editImage(img);
                
                setTimeout(() => {
                    const modalAfterManual = document.getElementById('imageModal');
                    const isModalOpenAfterManual = modalAfterManual && modalAfterManual.classList.contains('show');
                    console.log(`   - Modale après appel manuel: ${isModalOpenAfterManual ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
                }, 500);
            }
        }
    }, 500);
}

// Fonction pour diagnostiquer les images et les événements
function debugImages() {
    console.log('🔍 === DIAGNOSTIC COMPLET DES IMAGES ===');
    
    // Vérifier l'éditeur
    const editor = document.querySelector('.editor-content');
    if (!editor) {
        console.error('❌ .editor-content introuvable!');
        return;
    }
    console.log('✅ Éditeur trouvé');
    
    // Vérifier richEditor
    if (!window.richEditor) {
        console.error('❌ window.richEditor non défini!');
        return;
    }
    console.log('✅ richEditor disponible');
    
    // Lister les images
    const images = editor.querySelectorAll('img');
    console.log(`📊 ${images.length} image(s) dans l'éditeur`);
    
    if (images.length === 0) {
        console.log('ℹ️ Aucune image à analyser');
        return;
    }
    
    images.forEach((img, i) => {
        console.log(`📷 Image ${i+1}:`);
        console.log(`   - SRC: ${img.src.substring(0, 50)}...`);
        console.log(`   - Data-processed: ${img.dataset.processed}`);
        console.log(`   - Style cursor: ${img.style.cursor}`);
        console.log(`   - Computed cursor: ${window.getComputedStyle(img).cursor}`);
        console.log(`   - Custom width: ${img.dataset.customWidth || 'non définie'}`);
        console.log(`   - Title: ${img.title || 'non défini'}`);
        console.log(`   - Dimensions: ${img.offsetWidth}x${img.offsetHeight}px`);
        
        // Tester les event listeners
        console.log('   🔍 Test présence event listeners:');
        
        // Créer des événements de test
        const testClick = () => {
            console.log(`      ✅ Clic détecté sur image ${i+1}`);
        };
        
        const testDblClick = () => {
            console.log(`      ✅ Double-clic détecté sur image ${i+1}`);
        };
        
        // Attacher temporairement pour tester
        img.addEventListener('click', testClick, { once: true });
        img.addEventListener('dblclick', testDblClick, { once: true });
        
        // Simuler les événements
        setTimeout(() => {
            console.log(`   🧪 Test clic image ${i+1}:`);
            img.click();
            
            setTimeout(() => {
                console.log(`   🧪 Test double-clic image ${i+1}:`);
                img.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            }, 300);
        }, (i + 1) * 1000);
    });
    
    // Vérifier la modale
    setTimeout(() => {
        const modal = document.getElementById('imageModal');
        console.log('🎭 Modale imageModal:');
        console.log(`   - Trouvée: ${modal ? '✅ OUI' : '❌ NON'}`);
        if (modal) {
            console.log(`   - Classes: ${modal.className}`);
            console.log(`   - Style display: ${modal.style.display}`);
        }
        
        console.log('✅ Diagnostic terminé');
    }, images.length * 1000 + 2000);
}

// Fonction pour forcer la reconfiguration
function forceImageSetup() {
    console.log('🔄 === FORCE RECONFIGURATION ===');
    
    if (!window.richEditor) {
        console.error('❌ richEditor non disponible');
        return;
    }
    
    const images = document.querySelectorAll('.editor-content img');
    console.log(`🔧 Reconfiguration de ${images.length} image(s)...`);
    
    images.forEach((img, i) => {
        console.log(`   📷 Image ${i+1}: Suppression dataset...`);
        img.dataset.processed = 'false';
        
        console.log(`   📷 Image ${i+1}: Reconfiguration...`);
        if (window.richEditor.setupImageStyles) {
            window.richEditor.setupImageStyles(img);
        }
    });
    
    console.log('✅ Reconfiguration terminée');
    
    // Test automatique après reconfiguration
    setTimeout(() => {
        console.log('🧪 Test automatique après reconfiguration...');
        testImageEdit();
    }, 1000);
}

// Message d'aide
console.log('🛠️ === OUTILS DE DIAGNOSTIC CHARGÉS ===');
console.log('💡 Commandes disponibles:');
console.log('   - testImageEdit()     : Test l\'édition d\'une image');
console.log('   - debugImages()       : Diagnostic complet');
console.log('   - forceImageSetup()   : Force la reconfiguration');
console.log('📖 Tapez une de ces fonctions dans la console pour l\'exécuter');
