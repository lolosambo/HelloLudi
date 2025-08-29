# Système de Tableaux Avancés pour l'Éditeur

## 📊 Fonctionnalités

Ce système d'extension pour votre éditeur de texte riche ajoute des capacités avancées de création et de gestion de tableaux.

### Création de Tableaux
- **Interface intuitive** : Modale de configuration avec aperçu en temps réel
- **Dimensions flexibles** : De 1 à 20 lignes et de 1 à 10 colonnes
- **Styles prédéfinis** : 7 styles différents disponibles
- **En-têtes optionnels** : Possibilité d'ajouter une ligne d'en-tête

### Édition de Structure Post-Insertion ✨ NOUVEAU
- **Bouton d'édition** : Petit crayon qui apparaît au survol des tableaux **dans l'éditeur uniquement**
- **Protection automatique** : Les boutons n'apparaissent jamais sur les pages de lecture
- **Modification en temps réel** : Changement de lignes/colonnes/style après insertion
- **Préservation du contenu** : Données existantes conservées automatiquement
- **Aperçu intelligent** : Visualisation des changements avant application
- **Interface intuitive** : Même modale que la création, pré-remplie

### Styles de Tableaux Disponibles

1. **Basique** : Tableau simple sans bordures
2. **Avec bordures** : Tableau avec bordures visibles
3. **Lignes alternées** : Une ligne sur deux colorée
4. **Survol interactif** : Mise en évidence au passage de la souris
5. **Alternées + Survol** : Combine lignes alternées et survol
6. **Bordures + Alternées** : Bordures avec lignes alternées
7. **Complet** : Toutes les fonctionnalités + tri par colonnes

### Fonctionnalités de Tri
- **Tri par colonne** : Clic sur les en-têtes pour trier
- **Tri bidirectionnel** : Croissant/décroissant
- **Détection automatique** : Tri numérique ou alphabétique
- **Indicateurs visuels** : Icônes et couleurs pour l'état du tri
- **Animation fluide** : Transitions visuelles lors du tri

## 🚀 Installation

Les fichiers suivants ont été créés/modifiés :

### Nouveaux Fichiers
```
public/js/table-editor.js           # Extension de l'éditeur pour les tableaux
public/css/table-editor.css         # Styles pour les tableaux et la modale
public/js/table-sort.js             # Tri des tableaux en mode lecture
public/js/table-edit-protection.js  # Protection contre les boutons hors éditeur
```

### Fichiers Modifiés
```
templates/post/create.html.twig          # Ajout CSS et JS
templates/post/edit.html.twig            # Ajout CSS et JS  
templates/post/detail.html.twig          # Ajout CSS et JS de tri
templates/components/_rich_editor_modals.html.twig  # Suppression ancienne modale
```

## 💡 Utilisation

### Dans l'Éditeur (Mode Création/Édition)

1. **Accès au bouton** : Cliquez sur l'icône de tableau (📊) dans la barre d'outils
2. **Configuration** :
   - Choisissez le nombre de lignes et colonnes
   - Sélectionnez si vous voulez une ligne d'en-tête
   - Choisissez un style parmi les 7 disponibles
   - Prévisualisez votre tableau en temps réel
3. **Insertion** : Cliquez sur "Insérer le tableau"

### Édition de Structure (Nouvelle Fonctionnalité) ✨

1. **Activation** : Survolez n'importe quel tableau inséré dans l'éditeur
2. **Bouton d'édition** : Cliquez sur le petit crayon qui apparaît en haut à droite
3. **Modification** :
   - La modale s'ouvre pré-remplie avec les paramètres actuels
   - Modifiez lignes, colonnes, style selon vos besoins
   - L'aperçu montre les changements avec préservation du contenu
4. **Application** : Cliquez sur "Appliquer les modifications"
5. **Résultat** : Le tableau est instantanément mis à jour

### En Mode Lecture (Pages de Détail)

1. **Tri automatique** : Les tableaux avec le style "Complet" sont automatiquement triables
2. **Utilisation du tri** :
   - Cliquez sur l'en-tête de colonne pour trier
   - Premier clic : tri croissant (↓)
   - Deuxième clic : tri décroissant (↑)
   - Troisième clic : retour à l'ordre original

## 🎨 Styles CSS

### Classes de Tableaux Bootstrap
```css
.table                    # Style de base
.table-bordered          # Avec bordures
.table-striped           # Lignes alternées
.table-hover             # Survol interactif
.sortable-table          # Tableaux triables
```

### Classes de Tri
```css
.sortable                # En-tête triable
.sort-icon              # Icône de tri
[data-sort-direction]   # État du tri (asc/desc/none)
```

## 🔧 Personnalisation

### Ajouter un Nouveau Style

1. **Dans `table-editor.js`**, ajoutez votre style dans l'objet `TABLE_STYLES` :
```javascript
nouveau_style: {
    name: 'Mon Style',
    classes: ['table', 'ma-classe-custom'],
    description: 'Description de mon style'
}
```

2. **Dans `table-editor.css`**, ajoutez les styles CSS correspondants :
```css
.editor-content .ma-classe-custom {
    /* Vos styles personnalisés */
}
```

### Modifier les Limites
Dans `table-editor.js`, modifiez ces constantes :
```javascript
// Ligne 184 et 189
value="3" min="1" max="20"  // Pour les lignes
value="3" min="1" max="10"  // Pour les colonnes
```

## 📱 Responsive

Le système est entièrement responsive :
- **Desktop** : Interface complète avec tous les styles
- **Tablette** : Adaptation de la grille de sélection
- **Mobile** : Interface simplifiée, tableaux avec défilement horizontal

## 🐛 Dépannage

### Le Bouton Tableau N'Apparaît Pas
- Vérifiez que `table-editor.js` est bien chargé après `SimpleRichEditor-v3-fixed.js`
- Consultez la console pour des erreurs JavaScript

### Les Tableaux Ne Sont Pas Triables
- Vérifiez que le style "Complet" ou "sortable-table" est utilisé
- Assurez-vous que `table-sort.js` est chargé sur les pages de détail

### Styles Cassés
- Vérifiez que `table-editor.css` est bien chargé
- Vérifiez les conflits avec d'autres CSS Bootstrap

## 🔮 Fonctionnalités Futures

Améliorations possibles :
- **Édition inline** : Modifier le contenu des cellules directement
- **Redimensionnement** : Ajuster la largeur des colonnes à la souris
- **Fusion de cellules** : Combiner plusieurs cellules
- **Styles avancés** : Plus d'options de personnalisation
- **Import/Export** : CSV, Excel
- **Templates** : Tableaux prédéfinis (calendrier, comparatif, etc.)

## 📞 Support

En cas de problème :
1. Vérifiez la console JavaScript pour les erreurs
2. Assurez-vous que tous les fichiers sont correctement chargés
3. Testez avec des dimensions de tableau différentes
4. Vérifiez la compatibilité Bootstrap 5

---

✅ **Installation terminée !** Votre éditeur de texte dispose maintenant d'un système de tableaux complet et professionnel.
