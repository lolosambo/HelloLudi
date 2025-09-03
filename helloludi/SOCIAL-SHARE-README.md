# Système de Partage Social - Hello Ludi Blog

## 📋 Vue d'ensemble

Ce système de partage social permet aux visiteurs du blog de partager facilement les articles sur leurs réseaux sociaux préférés. Il comprend plusieurs composants modulaires et un service backend pour optimiser l'expérience de partage.

## 🚀 Fonctionnalités

### Plateformes supportées
- **Facebook** - Partage avec métadonnées Open Graph
- **Twitter/X** - Partage avec hashtags automatiques
- **LinkedIn** - Partage professionnel
- **Pinterest** - Épinglage avec description
- **WhatsApp** - Partage mobile-friendly
- **Telegram** - Partage instantané
- **Email** - Partage par email avec sujet et corps pré-remplis
- **Copie du lien** - Copie automatique dans le presse-papiers

### Types de boutons disponibles

1. **Boutons complets** (`share_buttons.html.twig`)
   - Affichage en grille avec libellés
   - Idéal pour la page de détail des articles
   - Animations et feedback visuels

2. **Boutons compacts** (`share_buttons_compact.html.twig`)
   - Version minimaliste avec expansion au survol
   - Parfait pour les barres d'outils ou sidebars

3. **Widget de partage** (`share_widget.html.twig`)
   - Intégration dans les cartes d'articles
   - Différentes positions (top, bottom, overlay)

## 📁 Structure des fichiers

```
templates/components/social/
├── share_buttons.html.twig        # Boutons complets
├── share_buttons_compact.html.twig # Version compacte
└── share_widget.html.twig         # Widget pour cartes

src/Service/
└── SocialShareService.php         # Service backend

public/img/
└── social-share-default.svg       # Image par défaut pour Open Graph
```

## 🛠️ Installation et configuration

### 1. Service Symfony (déjà configuré)

Le service `SocialShareService` est automatiquement injecté dans le contrôleur `PostController`.

### 2. Utilisation dans les templates

#### Dans la page de détail d'un article :

```twig
<!-- Boutons complets -->
{% include 'components/social/share_buttons.html.twig' with {
    'title': post.getTitle(),
    'url': app.request.schemeAndHttpHost ~ path('post_detail', {'post': post.getId()}),
    'description': post.getContent()|striptags|slice(0, 150) ~ '...',
    'hashtags': 'recette,cuisine,helloludi'
} %}
```

#### Dans les cartes d'articles (liste) :

```twig
<!-- Widget compact -->
{% include 'components/social/share_widget.html.twig' with {
    'post': post,
    'position': 'overlay'
} %}
```

#### Version compacte pour sidebars :

```twig
<!-- Boutons compacts -->
{% include 'components/social/share_buttons_compact.html.twig' with {
    'title': 'Mon super article',
    'url': 'https://monsite.com/article/123',
    'size': 'small'
} %}
```

## 🎨 Personnalisation

### Variables Twig disponibles

**share_buttons.html.twig :**
- `title` - Titre à partager
- `url` - URL complète à partager
- `description` - Description pour certains réseaux
- `hashtags` - Tags séparés par des virgules (sans #)

**share_widget.html.twig :**
- `post` - Entité Post Symfony
- `position` - 'top', 'bottom', ou 'overlay'

**share_buttons_compact.html.twig :**
- `title` - Titre à partager
- `url` - URL à partager
- `size` - 'small' pour version miniature

### Personnalisation CSS

Chaque composant inclut ses propres styles. Pour personnaliser :

1. **Couleurs des plateformes :** Modifier les variables CSS dans chaque template
2. **Animations :** Ajuster les transitions et keyframes
3. **Responsive :** Adapter les media queries selon vos besoins

## 🔧 Métadonnées et SEO

### Open Graph automatique

Le service génère automatiquement les métadonnées Open Graph :

```php
// Dans le contrôleur
$openGraphData = $socialShareService->generateOpenGraphData($post);
```

### JSON-LD structuré

Pour améliorer le SEO :

```php
// Génération des données structurées
$jsonLdData = $socialShareService->generateJsonLdData($post);
```

## 📱 Compatibilité mobile

- **Responsive design** adapté aux écrans mobiles
- **Détection tactile** pour les interactions
- **Optimisation WhatsApp** pour le partage mobile
- **Gestion des popups** compatible avec les navigateurs mobiles

## 🎯 Analytics et suivi

### Événements de partage

Le système inclut un suivi basique des partages :

```javascript
// Exemple d'intégration Google Analytics
function trackShare(platform) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
            method: platform,
            content_type: 'article',
            content_id: window.location.pathname
        });
    }
}
```

## ⚡ Performance

### Optimisations incluses

- **Lazy loading** des scripts de partage
- **CSS inline** pour éviter les requêtes supplémentaires
- **Sprites d'icônes** avec Font Awesome
- **Mise en cache** des URLs de partage

## 🐛 Résolution de problèmes

### Problèmes courants

1. **Les popups sont bloquées**
   - Solution : Utiliser `window.open()` dans un gestionnaire d'événement direct

2. **La copie ne fonctionne pas**
   - Solution : Fallback vers l'ancienne méthode `execCommand`

3. **Les métadonnées n'apparaissent pas**
   - Vérifier que l'image par défaut existe : `/img/social-share-default.svg`
   - Tester avec l'outil de débogage Facebook

### Debug

Activer le mode debug JavaScript :

```javascript
console.log('🎨 Partage social - Mode debug activé');
```

## 🔮 Améliorations futures

### Fonctionnalités prévues

- **Partage natif** avec l'API Web Share
- **Statistiques de partage** en base de données
- **A/B testing** des boutons
- **Intégration** avec Google Analytics 4
- **Support** de nouvelles plateformes (TikTok, Discord, etc.)

### Personnalisations avancées

- **Thèmes** multiples selon le type d'article
- **Positions dynamiques** selon le contexte
- **Animations** personnalisées par catégorie

## 📞 Support

Pour toute question ou amélioration, consulter :
- Le code source dans `src/Service/SocialShareService.php`
- Les templates dans `templates/components/social/`
- Les exemples d'utilisation dans `templates/post/detail.html.twig`

---

*Système développé pour le blog Hello Ludi - Version 1.0*
