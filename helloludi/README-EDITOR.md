# Éditeur de Texte Riche - Blog Symfony

Un éditeur de texte riche simple, moderne et efficace pour votre blog Symfony, développé avec Bootstrap 5 et JavaScript vanilla.

## 🚀 Fonctionnalités

### Formatage de base
- **Historique** : Annuler/Rétablir
- **Formats** : Titre 1-3, Paragraphe
- **Style de texte** : Gras, Italique, Souligné
- **Couleurs** : Couleur du texte
- **Alignement** : Gauche, Centre, Droite
- **Listes** : À puces et numérotées

### Insertion de médias
- **Liens hypertexte** : Avec option d'ouverture dans un nouvel onglet
- **Images** : Par URL ou upload (drag & drop supporté)
- **Vidéos YouTube** : Intégration directe par URL
- **Configuration avancée** : Alignement, taille, texte alternatif

### Fonctionnalités avancées
- **Mode plein écran** pour une édition immersive
- **Raccourcis clavier** (Ctrl+B, Ctrl+I, Ctrl+U)
- **Responsive** : Adapté aux mobiles et tablettes
- **Gestion des erreurs** et validation
- **Nettoyage automatique** du HTML généré

## 📦 Installation

### 1. Fichiers nécessaires

Copiez ces fichiers dans votre projet Symfony :

```
public/
├── css/
│   └── rich-editor.css
├── js/
│   ├── RichEditor.js
│   └── form-handler.js
└── demo-editor.html (optionnel)

templates/
└── components/
    └── _rich_editor_modals.html.twig
```

### 2. Intégration dans les templates

#### Template de création de post (`create.html.twig`) :

```twig
{% block stylesheets %}
    {{ parent() }}
    <link href="{{ asset('css/rich-editor.css') }}" rel="stylesheet">
{% endblock %}

<!-- Dans le formulaire -->
<div class="form-group">
    <label class="form-label">
        <i class="bi bi-file-text"></i>
        {{ form_label(form.content) }}
    </label>
    {{ form_widget(form.content, {'attr': {'style': 'display: none;', 'id': 'post_content'}}) }}
    <div id="richEditorContainer"></div>
    {{ form_errors(form.content) }}
</div>

<!-- Avant la fermeture du body -->
{% include 'components/_rich_editor_modals.html.twig' %}
<script src="{{ asset('js/RichEditor.js') }}"></script>
<script src="{{ asset('js/form-handler.js') }}"></script>
```

### 3. Configuration requise

L'éditeur recherche automatiquement :
- **Conteneur** : `#richEditorContainer`
- **Champ caché** : `#post_content`
- **Modales Bootstrap 5** pour les fonctionnalités avancées

## 🎯 Utilisation

### Initialisation automatique

L'éditeur s'initialise automatiquement au chargement de la page :

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const editorContainer = document.getElementById('richEditorContainer');
    if (editorContainer) {
        window.richEditor = new RichEditor('richEditorContainer');
    }
});
```

### Utilisation manuelle

```javascript
// Créer une instance
const editor = new RichEditor('monContainer', {
    hiddenFieldId: 'mon_champ_cache',
    placeholder: 'Tapez votre texte ici...'
});

// API publique
editor.setContent('<p>Nouveau contenu</p>');
editor.getContent(); // Récupérer le HTML
editor.clear(); // Vider l'éditeur
editor.focus(); // Donner le focus
```

### Raccourcis clavier

- `Ctrl + B` : **Gras**
- `Ctrl + I` : *Italique*
- `Ctrl + U` : Souligné

## 🎨 Personnalisation

### CSS

L'éditeur utilise des variables CSS pour une personnalisation facile :

```css
.rich-editor-container {
    --editor-border-color: #ddd;
    --editor-bg-color: #fff;
    --toolbar-bg-color: #f8f9fa;
    --btn-hover-color: #e9ecef;
    --btn-active-color: #007bff;
}
```

### Options JavaScript

```javascript
const editor = new RichEditor('container', {
    hiddenFieldId: 'content',          // ID du champ caché
    placeholder: 'Votre texte...',     // Texte d'aide
    uploadUrl: '/upload'               // URL d'upload (future feature)
});
```

## 🔧 Dépendances

- **Bootstrap 5.3+** (CSS + JS)
- **Bootstrap Icons 1.10+**
- **JavaScript ES6+** (navigateurs modernes)

## 📱 Compatibilité

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile (iOS Safari, Chrome Mobile)

## 🐛 Résolution de problèmes

### L'éditeur ne s'affiche pas

1. Vérifiez que le conteneur `#richEditorContainer` existe
2. Vérifiez que Bootstrap 5 JS est chargé
3. Ouvrez la console pour voir les erreurs

### Les modales ne s'ouvrent pas

1. Vérifiez que `_rich_editor_modals.html.twig` est inclus
2. Vérifiez que Bootstrap JS est initialisé
3. Vérifiez qu'il n'y a pas de conflits avec d'autres modales

### Le contenu n'est pas sauvegardé

1. Vérifiez que le champ caché a l'ID `post_content`
2. Vérifiez que le formulaire n'est pas soumis avant l'initialisation
3. Testez avec `editor.getContent()` dans la console

## 🔮 Roadmap

### Version 1.1 (À venir)
- [ ] Upload réel d'images vers le serveur
- [ ] Redimensionnement d'images en direct
- [ ] Insertion de tableaux
- [ ] Plus d'options de formatage (exposant, indice, etc.)
- [ ] Thèmes de couleurs personnalisables

### Version 1.2 (Futur)
- [ ] Mode collaboratif
- [ ] Historique avancé avec branches
- [ ] Import/Export de formats
- [ ] Plugins système

## 🤝 Contribution

Pour contribuer au projet :

1. Forkez le repository
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Pushez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- **Bootstrap Team** pour le framework CSS
- **Bootstrap Icons** pour les icônes
- **Symfony Community** pour l'inspiration

---

Développé avec ❤️ pour la communauté Symfony
