# Module Vidéo v1.3.0 - Guide de Test 🎥

## 🎉 **Nouveau : Module Vidéo Complet !**

L'éditeur dispose maintenant d'un **système vidéo avancé** qui supporte YouTube, Vimeo et Dailymotion avec :
- **Détection automatique** des URLs
- **Aperçu en temps réel** dans la modale
- **Configuration personnalisée** (taille, alignement, autoplay)
- **Intégration responsive** avec Bootstrap

---

## 🎯 **Fonctionnalités Vidéo :**

### ✅ **Plateformes Supportées :**
- **YouTube** : `https://www.youtube.com/watch?v=...` ou `https://youtu.be/...`
- **Vimeo** : `https://vimeo.com/123456789`
- **Dailymotion** : `https://www.dailymotion.com/video/x...`

### ✅ **Options de Configuration :**
- **Dimensions** : Largeur et hauteur personnalisables (défaut 560x315)
- **Alignement** : Gauche, Centre (défaut), Droite
- **Autoplay** : Option de lecture automatique
- **Responsive** : S'adapte automatiquement aux écrans

### ✅ **Interface Utilisateur :**
- **Bouton dédié** avec icône play dans la barre d'outils
- **Modale intuitive** avec aperçu temps réel
- **Validation automatique** des URLs
- **Messages d'erreur** pour URLs invalides

---

## 🧪 **Tests à Effectuer :**

### **Test 1 : Bouton et Modale**
```
1. Rechargez la page (pour avoir la nouvelle version)
2. Localisez le bouton vidéo ▶️ dans la barre d'outils
3. Cliquez dessus
4. ✅ ATTENDU : Modale "Insérer une vidéo" s'ouvre
5. ✅ ATTENDU : Champ URL + message "Formats supportés"
```

### **Test 2 : YouTube**
```
URL de test : https://www.youtube.com/watch?v=dQw4w9WgXcQ

1. Collez l'URL dans le champ
2. ✅ ATTENDU : Aperçu de la vidéo s'affiche automatiquement
3. ✅ ATTENDU : "YouTube - dQw4w9WgXcQ" sous l'aperçu
4. ✅ ATTENDU : Section "Configuration" apparaît
5. Cliquez "Insérer la vidéo"
6. ✅ ATTENDU : Vidéo intégrée dans l'éditeur, centrée
```

### **Test 3 : Vimeo**
```
URL de test : https://vimeo.com/148751763

1. Effacez l'URL précédente, collez celle-ci
2. ✅ ATTENDU : Aperçu Vimeo s'affiche
3. ✅ ATTENDU : "Vimeo - 148751763" sous l'aperçu
4. Changez alignement → "Droite"
5. Largeur → "400", Hauteur → "225"
6. ✅ ATTENDU : Vidéo insérée à droite avec taille personnalisée
```

### **Test 4 : Configuration Avancée**
```
1. Nouvelle vidéo YouTube
2. Alignement → "Gauche"
3. ✅ Cochez "Lecture automatique" 
4. ✅ ATTENDU : Vidéo à gauche, se lance automatiquement
5. Console : "Vidéo YouTube insérée: [ID]"
```

### **Test 5 : Gestion d'Erreurs**
```
URL invalide : https://exemple.com/video.mp4

1. Collez cette URL
2. ✅ ATTENDU : Message "URL vidéo non supportée ou invalide"
3. ✅ ATTENDU : Bouton "Insérer" reste désactivé
4. ✅ ATTENDU : Pas de configuration affichée
```

---

## 🎨 **Résultats Attendus :**

### **HTML Généré :**
```html
<div class="video-container video-center" style="width: 560px; margin: 20px auto;">
    <div class="ratio" style="--bs-aspect-ratio: 56.25%">
        <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                frameborder="0" 
                allowfullscreen 
                data-video-platform="youtube"
                data-video-id="dQw4w9WgXcQ">
        </iframe>
    </div>
</div>
```

### **Styles Visuels :**
- **Ombre légère** autour de la vidéo
- **Effet hover** : Ombre plus forte + légère élévation
- **Coins arrondis** pour un aspect moderne
- **Responsive** : S'adapte à la largeur de l'écran

---

## 🔧 **Architecture Technique :**

### **Parsing d'URLs :**
```javascript
parseVideoUrl(url) {
    // Détection YouTube, Vimeo, Dailymotion
    // Extraction des IDs vidéo
    // Génération URLs d'embed
}
```

### **Responsive :**
```css
.ratio {
    --bs-aspect-ratio: calc(height/width * 100%);
}
/* Maintient le ratio 16:9 ou personnalisé */
```

### **Intégration :**
- **Events** : Même système que les images
- **Sélection** : Sauvegarde/restauration de la sélection
- **Modal** : Bootstrap avec événements propres

---

## 🚨 **Debug si Problème :**

### **Bouton Invisible :**
```
Cache navigateur → Ctrl+F5
Vérifier que le template _simple_editor_modals.html.twig est bien chargé
```

### **Modale ne s'ouvre pas :**
```javascript
// Console :
document.getElementById('videoBtn')
// → Doit retourner l'élément bouton

document.getElementById('videoModal')  
// → Doit retourner la modale
```

### **Vidéo ne s'insère pas :**
```
Console → Messages d'erreur ?
Vérifier que l'URL est dans un format supporté
Tester avec les URLs d'exemple fournies
```

---

## ✨ **URLs de Test Garanties :**

### **YouTube :**
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ` (Rick Roll - classique)
- `https://youtu.be/jNQXAC9IVRw` (Format court)

### **Vimeo :**
- `https://vimeo.com/148751763` (Vidéo de demo)

### **Dailymotion :**
- `https://www.dailymotion.com/video/x2hwqlv` (Vidéo publique)

---

## 🎯 **Version 1.3.0 Complete !**

**L'éditeur dispose maintenant de :**
- ✅ **Texte riche** : Formatage complet + justification
- ✅ **Images** : Upload, URL, habillage avancé, redimensionnement
- ✅ **Vidéos** : YouTube, Vimeo, Dailymotion avec configuration
- ✅ **Interface** : Modales Bootstrap, aperçus temps réel
- ✅ **Responsive** : Adaptation parfaite sur tous écrans

**C'est un éditeur de niveau professionnel !** 🚀

---

**Testez maintenant et confirmez que le module vidéo fonctionne !** 🎥
