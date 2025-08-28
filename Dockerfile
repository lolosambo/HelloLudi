FROM php:8.2-apache

# Install required dependencies
RUN apt-get update && apt-get install -y \
    git \
    nano \
    unzip \
    libicu-dev \
    libonig-dev \
    libzip-dev \
    zlib1g-dev \
    && docker-php-ext-install intl pdo_mysql zip

# Configure PHP settings for larger uploads
RUN echo "upload_max_filesize = 20M" >> /usr/local/etc/php/php.ini-production && \
    echo "post_max_size = 25M" >> /usr/local/etc/php/php.ini-production && \
    echo "max_execution_time = 300" >> /usr/local/etc/php/php.ini-production && \
    echo "max_input_time = 300" >> /usr/local/etc/php/php.ini-production && \
    echo "memory_limit = 512M" >> /usr/local/etc/php/php.ini-production && \
    echo "max_file_uploads = 20" >> /usr/local/etc/php/php.ini-production && \
    cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini

# Configure Apache for Symfony
RUN echo "<Directory /var/www/html>" > /etc/apache2/conf-available/symfony.conf && \
    echo "    AllowOverride All" >> /etc/apache2/conf-available/symfony.conf && \
    echo "    Require all granted" >> /etc/apache2/conf-available/symfony.conf && \
    echo "</Directory>" >> /etc/apache2/conf-available/symfony.conf && \
    echo "" >> /etc/apache2/conf-available/symfony.conf && \
    echo "<Directory /var/www/html/helloludi/public>" >> /etc/apache2/conf-available/symfony.conf && \
    echo "    DirectoryIndex index.php" >> /etc/apache2/conf-available/symfony.conf && \
    echo "    FallbackResource /index.php" >> /etc/apache2/conf-available/symfony.conf && \
    echo "</Directory>" >> /etc/apache2/conf-available/symfony.conf && \
    a2enconf symfony

# Enable Apache modules
RUN a2enmod rewrite headers

# Set DocumentRoot to Symfony public directory
RUN sed -i 's|/var/www/html|/var/www/html/helloludi/public|g' /etc/apache2/sites-available/000-default.conf

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy custom entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set working directory
WORKDIR /var/www/html

# Expose port 80
EXPOSE 80

# Use custom entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]