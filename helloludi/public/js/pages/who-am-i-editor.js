/**
 * ============================================
 * WHO AM I EDITOR - Script d'initialisation spécifique
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation Who Am I Editor - Version dédiée');
    
    // Vérifier la disponibilité des éléments
    const editorContainer = document.getElementById('richEditorContainer');
    let hiddenField = document.getElementById('whoami_content');
    
    // Fallback : chercher par le nom du formulaire Symfony si l'ID personnalisé n'existe pas
    if (!hiddenField) {
        hiddenField = document.querySelector('textarea[name*="content"]');
        if (hiddenField) {
            console.log('🔍 Champ trouvé par sélecteur de nom:', hiddenField.name);
            hiddenField.id = 'whoami_content'; // Donner un ID pour la suite
        }
    }
    
    if (!editorContainer || !hiddenField) {
        console.error('❌ Éléments manquants:', {
            container: !!editorContainer,
            hiddenField: !!hiddenField,
            hiddenFieldId: hiddenField?.id,
            hiddenFieldName: hiddenField?.name
        });
        return;
    }
    
    console.log('✅ Éléments trouvés:', {
        container: editorContainer.id,
        field: hiddenField.id || hiddenField.name,
        currentContent: hiddenField.value ? `${hiddenField.value.length} caractères` : 'vide'
    });
    
    // Attendre que SimpleRichEditor soit disponible
    const initEditor = () => {
        if (typeof SimpleRichEditor === 'undefined') {
            console.log('⏳ SimpleRichEditor pas encore disponible, retry...');
            setTimeout(initEditor, 100);
            return;
        }
        
        try {
            console.log('🔧 Création de l\'éditeur...');
            
            // Créer l'instance avec les bonnes options
            const editor = new SimpleRichEditor('richEditorContainer', {
                hiddenFieldId: hiddenField.id,
                placeholder: 'Présentez-vous ici...'
            });
            
            // Exposer l'éditeur globalement
            window.richEditor = editor;
            window.whoAmIEditor = editor;
            
            console.log('✅ Éditeur Who Am I créé avec succès');
            
            // Test de synchronisation immédiat
            setTimeout(() => {
                testSynchronization(editor, hiddenField);
            }, 500);
            
            // Écouter les changements dans l'éditeur pour debug
            const editorContent = document.querySelector('.editor-content');
            if (editorContent) {
                editorContent.addEventListener('input', () => {
                    console.log('📝 Changement détecté dans l\'éditeur');
                    console.log('    Contenu éditeur:', editorContent.innerHTML.substring(0, 50) + '...');
                    console.log('    Champ caché:', hiddenField.value.substring(0, 50) + '...');
                });
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            setupFallbackEditor();
        }
    };
    
    // Test de synchronisation
    function testSynchronization(editor, field) {
        console.log('🧪 Test de synchronisation...');
        
        const originalContent = field.value;
        const testContent = '<p>Test de synchronisation - ' + new Date().getTime() + '</p>';
        
        // Insérer le contenu de test
        editor.setContent(testContent);
        
        setTimeout(() => {
            const newContent = field.value;
            const isSync = newContent.includes('Test de synchronisation');
            
            console.log('🔍 Résultat du test:', isSync ? '✅ SYNCHRONISATION OK' : '❌ ÉCHEC DE SYNCHRONISATION');
            
            if (!isSync) {
                console.error('😨 PROBLÈME DE SYNCHRONISATION DÉTECTÉ!');
                console.error('    Contenu attendu:', testContent);
                console.error('    Contenu réel du champ:', newContent);
            }
            
            // Restaurer le contenu original
            if (originalContent) {
                editor.setContent(originalContent);
                console.log('🔄 Contenu original restauré');
            } else {
                editor.setContent('');
            }
            
        }, 200);
    }
    
    // Démarrer l'initialisation
    initEditor();
    
    function setupFallbackEditor() {
        console.log('🔧 Mode de fallback activé');
        
        // Cacher le container de l'éditeur riche
        editorContainer.style.display = 'none';
        
        // Afficher le champ caché comme textarea
        hiddenField.style.display = 'block';
        hiddenField.style.height = '300px';
        hiddenField.style.width = '100%';
        hiddenField.classList.add('form-control');
        
        // Insérer avant le container
        editorContainer.parentNode.insertBefore(hiddenField, editorContainer);
        
        console.log('✅ Mode texte simple activé');
    }
    
    // Intercepter la soumission du formulaire pour debug
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            console.log('🚀 === SOUMISSION FORMULAIRE ===');
            console.log('Contenu du champ caché:', hiddenField.value.substring(0, 100) + '...');
            console.log('Longueur:', hiddenField.value.length);
            
            if (!hiddenField.value || hiddenField.value.trim() === '') {
                console.warn('⚠️ ATTENTION: Le champ caché est vide!');
                
                // Essayer de récupérer le contenu de l'éditeur
                const editorContent = document.querySelector('.editor-content');
                if (editorContent && editorContent.innerHTML) {
                    console.log('🔄 Tentative de récupération depuis l\'éditeur...');
                    hiddenField.value = editorContent.innerHTML;
                    console.log('Nouveau contenu:', hiddenField.value.substring(0, 100) + '...');
                }
            }
        });
    }
});
