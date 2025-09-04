# 🌟 Hello Ludi - Blog Personnel

Un blog moderne et complet développé avec Symfony 6.4 et Bootstrap 5, offrant une expérience utilisateur riche pour partager recettes, photos, événements et actualités.

![Symfony](https://img.shields.io/badge/Symfony-6.4-000000?style=for-the-badge&logo=symfony)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.0-7952B3?style=for-the-badge&logo=bootstrap)
![PHP](https://img.shields.io/badge/PHP-8.1+-777BB4?style=for-the-badge&logo=php)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)

---

## 📋 Table des Matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [📁 Structure du Projet](#-structure-du-projet)
- [🎨 Interface Utilisateur](#-interface-utilisateur)
- [🔧 Administration](#-administration)
- [📱 Responsive Design](#-responsive-design)
- [🛠️ Technologies](#️-technologies)
- [📖 Utilisation](#-utilisation)
- [🤝 Contribution](#-contribution)

---

## ✨ Fonctionnalités

### 🍳 **Système de Posts Multitype**
- **Recettes** : Avec nombre de personnes, temps de cuisson, et notation
- **Photos** : Galeries d'images avec visualisation en modal
- **Événements** : Avec date, lieu et countdown automatique
- **Actualités** : Articles de blog classiques
- **Qui suis-je** : Page de présentation personnalisable

### 👤 **Gestion des Utilisateurs**
- Inscription et connexion sécurisées
- Profils personnalisables avec avatar
- Système de rôles (Admin/Utilisateur)
- **3 thèmes visuels** : Marron, Blanc, Noir

### 💬 **Interactions Sociales**
- Système de commentaires avec réponses
- Likes sur les articles
- Notation des recettes (étoiles)
- Partage social (Facebook, Twitter, WhatsApp, etc.)

### 🎨 **Éditeur Riche Avancé**
- Formatage de texte complet (gras, italique, couleurs)
- Insertion d'images avec redimensionnement
- Insertion de vidéos (YouTube, Vimeo, Dailymotion)
- Tableaux éditables avec tri
- Mode responsive automatique

### 🖼️ **Gestion des Médias**
- Upload d'images multiples
- Redimensionnement automatique
- Galeries photos interactives
- Support formats : JPG, PNG, GIF, WebP

### 🎪 **Fonctionnalités Avancées**
- **Footer dynamique** avec événements à venir
- **Playlist Spotify** intégrée
- **Système de cookies** RGPD
- **SEO optimisé** avec Open Graph
- **Mode offline** basique

---

## 🚀 Installation

### 📋 **Prérequis**
- **PHP** >= 8.1
- **Composer**
- **Node.js** et **npm** (optionnel)
- **MySQL** >= 8.0 ou **MariaDB** >= 10.4
- **Apache** ou **Nginx**

### 🔧 **Installation Étape par Étape**

1. **Cloner le Projet**
   ```bash
   git clone [URL_DU_REPOSITORY]
   cd helloludi
   ```

2. **Installer les Dépendances**
   ```bash
   composer install
   ```

3. **Configuration Environnement**
   ```bash
   cp .env .env.local
   ```
   
   Modifier `.env.local` :
   ```env
   # Base de données
   DATABASE_URL="mysql://utilisateur:motdepasse@127.0.0.1:3306/helloludi"
   
   # Mailer (optionnel)
   MAILER_DSN=smtp://localhost
   
   # Clés secrètes
   APP_SECRET=your_secret_key
   ```

4. **Base de Données**
   ```bash
   # Créer la base
   php bin/console doctrine:database:create
   
   # Exécuter les migrations
   php bin/console doctrine:migrations:migrate
   
   # Charger les fixtures (données de test)
   php bin/console doctrine:fixtures:load
   ```

5. **Permissions des Dossiers**
   ```bash
   chmod -R 755 public/uploads
   chmod -R 755 var/
   ```

6. **Lancer le Serveur**
   ```bash
   symfony server:start
   # ou
   php -S localhost:8000 -t public/
   ```

7. **Accès**
   - **Site** : http://localhost:8000
   - **Admin** : Créer un compte puis modifier le rôle en BDD

---

## ⚙️ Configuration

### 🗂️ **Dossiers Importants**
```
public/
├── css/           # Styles CSS personnalisés
├── js/            # Scripts JavaScript
├── img/           # Images statiques
└── uploads/       # Fichiers uploadés (à créer)

src/
├── Controller/    # Contrôleurs Symfony
├── Entity/        # Entités Doctrine
├── Form/          # Formulaires Symfony
├── Repository/    # Repositories Doctrine
└── Service/       # Services métier

templates/
├── base.html.twig       # Template de base
├── home.html.twig       # Page d'accueil
├── post/               # Templates des articles
├── user/               # Templates utilisateurs
└── components/         # Composants réutilisables
```

### 🎨 **Personnalisation des Thèmes**

Les thèmes sont dans `public/css/` :
- `style.css` - Thème marron (défaut)
- `style_white.css` - Thème blanc
- `style_black.css` - Thème noir

Pour ajouter un nouveau thème :
1. Créer `style_nouveau.css`
2. Modifier `UserController.php` pour ajouter l'option
3. Mettre à jour `base.html.twig`

---

## 📁 Structure du Projet

### 🏗️ **Architecture MVC**
```
📦 Hello Ludi Blog
├── 🎮 **Contrôleurs**
│   ├── PostController     # CRUD des articles
│   ├── UserController     # Gestion utilisateurs  
│   ├── WhoAmIController   # Page présentation
│   └── SecurityController # Authentification
├── 🗃️ **Entités**
│   ├── Post              # Articles
│   ├── User              # Utilisateurs
│   ├── Comment           # Commentaires
│   ├── Like              # Likes
│   ├── Rating            # Notations
│   └── PostImage         # Images des articles
├── 📝 **Formulaires**
│   ├── PostType          # Création/édition d'articles
│   ├── UserType          # Profils utilisateurs
│   └── WhoAmIType        # Page "Qui suis-je"
└── 🎨 **Templates**
    ├── Layout responsive
    ├── Composants réutilisables
    └── Pages spécialisées
```

### 🔧 **Scripts JavaScript Organisés**
```
js/
├── 📁 pages/
│   ├── base.js           # Fonctionnalités communes
│   ├── home.js           # Page d'accueil
│   ├── post-detail.js    # Détail des articles
│   └── who-am-i-editor.js # Éditeur "Qui suis-je"
├── 📝 **Éditeurs**
│   ├── SimpleRichEditor.js # Éditeur principal
│   ├── table-editor.js     # Tableaux
│   └── form-handler.js     # Gestion formulaires
└── 🖼️ **Galeries**
    ├── gallery-init.js     # Initialisation
    └── gallery-simple.js   # Galerie simple
```

---

## 🎨 Interface Utilisateur

### 🏠 **Page d'Accueil**
- **Grille responsive** des articles récents
- **Rubans de catégorie** colorés
- **Aperçus** avec troncature intelligente
- **Statistiques** (likes, commentaires)
- **Partage social** intégré
- **Section recettes populaires** avec notation

### 📝 **Création d'Articles**
- **Éditeur WYSIWYG** moderne et intuitif
- **Champs conditionnels** selon le type d'article
- **Upload d'images** par glisser-déposer
- **Galeries multiples** pour les photos
- **Prévisualisation** en temps réel

### 👤 **Profils Utilisateurs**
- **Personnalisation complète**
- **Upload d'avatar** 
- **Choix de thème** visuel
- **Historique** des publications

---

## 🔧 Administration

### 👑 **Fonctions Admin**
- **Modération** des commentaires
- **Gestion** des utilisateurs
- **Statistiques** du site
- **Publication/Dépublication** d'articles
- **Édition** de tous les contenus

### 📊 **Tableau de Bord**
- **Articles** par catégorie
- **Activité** utilisateurs
- **Commentaires** récents
- **Statistiques** d'engagement

---

## 📱 Responsive Design

### 📐 **Breakpoints**
- **Mobile** : < 768px
- **Tablette** : 768px - 1024px  
- **Desktop** : > 1024px

### 🎯 **Adaptations Mobiles**
- **Menu hamburger** avec off-canvas
- **Cartes empilées** sur mobile
- **Éditeur tactile** optimisé
- **Galeries** swipables
- **Boutons** dimensionnés pour le tactile

---

## 🛠️ Technologies

### 🏗️ **Backend**
- **Symfony 6.4** - Framework PHP moderne
- **Doctrine ORM** - Gestion base de données
- **Twig** - Moteur de templates
- **Security Component** - Authentification

### 🎨 **Frontend**
- **Bootstrap 5** - Framework CSS
- **JavaScript ES6+** - Interactivité
- **FontAwesome & Bootstrap Icons** - Icônes
- **Google Fonts** - Typographies personnalisées

### 🗄️ **Base de Données**
- **MySQL 8.0** - Base principale
- **Migrations Doctrine** - Versioning schéma
- **Fixtures** - Données de test

---

## 📖 Utilisation

### 👥 **Pour les Visiteurs**
1. **Navigation** intuitive par catégories
2. **Lecture** d'articles avec commentaires
3. **Interaction** (likes, partages)
4. **Inscription** optionnelle pour plus de fonctionnalités

### ✍️ **Pour les Contributeurs**
1. **Inscription** via le formulaire
2. **Création** d'articles avec l'éditeur riche
3. **Upload** d'images et médias
4. **Publication** et partage

### 👑 **Pour les Administrateurs**
1. **Gestion** complète du contenu
2. **Modération** des commentaires
3. **Administration** des utilisateurs
4. **Configuration** du site

---

## 🚀 Fonctionnalités Uniques

### 🎪 **Footer Dynamique**
- **Événements à venir** automatiques
- **Playlist Spotify** personnalisée
- **Liens sociaux** configurables

### 🖼️ **Galeries Interactives**
- **Modal full-screen** avec navigation
- **Zoom** et **pan** sur les images
- **Diaporama** automatique
- **Métadonnées** des photos

### 📱 **PWA Ready**
- **Manifest** configuré
- **Service Worker** basique
- **Mode offline** pour la consultation
- **Installation** possible sur mobile

---

## 🔒 Sécurité

### 🛡️ **Mesures Implémentées**
- **CSRF Protection** sur tous les formulaires
- **XSS Protection** avec Twig auto-escape
- **SQL Injection** prévenue par Doctrine
- **Upload** sécurisé avec validation MIME
- **Authentification** robuste Symfony

### 🍪 **RGPD & Cookies**
- **Banner** de consentement
- **Gestion** des préférences
- **Anonymisation** possible des données

---

## 🔄 Maintenance

### 🗂️ **Logs**
- **Symfony logs** : `var/log/`
- **Apache logs** : Selon configuration serveur
- **Debug** : Mode dev avec Symfony Profiler

### 🧹 **Nettoyage**
```bash
# Vider le cache
php bin/console cache:clear

# Nettoyer les assets
rm -rf public/uploads/temp/

# Optimiser la base
php bin/console doctrine:query:sql "OPTIMIZE TABLE post, comment, user"
```

### 📊 **Sauvegarde**
```bash
# Base de données
mysqldump helloludi > backup_$(date +%Y%m%d).sql

# Fichiers uploadés  
tar -czf uploads_$(date +%Y%m%d).tar.gz public/uploads/
```

---

## 🤝 Contribution

### 🔧 **Développement**
1. **Fork** le projet
2. **Créer** une branche feature
3. **Développer** avec les standards Symfony
4. **Tester** sur différents navigateurs
5. **Pull Request** avec description détaillée

### 🎨 **Design**
- Respecter la **charte graphique** Bootstrap
- **Mobile-first** approach
- **Accessibilité** WCAG 2.1
- **Performance** optimisée

---

## 📞 Support

### 🐛 **Signaler un Bug**
1. **Console navigateur** pour erreurs JS
2. **Logs Symfony** pour erreurs serveur  
3. **Description** détaillée du problème
4. **Steps to reproduce**

### 💡 **Demander une Fonctionnalité**
1. **Issue GitHub** avec label "enhancement"
2. **Description** du besoin
3. **Cas d'usage** concrets
4. **Mockups** si possible

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

---

## 🙏 Remerciements

- **Symfony Community** pour le framework
- **Bootstrap Team** pour le framework CSS
- **Contributors** qui améliorent le projet
- **Users** qui utilisent et testent l'application

---

**💖 Fait avec amour pour partager les bonnes choses de la vie ! 🍳📸🎉**

---

*Dernière mise à jour : Janvier 2025*
