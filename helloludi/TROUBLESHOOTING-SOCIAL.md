# 🚨 Guide de Résolution de Problèmes - Partage Social

## Problèmes fréquents et solutions

### 1. Erreur "A block definition cannot be nested under non-capturing nodes"

**Cause :** Structure Twig incorrecte avec des blocs dans des conditions.

**Solution :**
```bash
# Vérifier que les blocs Twig sont correctement structurés
grep -n "block\|endif\|endfor" templates/post/detail.html.twig
```

**Fix :** Assurer que tous les blocs {% block %} sont à la racine du template, pas dans des conditions.

### 2. Les boutons de partage ne s'affichent pas

**Diagnostic :**
```bash
# Vérifier que les fichiers existent
ls -la templates/components/social/
```

**Solutions possibles :**

1. **Cache non vidé :**
```bash
cd /home/laurentb/dev/blog/helloludi
php bin/console cache:clear --env=dev
```

2. **Inclusion manquante :**
Vérifier dans `templates/post/detail.html.twig` :
```twig
{% include 'components/social/share_buttons.html.twig' with {
    'title': post.getTitle(),
    'url': app.request.schemeAndHttpHost ~ path('post_detail', {'post': post.getId()}),
    'description': post.getContent()|striptags|slice(0, 150) ~ '...',
    'hashtags': 'helloludi,blog'
} %}
```

3. **Variables non définies :**
Vérifier que le contrôleur passe bien toutes les variables nécessaires.

### 3. Service SocialShareService non trouvé

**Solution :**
```php
// Dans PostController.php, vérifier l'injection :
use App\Service\SocialShareService;

public function detail(
    // ... autres paramètres
    SocialShareService $socialShareService
) {
    // ...
}
```

### 4. Icônes Font Awesome manquantes

**Vérification :**
```html
<!-- Dans base.html.twig, s'assurer que Font Awesome est chargé : -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
```

**Alternative :** Utiliser des icônes Bootstrap à la place :
```html
<i class="bi bi-facebook"></i>
<i class="bi bi-twitter"></i>
<i class="bi bi-whatsapp"></i>
```

### 5. Erreurs JavaScript dans la console

**Debug :**
```javascript
// Ouvrir les outils de développement (F12)
// Vérifier la console pour des erreurs
console.log('🎨 Social sharing loaded');
```

**Solution :** S'assurer que jQuery ou Bootstrap JS n'interfère pas.

### 6. Les popups de partage sont bloquées

**Cause :** Bloqueur de popups du navigateur.

**Solution :** Utiliser l'événement click direct :
```javascript
button.addEventListener('click', function(e) {
    e.preventDefault();
    // Code de partage ici
});
```

### 7. Métadonnées Open Graph non visibles

**Test :**
- Utiliser l'outil de débogage Facebook : https://developers.facebook.com/tools/debug/
- Tester avec LinkedIn : https://www.linkedin.com/post-inspector/

**Solutions :**
1. Vérifier que l'image par défaut existe : `/public/img/social-share-default.svg`
2. S'assurer que les URLs sont complètes (avec http/https)
3. Attendre quelques minutes pour la mise en cache

### 8. Styles CSS non appliqués

**Diagnostic :**
```bash
# Vérifier que les styles sont dans les templates
grep -A5 -B5 "social-share-container" templates/components/social/share_buttons.html.twig
```

**Solution :** Les styles sont inline dans les composants, donc pas de fichier CSS externe requis.

### 9. Erreur lors du clic sur "Copier le lien"

**Cause :** API Clipboard non supportée ou contexte non sécurisé.

**Solution :** Le fallback `execCommand` est déjà implémenté.

**Test :**
```javascript
// Dans la console du navigateur :
navigator.clipboard.writeText('test').then(() => console.log('✅ OK')).catch(() => console.log('❌ Fallback requis'));
```

### 10. Les boutons ne répondent pas

**Solutions :**
1. **Vérifier les conflits JavaScript :**
```javascript
// Désactiver temporairement d'autres scripts
document.querySelectorAll('.share-btn').forEach(btn => {
    console.log('Button found:', btn);
});
```

2. **Vérifier les événements :**
```javascript
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('share-btn')) {
        console.log('Share button clicked!');
    }
});
```

## 🔧 Commandes de diagnostic rapide

```bash
# Diagnostic complet
bash diagnostic-social.sh

# Vider le cache
bash clear-cache.sh

# Vérifier les logs
tail -f var/log/dev.log

# Test des URLs de partage
php test-social-service.php
```

## 📞 Support

En cas de problème persistant :

1. **Vérifier les logs Symfony :** `var/log/dev.log`
2. **Tester avec un article simple**
3. **Désactiver temporairement le cache** : `APP_ENV=dev`
4. **Vérifier la console navigateur** pour les erreurs JS
5. **Tester sur un autre navigateur**

## 🎯 Version de secours simplifiée

Si tout échoue, voici une version ultra-simple :

```html
<!-- Version minimale pour debug -->
<div style="margin: 2rem 0; text-align: center;">
    <h5>Partager cet article :</h5>
    <a href="https://www.facebook.com/sharer/sharer.php?u={{ app.request.uri }}" target="_blank" 
       style="margin: 0.5rem; padding: 0.5rem 1rem; background: #1877f2; color: white; text-decoration: none; border-radius: 5px;">
        Facebook
    </a>
    <a href="https://twitter.com/intent/tweet?text={{ post.title|url_encode }}&url={{ app.request.uri }}" target="_blank"
       style="margin: 0.5rem; padding: 0.5rem 1rem; background: #1da1f2; color: white; text-decoration: none; border-radius: 5px;">
        Twitter
    </a>
</div>
```

Cette version de base devrait toujours fonctionner même en cas de problème complexe.
