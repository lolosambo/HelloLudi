<?php

namespace App\Service;

use App\Entity\Post;
use App\Entity\PostImage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ImageUploadService
{
    private string $imagesDirectory;
    private EntityManagerInterface $entityManager;

    public function __construct(string $imagesDirectory, EntityManagerInterface $entityManager)
    {
        $this->imagesDirectory = $imagesDirectory;
        $this->entityManager = $entityManager;
    }

    /**
     * Upload une image unique
     */
    public function uploadSingleImage(UploadedFile $file): ?string
    {
        try {
            $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = transliterator_transliterate('Any-Latin; Latin-ASCII; [^A-Za-z0-9_] remove; Lower()', $originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();

            $file->move($this->imagesDirectory, $newFilename);

            return $newFilename;
        } catch (FileException $e) {
            // Gérer l'exception si nécessaire
            return null;
        }
    }

    /**
     * Upload plusieurs images et les associe à un post
     * 
     * @param UploadedFile[] $files
     * @param Post $post
     * @return int Nombre d'images uploadées avec succès
     */
    public function uploadMultipleImages(array $files, Post $post): int
    {
        $successCount = 0;
        $sortOrder = 1;

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $filename = $this->uploadSingleImage($file);
                
                if ($filename) {
                    $postImage = new PostImage();
                    $postImage->setFilename($filename);
                    $postImage->setOriginalName($file->getClientOriginalName());
                    $postImage->setSortOrder($sortOrder);
                    $postImage->setPost($post);

                    $this->entityManager->persist($postImage);
                    $successCount++;
                    $sortOrder++;
                }
            }
        }

        return $successCount;
    }

    /**
     * Supprime un fichier image du système de fichiers
     */
    public function deleteImageFile(string $filename): bool
    {
        $filePath = $this->imagesDirectory . '/' . $filename;
        
        if (file_exists($filePath)) {
            return unlink($filePath);
        }
        
        return false;
    }

    /**
     * Supprime toutes les images d'un post
     */
    public function deleteAllPostImages(Post $post): void
    {
        foreach ($post->getPostImages() as $postImage) {
            $this->deleteImageFile($postImage->getFilename());
        }
    }

    /**
     * Génère un nom de fichier sécurisé
     */
    private function generateSafeFilename(string $originalFilename): string
    {
        $filename = pathinfo($originalFilename, PATHINFO_FILENAME);
        $safeFilename = transliterator_transliterate('Any-Latin; Latin-ASCII; [^A-Za-z0-9_] remove; Lower()', $filename);
        
        return $safeFilename ?: 'image';
    }
}
