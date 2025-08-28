# Fonctionnalité Galerie Photo - Blog Symfony

## 📸 Nouvelle fonctionnalité : Galerie d'images pour les posts "Photo"

Cette mise à jour ajoute une fonctionnalité complète de galerie d'images pour les articles de type "Photo" sur votre blog Symfony.

## 🚀 Fonctionnalités ajoutées

### 1. **Upload multiple d'images**
- Interface intuitive de glisser-déposer pour sélectionner plusieurs images
- Support de 10 images maximum par galerie
- Validation côté client et serveur
- Formats supportés : JPG, PNG, GIF, WebP
- Taille maximale : 5MB par image

### 2. **Gestion des images**
- Prévisualisation en temps réel des images sélectionnées
- Possibilité de supprimer des images avant soumission
- Suppression d'images existantes via AJAX
- Organisation automatique par ordre d'ajout

### 3. **Affichage de la galerie**
- Affichage en grille responsive (4-5 images par ligne)
- Miniatures avec effet de survol
- Modale pour visualiser les images en grand format
- Navigation au clavier (touche Escape)

### 4. **Interface utilisateur**
- Design cohérent avec le thème existant (couleurs Bootstrap personnalisées)
- Animations et transitions fluides
- Interface responsive pour mobile et tablette
- Notifications en temps réel pour les actions utilisateur

## 📁 Fichiers ajoutés/modifiés

### **Nouvelles entités**
- `src/Entity/PostImage.php` - Entité pour gérer les images de galerie
- `src/Service/ImageUploadService.php` - Service pour la gestion des uploads

### **Formulaires**
- `src/Form/PostType.php` - Ajout du champ `galleryImages` pour l'upload multiple
- `src/Form/MultipleImageType.php` - Formulaire dédié aux images multiples

### **Contrôleurs**
- `src/Controller/PostController.php` - Mise à jour pour gérer les images de galerie

### **Templates**
- `templates/post/create.html.twig` - Ajout des champs de galerie
- `templates/post/edit.html.twig` - Gestion des images existantes + nouvelles
- `templates/post/detail.html.twig` - Affichage de la galerie avec modale

### **Assets**
- `public/css/gallery-styles.css` - Styles spécifiques à la galerie
- `public/js/gallery-handler.js` - JavaScript pour l'interactivité

### **Configuration**
- `config/services.yaml` - Configuration du service ImageUploadService
- `migrations/Version20250828000001.php` - Migration pour la table post_image

## 🛠 Installation et Configuration

### 1. **Mise à jour de la base de données**
```bash
php bin/console doctrine:migrations:migrate
```

### 2. **Permissions des dossiers**
Assurez-vous que le dossier `public/img/posts/` a les bonnes permissions d'écriture.

### 3. **Configuration des paramètres**
Le paramètre `images_directory` est déjà configuré dans `services.yaml` :
```yaml
parameters:
    images_directory: '%kernel.project_dir%/public/img/posts/'
```

## 💡 Utilisation

### **Pour créer un article avec galerie :**
1. Sélectionner la catégorie "Photo" dans le formulaire
2. Le champ "Galerie d'images" apparaîtra automatiquement
3. Cliquer ou glisser-déposer jusqu'à 50 images
4. Prévisualiser et supprimer si nécessaire
5. Publier l'article

### **Pour modifier une galerie existante :**
1. Dans l'édition d'un post "Photo"
2. Voir les images actuelles avec boutons de suppression
3. Ajouter de nouvelles images via le champ dédié
4. Sauvegarder les modifications

### **Affichage pour les visiteurs :**
- Les posts "Photo" affichent automatiquement leur galerie après le texte de l'article
- Galerie responsive avec 5 miniatures par ligne
- Clic sur une image pour l'ouvrir en grand dans une modale
- Navigation intuitive et responsive

## 🎨 Personnalisation

### **Modifier le nombre maximum d'images :**
Dans `PostType.php`, ligne `data-max-files` :
```php
'attr' => [
    'data-max-files' => '50' // Changer cette valeur
]
```

Et dans `gallery-simple.js`, fonction `validateFiles()` :
```javascript
const maxFiles = 50; // Changer cette valeur
```

### **Modifier la taille des miniatures :**
Dans le template `detail.html.twig`, section `.photo-gallery` :
```css
.photo-gallery {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); /* 160px pour 5 par ligne */
}
```

### **Personnaliser les couleurs :**
Les couleurs sont basées sur votre palette existante dans `gallery-styles.css` :
- `#ff6b6b` (rouge/saumon)
- `#8b785d` (brun)
- `#d4c4a8` (beige)

## 🔍 Structure technique

### **Relation des entités :**
- `Post` (OneToMany) → `PostImage` (ManyToOne)
- Suppression en cascade configurée
- Tri automatique par `sortOrder`

### **Workflow d'upload :**
1. Validation côté client (JS)
2. Validation côté serveur (Symfony)
3. Génération de noms uniques
4. Sauvegarde en base via `ImageUploadService`
5. Nettoyage automatique en cas de suppression

## 🚨 Notes importantes

- **Sécurité :** Validation stricte des types MIME et tailles de fichiers
- **Performance :** Les images ne sont pas redimensionnées automatiquement (à implémenter si besoin)
- **Sauvegarde :** Pensez à inclure le dossier `public/img/posts/` dans vos sauvegardes
- **SEO :** Possibilité d'ajouter des attributs `alt` pour chaque image (champ prévu dans l'entité)

## 📱 Responsive Design

La galerie s'adapte automatiquement :
- **Desktop :** 5 images par ligne
- **Tablette :** 3-4 images par ligne  
- **Mobile :** 2 images par ligne

## 🔧 Maintenance

### **Nettoyage des fichiers orphelins :**
Créer une commande Symfony pour supprimer les fichiers sans référence en base :
```bash
php bin/console app:cleanup-images
```
(Commande à implémenter selon les besoins)

---

Cette fonctionnalité transforme votre blog en une véritable plateforme de partage photo tout en conservant l'esprit et le design de votre application existante ! 🎉
