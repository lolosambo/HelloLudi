# Test des Nouvelles Fonctionnalités - Éditeur v1.1

## 🖼️ **Redimensionnement d'Images**
1. Insérez une image (bouton image ou URL: `https://picsum.photos/300/200`)
2. Cliquez sur l'image pour la sélectionner (bordure bleue)
3. **Glissez la poignée bleue** en bas à droite pour redimensionner
4. L'image garde ses proportions automatiquement

## ⭐ **Fonctionnalités Avancées Images**
- **Clic simple** : Sélectionner
- **Double-clic** : Modifier (source, alignement, taille)
- **Glisser la poignée** : Redimensionner visuellement  
- **Touche Suppr** : Supprimer l'image sélectionnée

## 📝 **Tabulation et Indentation**
- **Tab** : Indenter le texte/liste
- **Shift+Tab** : Désindenter le texte/liste
- **Boutons dédiés** : Icônes d'indentation dans la toolbar

## 🎨 **Sélection de Styles (Corrigée)**
- Le sélecteur "Format" fonctionne maintenant correctement
- Sélectionnez du texte et choisissez : Titre 1, Titre 2, Titre 3, ou Paragraphe
- Le sélecteur se met à jour automatiquement selon le contexte

## ⚡ **Guide de Test Rapide**

### Test Images :
```
1. Cliquez sur l'icône image 🖼️
2. URL : https://picsum.photos/400/300
3. Configurez : Alt="Test", Alignement="Centre", Largeur=200
4. Insérez l'image
5. Cliquez sur l'image → poignée bleue apparaît
6. Glissez la poignée pour redimensionner
7. Double-cliquez pour modifier
```

### Test Formatage :
```
1. Tapez du texte : "Voici un titre principal"
2. Sélectionnez le texte
3. Format → "Titre 1"  
4. Le sélecteur montre maintenant "Titre 1"
5. Tapez "Nouveau paragraphe" → le sélecteur repasse à vide
```

### Test Tabulation :
```
1. Tapez une liste :
   - Premier élément
   - Deuxième élément
2. Placez le curseur sur "Deuxième élément"
3. Appuyez sur Tab → l'élément s'indente
4. Appuyez sur Shift+Tab → l'élément se désindente
```

## 🐛 **Si Problème**
Ouvrez F12 → Console pour voir les messages de debug :
- "Image sélectionnée - Double-cliquez pour modifier..."
- "Redimensionnement: XXXpx"  
- "Image redimensionnée: XXXpx"
- "Sélection sauvée: [texte]"

---

**Version 1.1** - Images redimensionnables + Tabulation + Formats corrigés ✅
