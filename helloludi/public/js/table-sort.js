/**
 * Table Sort - Activation du tri pour les tableaux en mode lecture
 * Ce script active le tri sur les tableaux existants dans les pages de détail
 */

(function() {
    'use strict';

    console.log('📊 TableSort - Initialisation du tri en mode lecture');

    // Attendre que la page soit chargée
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            activateTableSorting();
        }, 500);
    });

    function activateTableSorting() {
        // Trouver tous les tableaux avec la classe sortable-table
        const sortableTables = document.querySelectorAll('.table.sortable-table');
        
        if (sortableTables.length === 0) {
            console.log('📊 Aucun tableau triable trouvé');
            return;
        }

        console.log(`📊 Activation du tri sur ${sortableTables.length} tableau(x)`);

        sortableTables.forEach(table => {
            setupTableSorting(table);
        });
    }

    function setupTableSorting(table) {
        const headers = table.querySelectorAll('thead th');
        
        headers.forEach((th, index) => {
            // Vérifier si ce n'est pas déjà configuré
            if (th.classList.contains('sortable')) {
                return;
            }

            // Configurer l'en-tête comme triable
            th.classList.add('sortable');
            th.setAttribute('data-column', index);
            th.style.cursor = 'pointer';
            th.title = 'Cliquer pour trier';
            
            // Ajouter l'icône de tri si elle n'existe pas
            if (!th.querySelector('.sort-icon')) {
                th.innerHTML += ' <i class="sort-icon bi bi-arrow-down-up"></i>';
            }

            // Ajouter l'événement de clic
            th.addEventListener('click', function(e) {
                e.preventDefault();
                sortTable(table, th, index);
            });
        });

        console.log(`📊 Tri configuré sur ${headers.length} colonne(s)`);
    }

    function sortTable(table, th, columnIndex) {
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

        // Réinitialiser toutes les icônes de la table
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

        // Réinsérer les lignes triées avec animation
        rows.forEach((row, index) => {
            row.style.opacity = '0.7';
            row.style.transform = 'translateX(-10px)';
            
            setTimeout(() => {
                tbody.appendChild(row);
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 30);
        });

        console.log(`📊 Tableau trié par colonne ${columnIndex} (${newDirection})`);

        // Effet visuel sur l'en-tête
        th.style.backgroundColor = newDirection === 'asc' ? '#e3f2fd' : '#e8f5e8';
        setTimeout(() => {
            th.style.backgroundColor = '';
        }, 1000);
    }

    // Fonction globale pour réactiver le tri si nécessaire
    window.reactivateTableSorting = activateTableSorting;

})();
