#!/bin/bash

echo "🔄 Nettoyage du cache Symfony..."

# Aller dans le dossier du projet
cd /home/laurentb/dev/blog/helloludi

# Vider le cache
php bin/console cache:clear --env=dev
php bin/console cache:clear --env=prod

# Vider les assets
php bin/console assets:install --symlink

echo "✅ Cache vidé avec succès !"

# Redémarrer les services si nécessaire
echo "🔄 Redémarrage des services..."
sudo service apache2 restart

echo "✅ Services redémarrés !"

echo "🎉 Maintenance terminée. Vous pouvez tester votre blog maintenant."
