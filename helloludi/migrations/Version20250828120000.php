<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour ajouter CASCADE DELETE sur les contraintes de clés étrangères
 */
final class Version20250828120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add CASCADE DELETE to foreign key constraints for comments and ratings';
    }

    public function up(Schema $schema): void
    {
        // Supprimer l'ancienne contrainte de clé étrangère pour comments
        $this->addSql('ALTER TABLE comments DROP FOREIGN KEY FK_5F9E962A4B89032C');
        
        // Recréer la contrainte avec CASCADE DELETE
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962A4B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
        
        // Vérifier si la contrainte existe pour ratings et l'ajuster si nécessaire
        $this->addSql('SET @constraint_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = "rating" AND CONSTRAINT_TYPE = "FOREIGN KEY" AND CONSTRAINT_NAME LIKE "%post_id%")');
        $this->addSql('SET @sql = IF(@constraint_exists > 0, "ALTER TABLE rating DROP FOREIGN KEY FK_D88926224B89032C", "SELECT 1")');
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
        
        // Recréer la contrainte pour ratings avec CASCADE DELETE
        $this->addSql('ALTER TABLE rating ADD CONSTRAINT FK_D88926224B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // Retirer les contraintes CASCADE et remettre les anciennes
        $this->addSql('ALTER TABLE comments DROP FOREIGN KEY FK_5F9E962A4B89032C');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962A4B89032C FOREIGN KEY (post_id) REFERENCES post (id)');
        
        $this->addSql('ALTER TABLE rating DROP FOREIGN KEY FK_D88926224B89032C');
        $this->addSql('ALTER TABLE rating ADD CONSTRAINT FK_D88926224B89032C FOREIGN KEY (post_id) REFERENCES post (id)');
    }
}
