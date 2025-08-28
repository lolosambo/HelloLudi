<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour créer la table post_image pour la galerie d'images
 */
final class Version20250828000001 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create post_image table for gallery functionality';
    }

    public function up(Schema $schema): void
    {
        // Create post_image table
        $this->addSql('CREATE TABLE post_image (
            id INT AUTO_INCREMENT NOT NULL, 
            post_id INT NOT NULL, 
            filename VARCHAR(255) NOT NULL, 
            original_name VARCHAR(255) DEFAULT NULL, 
            alt VARCHAR(255) DEFAULT NULL, 
            sort_order INT DEFAULT NULL, 
            upload_date DATETIME NOT NULL, 
            INDEX IDX_522688D74B89032C (post_id), 
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        
        // Add foreign key constraint
        $this->addSql('ALTER TABLE post_image ADD CONSTRAINT FK_522688D74B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // Drop foreign key and table
        $this->addSql('ALTER TABLE post_image DROP FOREIGN KEY FK_522688D74B89032C');
        $this->addSql('DROP TABLE post_image');
    }
}
