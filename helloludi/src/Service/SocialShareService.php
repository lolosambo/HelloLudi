<?php

namespace App\Service;

use App\Entity\Post;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Service pour gérer le partage social des articles
 */
class SocialShareService
{
    private UrlGeneratorInterface $urlGenerator;
    private RequestStack $requestStack;

    public function __construct(UrlGeneratorInterface $urlGenerator, RequestStack $requestStack)
    {
        $this->urlGenerator = $urlGenerator;
        $this->requestStack = $requestStack;
    }

    /**
     * Génère les URLs de partage pour un article
     *
     * @param Post $post
     * @return array
     */
    public function generateShareUrls(Post $post): array
    {
        $title = $post->getTitle();
        $url = $this->generatePostUrl($post);
        $description = $this->generateDescription($post);
        $hashtags = $this->generateHashtags($post);

        return [
            'facebook' => $this->generateFacebookUrl($url),
            'twitter' => $this->generateTwitterUrl($title, $url, $hashtags),
            'linkedin' => $this->generateLinkedInUrl($url),
            'pinterest' => $this->generatePinterestUrl($url, $title),
            'whatsapp' => $this->generateWhatsAppUrl($title, $url),
            'telegram' => $this->generateTelegramUrl($title, $url),
            'email' => $this->generateEmailUrl($title, $description, $url),
            'reddit' => $this->generateRedditUrl($title, $url),
        ];
    }

    /**
     * Génère l'URL complète de l'article
     */
    private function generatePostUrl(Post $post): string
    {
        return $this->urlGenerator->generate(
            'post_detail', 
            ['post' => $post->getId()], 
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    /**
     * Génère une description optimisée pour le partage
     */
    private function generateDescription(Post $post): string
    {
        $content = strip_tags($post->getContent());
        $description = mb_substr($content, 0, 150);
        
        if (mb_strlen($content) > 150) {
            $description .= '...';
        }

        return $description ?: 'Découvrez ce contenu intéressant sur le blog Hello Ludi !';
    }

    /**
     * Génère les hashtags selon la catégorie de l'article
     */
    private function generateHashtags(Post $post): string
    {
        $baseTag = 'helloludi';
        
        switch ($post->getCategory()) {
            case 'recipe':
                return $baseTag . ',recette,cuisine,cooking';
            case 'photo':
                return $baseTag . ',photo,voyage,travel';
            case 'event':
                return $baseTag . ',evenement,sortie';
            case 'blabla':
                return $baseTag . ',blog,actualite';
            default:
                return $baseTag . ',blog';
        }
    }

    /**
     * URLs spécifiques par plateforme
     */
    private function generateFacebookUrl(string $url): string
    {
        return 'https://www.facebook.com/sharer/sharer.php?' . http_build_query([
            'u' => $url
        ]);
    }

    private function generateTwitterUrl(string $title, string $url, string $hashtags): string
    {
        return 'https://twitter.com/intent/tweet?' . http_build_query([
            'text' => $title,
            'url' => $url,
            'hashtags' => $hashtags
        ]);
    }

    private function generateLinkedInUrl(string $url): string
    {
        return 'https://www.linkedin.com/sharing/share-offsite/?' . http_build_query([
            'url' => $url
        ]);
    }

    private function generatePinterestUrl(string $url, string $title): string
    {
        return 'https://pinterest.com/pin/create/button/?' . http_build_query([
            'url' => $url,
            'description' => $title
        ]);
    }

    private function generateWhatsAppUrl(string $title, string $url): string
    {
        return 'https://wa.me/?' . http_build_query([
            'text' => $title . ' ' . $url
        ]);
    }

    private function generateTelegramUrl(string $title, string $url): string
    {
        return 'https://t.me/share/url?' . http_build_query([
            'url' => $url,
            'text' => $title
        ]);
    }

    private function generateEmailUrl(string $title, string $description, string $url): string
    {
        return 'mailto:?' . http_build_query([
            'subject' => $title,
            'body' => $description . "\n\n" . $url
        ]);
    }

    private function generateRedditUrl(string $title, string $url): string
    {
        return 'https://reddit.com/submit?' . http_build_query([
            'url' => $url,
            'title' => $title
        ]);
    }

    /**
     * Génère les métadonnées Open Graph pour un article
     */
    public function generateOpenGraphData(Post $post): array
    {
        $url = $this->generatePostUrl($post);
        $description = $this->generateDescription($post);
        
        return [
            'og:title' => $post->getTitle(),
            'og:description' => $description,
            'og:url' => $url,
            'og:type' => 'article',
            'og:site_name' => 'Hello Ludi - Blog',
            'og:image' => $post->getImage() ? 
                $this->generateImageUrl($post->getImage()) : 
                $this->getDefaultSocialImage(),
            'article:author' => $post->getUser() ? $post->getUser()->getPseudo() : 'Hello Ludi',
            'article:published_time' => $post->getCreationDate()->format('c'),
            'article:modified_time' => $post->getUpdateDate() ? $post->getUpdateDate()->format('c') : null,
            'article:section' => $this->getCategoryDisplayName($post->getCategory()),
            'twitter:card' => 'summary_large_image',
            'twitter:site' => '@helloludi_blog',
            'twitter:title' => $post->getTitle(),
            'twitter:description' => $description,
            'twitter:image' => $post->getImage() ? 
                $this->generateImageUrl($post->getImage()) : 
                $this->getDefaultSocialImage(),
        ];
    }

    /**
     * Génère l'URL complète d'une image
     */
    private function generateImageUrl(string $imagePath): string
    {
        $request = $this->requestStack->getCurrentRequest();
        if ($request) {
            return $request->getSchemeAndHttpHost() . '/' . ltrim($imagePath, '/');
        }
        
        return $imagePath;
    }

    /**
     * Retourne l'image par défaut pour le partage social
     */
    private function getDefaultSocialImage(): string
    {
        $request = $this->requestStack->getCurrentRequest();
        $defaultImage = '/img/social-share-default.svg'; // Image SVG créée
        
        if ($request) {
            return $request->getSchemeAndHttpHost() . $defaultImage;
        }
        
        return $defaultImage;
    }

    /**
     * Convertit la catégorie en nom d'affichage
     */
    private function getCategoryDisplayName(string $category): string
    {
        return match ($category) {
            'recipe' => 'Recettes',
            'photo' => 'Photos',
            'event' => 'Événements',
            'blabla' => 'Actualités',
            default => 'Blog'
        };
    }

    /**
     * Génère les données structurées JSON-LD pour le SEO
     */
    public function generateJsonLdData(Post $post): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $post->getTitle(),
            'description' => $this->generateDescription($post),
            'image' => $post->getImage() ? $this->generateImageUrl($post->getImage()) : null,
            'author' => [
                '@type' => 'Person',
                'name' => $post->getUser() ? $post->getUser()->getPseudo() : 'Hello Ludi'
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => 'Hello Ludi',
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => $this->getDefaultSocialImage()
                ]
            ],
            'datePublished' => $post->getCreationDate()->format('c'),
            'dateModified' => $post->getUpdateDate() ? $post->getUpdateDate()->format('c') : $post->getCreationDate()->format('c'),
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => $this->generatePostUrl($post)
            ],
            'articleSection' => $this->getCategoryDisplayName($post->getCategory()),
        ];
    }
}
