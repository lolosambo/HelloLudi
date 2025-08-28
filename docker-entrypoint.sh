#!/bin/bash

# Set proper permissions for Symfony
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
chmod -R 775 /var/www/html/helloludi/var
chmod -R 775 /var/www/html/helloludi/public/img

# Create cache and log directories if they don't exist
mkdir -p /var/www/html/helloludi/var/cache
mkdir -p /var/www/html/helloludi/var/log
mkdir -p /var/www/html/helloludi/var/sessions
mkdir -p /var/www/html/helloludi/public/img/posts

# Set permissions for these directories
chown -R www-data:www-data /var/www/html/helloludi/var
chown -R www-data:www-data /var/www/html/helloludi/public/img
chmod -R 775 /var/www/html/helloludi/var
chmod -R 775 /var/www/html/helloludi/public/img

# Start Apache
exec apache2-foreground
