/**
 * Table Editor - Extension pour SimpleRichEditor avec édition de structure
 * Fonctionnalités d'insertion et de gestion de tableaux avec édition post-insertion
 */

(function(window) {
    'use strict';

    // Styles de tableaux disponibles
    const TABLE_STYLES = {
        basic: {
            name: 'Basique',
            classes: ['table'],
            description: 'Tableau simple sans bordures'
        },
        bordered: {
            name: 'Avec bordures',
            classes: ['table', 'table-bordered'],
            description: 'Tableau avec bordures visibles'
        },
        striped: {
            name: 'Lignes alternées',
            classes: ['table', 'table-striped'],
            description: 'Une ligne sur deux colorée'
        },
        hover: {
            name: 'Survol interactif',
            classes: ['table', 'table-hover'],
            description: 'Mise en évidence au survol'
        },
        striped_hover: {
            name: 'Alternées + Survol',
            classes: ['table', 'table-striped', 'table-hover'],
            description: 'Lignes alternées avec survol'
        },
        bordered_striped: {
            name: 'Bordures + Alternées',
            classes: ['table', 'table-bordered', 'table-striped'],
            description: 'Bordures et lignes alternées'
        },
        full: {
            name: 'Complet',
            classes: ['table', 'table-bordered', 'table-striped', 'table-hover', 'sortable-table'],
            description: 'Toutes les fonctionnalités'
        }
    };

    class TableEditor {
        constructor(richEditor) {
            this.richEditor = richEditor;
            this.currentTable = null;
            this.editingTable = null; // Table en cours d'édition
            this.isEditMode = false; // Mode édition de structure
            this.init();
        }

        init() {
            this.addTableButton();
            this.setupModalEvents();
            this.setupTableSorting();
            this.setupTableEditing(); // Nouvelle méthode pour l'édition
            console.log('✅ TableEditor initialisé avec édition de structure');
        }

        addTableButton() {
            // Trouver le groupe d'insertion dans la toolbar
            const toolbar = this.richEditor.toolbar;
            const insertionGroup = toolbar.querySelector('.editor-group:last-child');
            
            if (insertionGroup) {
                // Créer le bouton table
                const tableBtn = document.createElement('button');
                tableBtn.type = 'button';
                tableBtn.className = 'editor-btn';
                tableBtn.id = 'tableBtn';
                tableBtn.title = 'Insérer un tableau';
                tableBtn.innerHTML = '<i class="bi bi-table"></i>';
                
                // Insérer avant le bouton "supprimer formatage"
                const removeFormatBtn = insertionGroup.querySelector('[data-command="removeFormat"]');
                if (removeFormatBtn) {
                    insertionGroup.insertBefore(tableBtn, removeFormatBtn);
                } else {
                    insertionGroup.appendChild(tableBtn);
                }
                
                // Ajouter l'événement
                tableBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showTableModal();
                });
                
                console.log('📊 Bouton tableau ajouté à la barre d\'outils');
            }
        }

        // Nouvelle méthode pour configurer l'édition des tableaux
        setupTableEditing() {
            // Observer les changements dans l'éditeur pour ajouter les boutons d'édition
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const tables = node.tagName === 'TABLE' 
                                    ? [node] 
                                    : node.querySelectorAll ? node.querySelectorAll('table') : [];
                                
                                tables.forEach(table => {
                                    this.addEditButtonToTable(table);
                                });

                                // Aussi vérifier les conteneurs .table-responsive
                                const containers = node.classList && node.classList.contains('table-responsive')
                                    ? [node]
                                    : node.querySelectorAll ? node.querySelectorAll('.table-responsive') : [];
                                
                                containers.forEach(container => {
                                    const table = container.querySelector('table');
                                    if (table) {
                                        this.addEditButtonToTable(table);
                                    }
                                });
                            }
                        });
                    }
                });
            });

            observer.observe(this.richEditor.editor, {
                childList: true,
                subtree: true
            });

            // Ajouter les boutons aux tableaux existants
            setTimeout(() => {
                this.addEditButtonsToExistingTables();
            }, 500);

            console.log('📝 Édition de tableaux configurée');
        }

        addEditButtonsToExistingTables() {
            // ✅ Seulement les tableaux dans l'éditeur
            if (!this.richEditor || !this.richEditor.editor) {
                console.log('🚫 Pas d\'éditeur - Aucun bouton d\'édition ajouté');
                return;
            }
            
            console.log(`📋 Mode éditeur détecté: ${this.richEditor.isEditMode}`);
            
            const tables = this.richEditor.editor.querySelectorAll('table');
            console.log(`📋 Ajout des boutons d'édition à ${tables.length} tableau(x) de l'éditeur`);
            
            tables.forEach((table, index) => {
                console.log(`📋 Traitement tableau ${index + 1}:`, table);
                this.addEditButtonToTable(table);
            });
        }

        addEditButtonToTable(table) {
            // ✅ VÉRIFICATION CRITIQUE : Ne pas ajouter le bouton si on n'est pas dans l'éditeur
            if (!this.richEditor || !this.richEditor.editor) {
                console.log('🚫 Pas d\'éditeur détecté - Bouton d\'édition non ajouté');
                return;
            }
            
            // ✅ Vérifier que le tableau est bien dans l'éditeur et pas ailleurs sur la page
            if (!this.richEditor.editor.contains(table)) {
                console.log('🚫 Tableau hors éditeur - Bouton d\'édition non ajouté');
                return;
            }
            
            // ✅ Vérifier qu'on est en mode édition (pas en mode lecture)
            if (!this.richEditor.isEditMode) {
                console.log('🚫 Mode lecture détecté - Bouton d\'édition non ajouté');
                return;
            }

            // Vérifier si le bouton existe déjà
            const container = table.closest('.table-responsive') || table.parentElement;
            if (container.querySelector('.table-edit-btn')) {
                return;
            }

            // Créer le bouton d'édition
            const editBtn = document.createElement('button');
            editBtn.className = 'table-edit-btn';
            editBtn.type = 'button';
            editBtn.title = 'Modifier la structure du tableau';
            editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
            
            // Positionner le bouton
            if (container.classList.contains('table-responsive')) {
                container.style.position = 'relative';
                container.appendChild(editBtn);
            } else {
                // Créer un wrapper si nécessaire
                const wrapper = document.createElement('div');
                wrapper.className = 'table-wrapper';
                wrapper.style.position = 'relative';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
                wrapper.appendChild(editBtn);
            }

            // Ajouter l'événement de clic
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.editTableStructure(table);
            });

            console.log('✏️ Bouton d\'édition ajouté au tableau dans l\'éditeur (mode édition)');
        }

        editTableStructure(table) {
            this.editingTable = table;
            this.isEditMode = true;

            // Analyser la structure actuelle du tableau
            const currentStructure = this.analyzeTableStructure(table);
            
            // Créer la modale si elle n'existe pas
            if (!document.getElementById('tableModal')) {
                this.createTableModal();
            }

            // Pré-remplir la modale avec les données actuelles
            this.fillModalWithCurrentData(currentStructure);

            // Changer le titre de la modale
            const modal = document.getElementById('tableModal');
            const modalTitle = modal.querySelector('#tableModalLabel');
            modalTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Modifier la structure du tableau';

            // Changer le texte du bouton
            const insertBtn = modal.querySelector('#insertTableBtn');
            insertBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Appliquer les modifications';

            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();

            console.log('✏️ Édition de structure démarrée');
        }

        analyzeTableStructure(table) {
            const tbody = table.querySelector('tbody');
            const thead = table.querySelector('thead');
            
            const rows = tbody ? tbody.querySelectorAll('tr').length : 0;
            const cols = table.querySelector('tr') ? table.querySelector('tr').cells.length : 0;
            const hasHeader = !!thead && thead.querySelectorAll('tr').length > 0;
            
            // Déterminer le style actuel
            let currentStyle = 'basic';
            const classList = Array.from(table.classList);
            
            for (const [key, style] of Object.entries(TABLE_STYLES)) {
                if (style.classes.every(cls => classList.includes(cls))) {
                    currentStyle = key;
                    break;
                }
            }

            return {
                rows: hasHeader ? rows + 1 : rows,
                cols,
                hasHeader,
                style: currentStyle,
                content: this.extractTableContent(table)
            };
        }

        extractTableContent(table) {
            const content = [];
            const allRows = table.querySelectorAll('tr');
            
            allRows.forEach((row, rowIndex) => {
                const rowData = [];
                const cells = row.querySelectorAll('th, td');
                
                cells.forEach(cell => {
                    rowData.push(cell.textContent.trim());
                });
                
                content.push(rowData);
            });

            return content;
        }

        fillModalWithCurrentData(structure) {
            const modal = document.getElementById('tableModal');
            if (!modal) return;

            // Remplir les champs
            modal.querySelector('#tableRows').value = structure.rows;
            modal.querySelector('#tableCols').value = structure.cols;
            modal.querySelector('#tableHeader').checked = structure.hasHeader;

            // Sélectionner le style actuel
            document.querySelectorAll('.style-option').forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.style === structure.style) {
                    option.classList.add('selected');
                }
            });

            // Mettre à jour l'aperçu
            this.updatePreview();
        }

        showTableModal() {
            this.richEditor.saveSelection();
            this.isEditMode = false;
            this.editingTable = null;
            
            // Créer la modale si elle n'existe pas
            if (!document.getElementById('tableModal')) {
                this.createTableModal();
            }
            
            this.resetTableModal();
            
            const modal = new bootstrap.Modal(document.getElementById('tableModal'));
            modal.show();
            
            console.log('📊 Modale de tableau ouverte');
        }

        createTableModal() {
            const modalHTML = `
                <div class="modal fade" id="tableModal" tabindex="-1" aria-labelledby="tableModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="tableModalLabel">
                                    <i class="bi bi-table me-2"></i>Insérer un tableau
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                            </div>
                            <div class="modal-body">
                                <!-- Configuration de base -->
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <label for="tableRows" class="form-label">
                                            <i class="bi bi-distribute-vertical me-1"></i>Nombre de lignes
                                        </label>
                                        <input type="number" class="form-control" id="tableRows" value="3" min="1" max="20">
                                        <small class="form-text text-muted">Entre 1 et 20 lignes</small>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="tableCols" class="form-label">
                                            <i class="bi bi-distribute-horizontal me-1"></i>Nombre de colonnes
                                        </label>
                                        <input type="number" class="form-control" id="tableCols" value="3" min="1" max="10">
                                        <small class="form-text text-muted">Entre 1 et 10 colonnes</small>
                                    </div>
                                </div>

                                <!-- Options d'en-tête -->
                                <div class="mb-4">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="tableHeader" checked>
                                        <label class="form-check-label" for="tableHeader">
                                            <i class="bi bi-card-heading me-1"></i>
                                            Inclure une ligne d'en-tête
                                        </label>
                                        <small class="form-text text-muted d-block">La première ligne sera formatée comme un en-tête</small>
                                    </div>
                                </div>

                                <!-- Préservation du contenu -->
                                <div class="mb-4" id="contentPreservationSection" style="display: none;">
                                    <div class="alert alert-info">
                                        <i class="bi bi-info-circle me-2"></i>
                                        <strong>Modification de structure</strong>
                                        <p class="mb-0">Le contenu existant sera préservé autant que possible. 
                                        Si vous réduisez les dimensions, les données en excès seront perdues.</p>
                                    </div>
                                </div>

                                <!-- Styles de tableau -->
                                <div class="mb-4">
                                    <label class="form-label">
                                        <i class="bi bi-palette me-1"></i>Style du tableau
                                    </label>
                                    <div id="tableStyleSelector" class="table-style-grid">
                                        ${this.generateStyleOptions()}
                                    </div>
                                </div>

                                <!-- Aperçu -->
                                <div class="mb-3">
                                    <label class="form-label">
                                        <i class="bi bi-eye me-1"></i>Aperçu
                                    </label>
                                    <div id="tablePreview" class="table-preview-container">
                                        <!-- L'aperçu sera généré ici -->
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                    <i class="bi bi-x-circle me-1"></i>Annuler
                                </button>
                                <button type="button" class="btn btn-primary" id="insertTableBtn">
                                    <i class="bi bi-plus-circle me-1"></i>Insérer le tableau
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            console.log('📊 Modale de tableau créée');
        }

        generateStyleOptions() {
            let html = '';
            
            Object.entries(TABLE_STYLES).forEach(([key, style]) => {
                html += `
                    <div class="style-option" data-style="${key}">
                        <div class="style-preview">
                            <table class="${style.classes.join(' ')}">
                                <thead><tr><th>Col 1</th><th>Col 2</th></tr></thead>
                                <tbody>
                                    <tr><td>Ligne 1</td><td>Données</td></tr>
                                    <tr><td>Ligne 2</td><td>Données</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="style-info">
                            <strong>${style.name}</strong>
                            <small class="text-muted d-block">${style.description}</small>
                        </div>
                    </div>
                `;
            });
            
            return html;
        }

        setupModalEvents() {
            // Délégation d'événements pour la modale (elle peut être créée dynamiquement)
            document.addEventListener('click', (e) => {
                // Sélection de style
                if (e.target.closest('.style-option')) {
                    this.selectTableStyle(e.target.closest('.style-option'));
                }
                
                // Bouton d'insertion/modification
                if (e.target.id === 'insertTableBtn' || e.target.closest('#insertTableBtn')) {
                    e.preventDefault();
                    if (this.isEditMode) {
                        this.applyTableModifications();
                    } else {
                        this.insertTable();
                    }
                }
            });
            
            // Événements de mise à jour de l'aperçu
            document.addEventListener('input', (e) => {
                if (['tableRows', 'tableCols'].includes(e.target.id)) {
                    this.updatePreview();
                }
            });
            
            document.addEventListener('change', (e) => {
                if (e.target.id === 'tableHeader') {
                    this.updatePreview();
                }
            });

            // Réinitialiser lors de la fermeture de la modale
            document.addEventListener('hidden.bs.modal', (e) => {
                if (e.target.id === 'tableModal') {
                    this.resetModalState();
                }
            });
            
            console.log('📊 Événements de la modale configurés');
        }

        resetModalState() {
            this.isEditMode = false;
            this.editingTable = null;
            
            // Remettre le titre par défaut
            const modal = document.getElementById('tableModal');
            if (modal) {
                const modalTitle = modal.querySelector('#tableModalLabel');
                modalTitle.innerHTML = '<i class="bi bi-table me-2"></i>Insérer un tableau';

                // Remettre le texte du bouton
                const insertBtn = modal.querySelector('#insertTableBtn');
                insertBtn.innerHTML = '<i class="bi bi-plus-circle me-1"></i>Insérer le tableau';

                // Masquer la section de préservation du contenu
                const preservationSection = modal.querySelector('#contentPreservationSection');
                if (preservationSection) {
                    preservationSection.style.display = 'none';
                }
            }
        }

        applyTableModifications() {
            if (!this.editingTable) return;

            const modal = document.getElementById('tableModal');
            if (!modal) return;

            const newRows = parseInt(modal.querySelector('#tableRows').value) || 3;
            const newCols = parseInt(modal.querySelector('#tableCols').value) || 3;
            const newHasHeader = modal.querySelector('#tableHeader').checked;
            const selectedStyle = modal.querySelector('.style-option.selected');
            const newStyleKey = selectedStyle ? selectedStyle.dataset.style : 'bordered_striped';

            // Extraire le contenu actuel
            const currentStructure = this.analyzeTableStructure(this.editingTable);
            
            // Générer le nouveau tableau en préservant le contenu
            const newTableHTML = this.generateModifiedTable(
                newRows, newCols, newHasHeader, newStyleKey, currentStructure.content
            );

            // Remplacer l'ancien tableau
            const container = this.editingTable.closest('.table-responsive') || this.editingTable.parentElement;
            container.innerHTML = newTableHTML;

            // Réactiver les fonctionnalités
            setTimeout(() => {
                this.addEditButtonsToExistingTables();
                this.activateTableSorting();
            }, 100);

            // Fermer la modale
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }

            console.log('✅ Structure du tableau modifiée');
        }

        generateModifiedTable(newRows, newCols, newHasHeader, styleKey, existingContent) {
            const style = TABLE_STYLES[styleKey] || TABLE_STYLES.bordered_striped;
            const classes = style.classes.join(' ');
            
            let html = `<table class="${classes}">`;
            
            // En-tête si demandé
            if (newHasHeader) {
                html += '<thead><tr>';
                for (let j = 0; j < newCols; j++) {
                    const cellContent = existingContent[0] && existingContent[0][j] 
                        ? existingContent[0][j] 
                        : `Colonne ${j + 1}`;
                    html += `<th>${cellContent}</th>`;
                }
                html += '</tr></thead>';
            }
            
            // Corps du tableau
            html += '<tbody>';
            const startRow = newHasHeader ? 1 : 0;
            const actualRows = newHasHeader ? newRows - 1 : newRows;
            
            for (let i = 0; i < actualRows; i++) {
                html += '<tr>';
                for (let j = 0; j < newCols; j++) {
                    const sourceRowIndex = startRow + i;
                    const cellContent = existingContent[sourceRowIndex] && existingContent[sourceRowIndex][j] 
                        ? existingContent[sourceRowIndex][j] 
                        : `Cellule ${sourceRowIndex + 1},${j + 1}`;
                    html += `<td>${cellContent}</td>`;
                }
                html += '</tr>';
            }
            html += '</tbody>';
            
            html += '</table>';
            
            return html;
        }

        resetTableModal() {
            const modal = document.getElementById('tableModal');
            if (!modal) return;
            
            // Réinitialiser les valeurs seulement si on n'est pas en mode édition
            if (!this.isEditMode) {
                modal.querySelector('#tableRows').value = 3;
                modal.querySelector('#tableCols').value = 3;
                modal.querySelector('#tableHeader').checked = true;
                
                // Sélectionner le style par défaut
                const defaultStyle = modal.querySelector('.style-option[data-style="bordered_striped"]');
                if (defaultStyle) {
                    this.selectTableStyle(defaultStyle);
                }
            }

            // Afficher ou masquer la section de préservation selon le mode
            const preservationSection = modal.querySelector('#contentPreservationSection');
            if (preservationSection) {
                preservationSection.style.display = this.isEditMode ? 'block' : 'none';
            }
            
            this.updatePreview();
        }

        selectTableStyle(styleOption) {
            // Désélectionner tous les styles
            document.querySelectorAll('.style-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Sélectionner le style cliqué
            styleOption.classList.add('selected');
            
            // Mettre à jour l'aperçu
            this.updatePreview();
        }

        updatePreview() {
            const modal = document.getElementById('tableModal');
            if (!modal) return;
            
            const rows = parseInt(modal.querySelector('#tableRows').value) || 3;
            const cols = parseInt(modal.querySelector('#tableCols').value) || 3;
            const hasHeader = modal.querySelector('#tableHeader').checked;
            const selectedStyle = modal.querySelector('.style-option.selected');
            
            const preview = modal.querySelector('#tablePreview');
            
            if (rows > 20 || cols > 10) {
                preview.innerHTML = '<div class="alert alert-warning">Dimensions trop importantes pour l\'aperçu</div>';
                return;
            }
            
            // Générer l'aperçu
            let tableHTML;
            if (this.isEditMode && this.editingTable) {
                // En mode édition, montrer l'aperçu avec le contenu préservé
                const currentStructure = this.analyzeTableStructure(this.editingTable);
                tableHTML = this.generateModifiedTable(rows, cols, hasHeader, 
                    selectedStyle ? selectedStyle.dataset.style : 'bordered_striped', 
                    currentStructure.content);
            } else {
                // En mode création normale
                tableHTML = this.generateTableHTML(rows, cols, hasHeader, 
                    selectedStyle ? selectedStyle.dataset.style : 'bordered_striped');
            }
            
            preview.innerHTML = tableHTML;
        }

        generateTableHTML(rows, cols, hasHeader, styleKey) {
            const style = TABLE_STYLES[styleKey] || TABLE_STYLES.bordered_striped;
            const classes = style.classes.join(' ');
            
            let html = `<table class="${classes}">`;
            
            // En-tête si demandé
            if (hasHeader) {
                html += '<thead><tr>';
                for (let j = 1; j <= cols; j++) {
                    html += `<th>Colonne ${j}</th>`;
                }
                html += '</tr></thead>';
            }
            
            // Corps du tableau
            html += '<tbody>';
            const startRow = hasHeader ? 2 : 1;
            for (let i = startRow; i <= rows; i++) {
                html += '<tr>';
                for (let j = 1; j <= cols; j++) {
                    html += `<td>Cellule ${i},${j}</td>`;
                }
                html += '</tr>';
            }
            html += '</tbody>';
            
            html += '</table>';
            
            return html;
        }

        insertTable() {
            const modal = document.getElementById('tableModal');
            if (!modal) return;
            
            const rows = parseInt(modal.querySelector('#tableRows').value) || 3;
            const cols = parseInt(modal.querySelector('#tableCols').value) || 3;
            const hasHeader = modal.querySelector('#tableHeader').checked;
            const selectedStyle = modal.querySelector('.style-option.selected');
            
            if (rows < 1 || rows > 20 || cols < 1 || cols > 10) {
                alert('Veuillez entrer des dimensions valides (1-20 lignes, 1-10 colonnes).');
                return;
            }
            
            const styleKey = selectedStyle ? selectedStyle.dataset.style : 'bordered_striped';
            const tableHTML = this.generateTableHTML(rows, cols, hasHeader, styleKey);
            
            // Insérer dans l'éditeur
            this.richEditor.restoreSelection();
            this.richEditor.execCommand('insertHTML', `<div class="table-responsive">${tableHTML}</div><p><br></p>`);
            
            // Fermer la modale
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
            
            // Activer les fonctionnalités sur les nouveaux tableaux
            setTimeout(() => {
                this.addEditButtonsToExistingTables();
                this.activateTableSorting();
            }, 100);
            
            console.log('📊 Tableau inséré avec succès');
        }

        setupTableSorting() {
            // Délégation d'événements pour le tri des tableaux
            document.addEventListener('click', (e) => {
                const th = e.target.closest('th');
                if (!th) return;
                
                const table = th.closest('table');
                if (!table || !table.classList.contains('sortable-table')) return;
                
                this.sortTable(table, th);
            });
        }

        activateTableSorting() {
            // Activer le tri sur tous les tableaux sortables dans l'éditeur
            const tables = this.richEditor.editor.querySelectorAll('table.sortable-table');
            
            tables.forEach(table => {
                const headers = table.querySelectorAll('th');
                headers.forEach((th, index) => {
                    if (!th.classList.contains('sortable')) {
                        th.classList.add('sortable');
                        th.setAttribute('data-column', index);
                        th.style.cursor = 'pointer';
                        th.title = 'Cliquer pour trier';
                        
                        // Ajouter l'icône de tri
                        if (!th.querySelector('.sort-icon')) {
                            th.innerHTML += ' <i class="sort-icon bi bi-arrow-down-up"></i>';
                        }
                    }
                });
            });
            
            console.log(`📊 Tri activé sur ${tables.length} tableau(x)`);
        }

        sortTable(table, th) {
            const columnIndex = parseInt(th.getAttribute('data-column'));
            const tbody = table.querySelector('tbody');
            if (!tbody) return;
            
            const rows = Array.from(tbody.querySelectorAll('tr'));
            const currentDirection = th.getAttribute('data-sort-direction') || 'none';
            
            // Déterminer la nouvelle direction
            let newDirection;
            if (currentDirection === 'none' || currentDirection === 'desc') {
                newDirection = 'asc';
            } else {
                newDirection = 'desc';
            }
            
            // Réinitialiser toutes les icônes
            table.querySelectorAll('th').forEach(header => {
                header.setAttribute('data-sort-direction', 'none');
                const icon = header.querySelector('.sort-icon');
                if (icon) {
                    icon.className = 'sort-icon bi bi-arrow-down-up';
                }
            });
            
            // Mettre à jour l'en-tête actuel
            th.setAttribute('data-sort-direction', newDirection);
            const icon = th.querySelector('.sort-icon');
            if (icon) {
                icon.className = newDirection === 'asc' 
                    ? 'sort-icon bi bi-sort-alpha-down' 
                    : 'sort-icon bi bi-sort-alpha-up';
            }
            
            // Trier les lignes
            rows.sort((a, b) => {
                const cellA = a.cells[columnIndex]?.textContent.trim() || '';
                const cellB = b.cells[columnIndex]?.textContent.trim() || '';
                
                // Essayer de comparer comme des nombres
                const numA = parseFloat(cellA);
                const numB = parseFloat(cellB);
                
                let comparison;
                if (!isNaN(numA) && !isNaN(numB)) {
                    comparison = numA - numB;
                } else {
                    comparison = cellA.localeCompare(cellB, 'fr', { numeric: true });
                }
                
                return newDirection === 'asc' ? comparison : -comparison;
            });
            
            // Réinsérer les lignes triées
            rows.forEach(row => tbody.appendChild(row));
            
            console.log(`📊 Tableau trié par colonne ${columnIndex} (${newDirection})`);
        }
    }

    // Étendre SimpleRichEditor avec TableEditor
    if (window.SimpleRichEditor) {
        const originalInit = window.SimpleRichEditor.prototype.init;
        
        window.SimpleRichEditor.prototype.init = function() {
            originalInit.call(this);
            
            // Initialiser TableEditor seulement en mode édition
            if (this.isEditMode) {
                this.tableEditor = new TableEditor(this);
            }
        };
    }

    // Rendre TableEditor disponible globalement
    window.TableEditor = TableEditor;

})(window);
