#!/bin/bash

echo "🔍 Diagnostic du système de partage social - Hello Ludi"
echo "=================================================="

cd /home/laurentb/dev/blog/helloludi

echo ""
echo "📁 Vérification des fichiers..."

# Vérifier les composants Twig
if [ -f "templates/components/social/share_buttons.html.twig" ]; then
    echo "✅ share_buttons.html.twig existe"
else
    echo "❌ share_buttons.html.twig manquant"
fi

if [ -f "templates/components/social/share_buttons_compact.html.twig" ]; then
    echo "✅ share_buttons_compact.html.twig existe"
else
    echo "❌ share_buttons_compact.html.twig manquant"
fi

if [ -f "templates/components/social/share_widget.html.twig" ]; then
    echo "✅ share_widget.html.twig existe"
else
    echo "❌ share_widget.html.twig manquant"
fi

# Vérifier le service
if [ -f "src/Service/SocialShareService.php" ]; then
    echo "✅ SocialShareService.php existe"
else
    echo "❌ SocialShareService.php manquant"
fi

# Vérifier l'image par défaut
if [ -f "public/img/social-share-default.svg" ]; then
    echo "✅ Image par défaut existe"
else
    echo "❌ Image par défaut manquante"
fi

# Vérifier les templates modifiés
if grep -q "include 'components/social/share_buttons.html.twig'" templates/post/detail.html.twig; then
    echo "✅ Boutons de partage intégrés dans detail.html.twig"
else
    echo "❌ Boutons de partage non intégrés dans detail.html.twig"
fi

if grep -q "include 'components/social/share_widget.html.twig'" templates/home.html.twig; then
    echo "✅ Widget de partage intégré dans home.html.twig"
else
    echo "❌ Widget de partage non intégré dans home.html.twig"
fi

echo ""
echo "🔧 Vérification du service dans le contrôleur..."

if grep -q "SocialShareService" src/Controller/PostController.php; then
    echo "✅ SocialShareService injecté dans PostController"
else
    echo "❌ SocialShareService non injecté dans PostController"
fi

echo ""
echo "📊 Statistiques des fichiers..."

echo "Taille du composant principal: $(wc -c < templates/components/social/share_buttons.html.twig) octets"
echo "Taille du service PHP: $(wc -c < src/Service/SocialShareService.php) octets"

echo ""
echo "🏁 Diagnostic terminé"
echo "Si tous les éléments sont ✅, le système devrait fonctionner."
echo "Si des éléments sont ❌, vérifiez les fichiers concernés."
