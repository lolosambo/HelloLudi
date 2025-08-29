// 🔧 CORRECTION SPÉCIFIQUE REDIMENSIONNEMENT
// À ajouter après l'initialisation de SimpleRichEditor

function forceResizeWorking() {
    console.log('🔧 === CORRECTION FORCÉE REDIMENSIONNEMENT ===');
    
    if (!window.richEditor) {
        console.error('❌ richEditor non disponible');
        return false;
    }
    
    // Surcharger la méthode de sélection pour garantir le bon fonctionnement
    const originalSelectImage = window.richEditor.selectImage;
    
    window.richEditor.selectImage = function(img) {
        console.log('📌 Sélection image avec correction redimensionnement');
        
        // Désélectionner l'ancienne
        this.deselectImage();
        
        this.selectedImage = img;
        
        // Créer wrapper FORCÉ
        this.createSelectionWrapperForced(img);
    };
    
    // Nouvelle méthode de création de wrapper GARANTIE
    window.richEditor.createSelectionWrapperForced = function(img) {
        console.log('📦 Création wrapper FORCÉE');
        
        // Détecter alignement
        const alignment = this.getImageAlignment(img);
        
        // Créer wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'image-selection-wrapper forced-wrapper';
        wrapper.dataset.alignment = alignment;
        
        // Styles wrapper FORCÉS
        wrapper.style.cssText = `
            position: relative !important;
            display: inline-block !important;
            margin: 10px 5px !important;
            max-width: 100% !important;
            border: 2px dashed #007bff !important;
            padding: 2px !important;
        `;
        
        // Insérer wrapper
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        // Nettoyer classes image
        img.classList.remove('align-left', 'align-right', 'align-center');
        
        // Créer bordure visible
        const border = document.createElement('div');
        border.className = 'image-selection-border';
        border.style.cssText = `
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            border: 2px solid #007bff !important;
            pointer-events: none !important;
            z-index: 10 !important;
        `;
        wrapper.appendChild(border);
        
        // Créer poignée VISIBLE et FONCTIONNELLE
        const handle = document.createElement('div');
        handle.className = 'image-resize-handle forced-handle';
        handle.innerHTML = '↘';
        
        handle.style.cssText = `
            position: absolute !important;
            bottom: -15px !important;
            right: -15px !important;
            width: 30px !important;
            height: 30px !important;
            background: #007bff !important;
            border: 4px solid white !important;
            border-radius: 50% !important;
            cursor: se-resize !important;
            z-index: 1001 !important;
            font-size: 16px !important;
            color: white !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-weight: bold !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
            user-select: none !important;
            transform: scale(1) !important;
            transition: transform 0.2s !important;
        `;
        
        wrapper.appendChild(handle);
        
        // Configuration redimensionnement FORCÉ
        this.setupForcedResizing(handle, img, wrapper);
        
        console.log('✅ Wrapper forcé créé avec poignée visible');
    };
    
    // Configuration redimensionnement FORCÉ
    window.richEditor.setupForcedResizing = function(handle, img, wrapper) {
        console.log('⚡ Configuration redimensionnement FORCÉ');
        
        let isDragging = false;
        let startX, startY, startWidth;
        
        // Effet hover
        handle.addEventListener('mouseenter', () => {
            handle.style.transform = 'scale(1.1)';
            handle.style.backgroundColor = '#0056b3';
        });
        
        handle.addEventListener('mouseleave', () => {
            if (!isDragging) {
                handle.style.transform = 'scale(1)';
                handle.style.backgroundColor = '#007bff';
            }
        });
        
        const startResize = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🎯 DÉBUT REDIMENSIONNEMENT FORCÉ');
            console.log('   📍 Position:', e.clientX, e.clientY);
            
            isDragging = true;
            this.isResizing = true;
            
            // Position départ
            startX = e.clientX;
            startY = e.clientY;
            
            // Largeur départ
            const rect = img.getBoundingClientRect();
            startWidth = rect.width;
            
            console.log('   📏 Largeur départ:', startWidth + 'px');
            
            // Styles feedback VISIBLES
            document.body.style.cursor = 'se-resize';
            document.body.style.userSelect = 'none';
            handle.style.backgroundColor = '#dc3545';
            handle.style.transform = 'scale(1.3)';
            handle.style.borderColor = '#ffc107';
            
            // Classes feedback
            wrapper.classList.add('resizing');
            wrapper.style.borderColor = '#dc3545';
            img.classList.add('resizing');
            
            // Empêcher sélection
            const preventSelection = (e) => {
                e.preventDefault();
                return false;
            };
            
            // Fonction redimensionnement
            const handleResize = (e) => {
                if (!isDragging) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                // Calculer nouvelle largeur
                const deltaX = e.clientX - startX;
                let newWidth = startWidth + deltaX;
                
                // Limites généreuses
                newWidth = Math.max(50, Math.min(newWidth, window.innerWidth * 0.95));
                
                console.log('🔄 Redimensionnement FORCÉ:', newWidth + 'px');
                
                // Application BRUTALE de la taille
                img.style.width = newWidth + 'px';
                img.style.height = 'auto';
                img.style.maxWidth = 'none';
                img.style.minWidth = '50px';
                
                // Force les propriétés
                img.setAttribute('width', newWidth);
                img.dataset.customWidth = newWidth + 'px';
                
                // Forcer le re-rendu
                img.offsetHeight; // Force reflow
                wrapper.offsetHeight; // Force reflow wrapper
                
                // Mettre à jour titre pour debug
                img.title = `Largeur: ${newWidth}px - Redimensionnement actif`;
            };
            
            // Fonction arrêt
            const stopResize = (e) => {
                if (!isDragging) return;
                
                console.log('🏁 FIN REDIMENSIONNEMENT FORCÉ');
                
                isDragging = false;
                this.isResizing = false;
                
                // Restaurer styles
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                handle.style.backgroundColor = '#007bff';
                handle.style.transform = 'scale(1)';
                handle.style.borderColor = 'white';
                
                // Restaurer wrapper
                wrapper.classList.remove('resizing');
                wrapper.style.borderColor = '#007bff';
                img.classList.remove('resizing');
                
                // Finaliser la taille
                const finalWidth = parseInt(img.dataset.customWidth) || img.offsetWidth;
                
                console.log('   📏 Largeur finale:', finalWidth + 'px');
                
                // Appliquer max-width final
                img.style.maxWidth = finalWidth + 'px';
                img.title = `Largeur: ${finalWidth}px - Redimensionnement terminé`;
                
                // Nettoyer événements
                document.removeEventListener('mousemove', handleResize);
                document.removeEventListener('mouseup', stopResize);
                document.removeEventListener('selectstart', preventSelection);
                
                // Sauvegarder
                this.updateHiddenField();
                
                console.log('✅ Redimensionnement FORCÉ terminé');
            };
            
            // Attacher événements globaux
            document.addEventListener('selectstart', preventSelection, { passive: false });
            document.addEventListener('mousemove', handleResize, { passive: false });
            document.addEventListener('mouseup', stopResize, { passive: false });
            
            console.log('   ⚡ Événements FORCÉS attachés');
        };
        
        // Attacher événement principal FORCÉ
        handle.addEventListener('mousedown', startResize, { passive: false });
        
        console.log('⚡ Redimensionnement FORCÉ configuré');
    };
    
    console.log('✅ Correction redimensionnement appliquée');
    return true;
}

// Application automatique
if (document.readyState === 'complete') {
    setTimeout(forceResizeWorking, 1000);
} else {
    window.addEventListener('load', () => {
        setTimeout(forceResizeWorking, 1000);
    });
}

// Fonction pour corriger toutes les images existantes
function applyForcedResizeToAll() {
    console.log('🔧 Application correction à toutes les images...');
    
    if (!window.richEditor || !window.richEditor.selectImage) {
        console.error('❌ richEditor non prêt');
        return;
    }
    
    const images = document.querySelectorAll('.editor-content img');
    console.log(`📷 ${images.length} image(s) trouvée(s)`);
    
    images.forEach((img, i) => {
        console.log(`🔧 Image ${i+1}: Application correction...`);
        
        // Simuler sélection pour créer wrapper forcé
        setTimeout(() => {
            img.click(); // Déclenche la sélection avec correction
            
            // Désélectionner après création
            setTimeout(() => {
                const editor = document.querySelector('.editor-content');
                if (editor) {
                    editor.click(); // Clic ailleurs pour désélectionner
                }
            }, 500);
        }, i * 200);
    });
    
    console.log('✅ Correction appliquée à toutes les images');
}

// Export des fonctions
window.forceResizeWorking = forceResizeWorking;
window.applyForcedResizeToAll = applyForcedResizeToAll;

console.log('🛠️ COMMANDES DISPONIBLES:');
console.log('   forceResizeWorking()     - Activer correction redimensionnement');
console.log('   applyForcedResizeToAll() - Appliquer à toutes les images');
