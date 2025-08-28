<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Post;
use App\Entity\PostImage;
use App\Entity\Rating;
use App\Entity\User;
use App\Form\CommentType;
use App\Form\RatingType;
use App\Repository\PostRepository;
use App\Form\PostType;
use App\Service\ImageUploadService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;

class PostController extends AbstractController
{
    #[Route('/', name: 'homepage')]
    public function indexAction(Request $request, PostRepository $postRepository)
    {
        $posts = $postRepository->find8LastPosts();
        $eventsPosts = $postRepository->findByCategory("event");
        return $this->render('home.html.twig', [
            'posts' => $posts,
            "eventsPosts" => $eventsPosts,
        ]);
    }

    #[Route('/posts/unpublished', name: 'posts_unpublished')]
    public function unpublishedAction(Request $request, PostRepository $postRepository)
    {
        $posts = $postRepository->findUnpublishedPosts();
        $eventsPosts = $postRepository->findByCategory("event");
        return $this->render('home.html.twig', [
            'posts' => $posts,
            "eventsPosts" => $eventsPosts,
        ]);
    }

    #[Route('/recipes', name: 'recipes')]
    public function recipesAction(PostRepository $postRepository)
    {
        $posts = $postRepository->findByCategory("recipe");
        $eventsPosts = $postRepository->findByCategory("event");
        return $this->render('home.html.twig', [
            'posts' => $posts,
            "eventsPosts" => $eventsPosts
        ]);
    }

    #[Route('/events', name: 'events')]
    public function eventsAction(PostRepository $postRepository)
    {
        $posts = $postRepository->findByCategory("event");
        $eventsPosts = $postRepository->findByCategory("event");
        return $this->render('home.html.twig', [
            'posts' => $posts,
            "eventsPosts" => $eventsPosts
        ]);
    }

    #[Route('/photos', name: 'photos')]
    public function photosAction(PostRepository $postRepository)
    {
        $posts = $postRepository->findByCategory("photo");
        $eventsPosts = $postRepository->findByCategory("event");
        return $this->render('home.html.twig', [
            'posts' => $posts,
            "eventsPosts" => $eventsPosts
        ]);
    }

    #[Route('/blabla', name: 'blabla')]
    public function blablaAction(PostRepository $postRepository)
    {
        $posts = $postRepository->findByCategory("blabla");
        $eventsPosts = $postRepository->findByCategory("event");
        return $this->render('home.html.twig', [
            'posts' => $posts,
            "eventsPosts" => $eventsPosts
        ]);
    }

    #[Route('/post/create', name: 'post_create')]
    public function create(Request $request, EntityManagerInterface $em, ImageUploadService $imageUploadService)
    {
        $post = new Post();
        $form = $this->createForm(PostType::class, $post);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Vérification de la taille du contenu
            $contentLength = strlen($form->get('content')->getData() ?? '');
            if ($contentLength > 8000000) { // ~8MB limite
                $this->addFlash('error', 'Le contenu de votre article est trop volumineux. Veuillez le réduire.');
                $eventsPosts = $em->getRepository(Post::class)->findByCategory("event");
                return $this->render('post/create.html.twig', [
                    'form' => $form->createView(),
                    'eventsPosts' => $eventsPosts
                ]);
            }
            
            $post->setContent($form->get('content')->getData());
            
            // Gestion des champs spécifiques selon la catégorie
            if ($form->get('category')->getData() === "event") {
                $post->setDate($form->get('date')->getData());
                $post->setPlace($form->get('place')->getData());
            } elseif ($form->get('category')->getData() === "recipe") {
                $post->setPersonsNumber($form->get('personsNumber')->getData());
                $post->setCookingTime($form->get('cookingTime')->getData());
            } else {
                $post->setDate(null);
                $post->setPlace(null);
                $post->setPersonsNumber(null);
                $post->setCookingTime(null);
            }
            
            $post->setUser($this->getUser());
            $post->setCreationDate(new \DateTime());
            $post->setCategory($form->get('category')->getData());

            // Gestion de l'image à la une
            /** @var UploadedFile $file */
            $file = $form->get('image')->getData();

            if ($file) {
                $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $newFilename = $originalFilename.'-'.uniqid().'.'.$file->guessExtension();

                $destination = $this->getParameter('images_directory');
                $file->move($destination, $newFilename);

                $post->setImage("img/posts/" . $newFilename);
            }

            // Persist du post d'abord pour avoir un ID
            $em->persist($post);
            $em->flush();

            // Gestion des images de galerie pour la catégorie "photo"
            if ($form->get('category')->getData() === "photo") {
                $galleryImages = $form->get('galleryImages')->getData();
                
                if ($galleryImages) {
                    $uploadedCount = $imageUploadService->uploadMultipleImages($galleryImages, $post);
                    
                    if ($uploadedCount > 0) {
                        $this->addFlash('success', sprintf('%d image(s) uploadée(s) avec succès dans la galerie.', $uploadedCount));
                        $em->flush(); // Sauvegarder les images de galerie
                    }
                }
            }

            $this->addFlash('success', 'Article créé avec succès');
            return $this->redirectToRoute('post_detail', ["post" => $post->getId()]);
        }
        
        $eventsPosts = $em->getRepository(Post::class)->findByCategory("event");
        return $this->render('post/create.html.twig', [
            'form' => $form->createView(),
            'eventsPosts' => $eventsPosts
        ]);
    }

    #[Route('/post/{post}', name: 'post_detail')]
    public function detail(
        Request $request,
        Post $post,
        Security $security,
        EntityManagerInterface $em,
        FormFactoryInterface $formFactory
    ){
        $comment = new Comment();
        $form = $formFactory->create(CommentType::class, $comment, [
            'action' => $this->generateUrl('post_add_comment', ['post' => $post->getId()]),
            'method' => 'POST',
        ]);

        $replyForms = [];

        $comments = $post->getComments();
        foreach ($comments as $singleComment) {
            $reply = new Comment();
            $reply->setParent($singleComment);
            $replyForms[$singleComment->getId()] = $this->createForm(CommentType::class, $reply, [
                'action' => $this->generateUrl('post_add_reply', ['comment' => $singleComment->getId()]),
                'method' => 'POST',
            ]);
        }

        $comments = $em->getRepository(Comment::class)->findBy(
            [
                'post' => $post,
                'parent' => null
            ],
            ['creationDate' => 'DESC']
        );

        $user = $security->getUser();
        $userRated = false;
        $userRating = null;

        if ($user) {
            $rating = $em->getRepository(Rating::class)
                ->findOneBy(['user' => $user, 'post' => $post]);

            if ($rating) {
                $userRated = true;
                $userRating = $rating->getRating();
            }
        }

        $ratingForm = $this->createForm(RatingType::class);
        $ratingForm->handleRequest($request);
        if ($ratingForm->isSubmitted() && $ratingForm->isValid()) {
            $rating = $ratingForm->get('rating')->getData();
            $post->addRating($rating);
            $em->flush();

            $this->addFlash('success', 'Merci pour votre vote !');
        }

        $eventsPosts = $em->getRepository(Post::class)->findByCategory("event");
        return $this->render('post/detail.html.twig', [
            'post' => $post,
            'eventsPosts' => $eventsPosts,
            'form' =>$form,
            'replyForms' => array_map(fn($form) => $form->createView(), $replyForms),
            'comments' => $comments,
            'ratingForm' => $ratingForm->createView(),
            'userRated' => $userRated,
            'userRating' => $userRating,
        ]);
    }

    #[Route('/post/{post}/edit', name: 'post_edit')]
    public function edit(Request $request, Post $post, EntityManagerInterface $em, ImageUploadService $imageUploadService)
    {
        $form = $this->createForm(PostType::class, $post);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Vérification de la taille du contenu
            $contentLength = strlen($form->get('content')->getData() ?? '');
            if ($contentLength > 8000000) { // ~8MB limite
                $this->addFlash('error', 'Le contenu de votre article est trop volumineux. Veuillez le réduire.');
                $eventsPosts = $em->getRepository(Post::class)->findByCategory("event");
                return $this->render('post/edit.html.twig', [
                    'form' => $form->createView(),
                    'post' => $post,
                    'eventsPosts' => $eventsPosts
                ]);
            }
            
            $post->setUpdateDate(new \DateTime());
            
            // Gestion de l'image à la une
            /** @var UploadedFile $file */
            $file = $form->get('image')->getData();

            if ($file) {
                $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $newFilename = $originalFilename.'-'.uniqid().'.'.$file->guessExtension();

                $destination = $this->getParameter('images_directory');
                $file->move($destination, $newFilename);

                $post->setImage("img/posts/" . $newFilename);
            }

            // Gestion des images de galerie pour la catégorie "photo"
            if ($form->get('category')->getData() === "photo") {
                $galleryImages = $form->get('galleryImages')->getData();
                
                if ($galleryImages) {
                    $uploadedCount = $imageUploadService->uploadMultipleImages($galleryImages, $post);
                    
                    if ($uploadedCount > 0) {
                        $this->addFlash('success', sprintf('%d nouvelle(s) image(s) ajoutée(s) à la galerie.', $uploadedCount));
                    }
                }
            }

            $em->flush();
            $this->addFlash('success', 'Article modifié avec succès');
            return $this->redirectToRoute('post_edit', ['post' => $post->getId()]);
        }

        $eventsPosts = $em->getRepository(Post::class)->findByCategory("event");
        return $this->render('post/edit.html.twig', [
            'form' => $form->createView(),
            'post' => $post,
            'eventsPosts' => $eventsPosts
        ]);
    }

    #[Route('/post/{post}/delete', name: 'post_delete')]
    public function delete(Post $post, EntityManagerInterface $em, ImageUploadService $imageUploadService)
    {
        // Supprimer les fichiers images de galerie du système de fichiers
        $imageUploadService->deleteAllPostImages($post);
        
        $em->remove($post);
        $em->flush();

        $this->addFlash('success', 'Article supprimé avec succès.');
        return $this->redirectToRoute('homepage');
    }

    #[Route('/post/{post}/gallery-image/{imageId}/delete', name: 'post_gallery_image_delete', methods: ['POST'])]
    public function deleteGalleryImage(Post $post, int $imageId, EntityManagerInterface $em, ImageUploadService $imageUploadService): JsonResponse
    {
        $postImage = $em->getRepository(PostImage::class)->find($imageId);
        
        if (!$postImage || $postImage->getPost() !== $post) {
            return new JsonResponse(['success' => false, 'message' => 'Image non trouvée.'], 404);
        }

        // Supprimer le fichier du système de fichiers
        $imageUploadService->deleteImageFile($postImage->getFilename());
        
        // Supprimer de la base de données
        $em->remove($postImage);
        $em->flush();

        return new JsonResponse(['success' => true, 'message' => 'Image supprimée avec succès.']);
    }

    #[Route('/post/{post}/publish', name: 'post_publish')]
    public function publish(Post $post, EntityManagerInterface $em)
    {
        $post->setOnLine(true);
        $em->flush();

        $this->addFlash('success', 'Article publié avec succès.');
        return $this->redirectToRoute('homepage');
    }

    #[Route('/upload_image', name: 'upload_image', methods: ["POST"])]
    public function uploadImage(Request $request): JsonResponse
    {
        try {
            // Vérifier la taille totale de la requête
            $contentLength = $request->headers->get('Content-Length');
            if ($contentLength && $contentLength > 20 * 1024 * 1024) { // 20MB limite
                return new JsonResponse([
                    'error' => 'La requête est trop volumineuse (max 20MB)'
                ], 413);
            }
            
            // Log pour déboguer
            error_log('Upload request received');

            $file = $request->files->get('file');

            if (!$file) {
                return new JsonResponse([
                    'error' => 'Aucun fichier reçu'
                ], 400);
            }

            if (!$file instanceof UploadedFile) {
                return new JsonResponse([
                    'error' => 'Fichier invalide'
                ], 400);
            }

            // Vérifier le type MIME
            $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($file->getMimeType(), $allowedMimeTypes)) {
                return new JsonResponse([
                    'error' => 'Type de fichier non autorisé. Formats acceptés : JPG, PNG, GIF, WebP'
                ], 400);
            }

            // Vérifier la taille (10MB max pour l'upload d'images)
            if ($file->getSize() > 10 * 1024 * 1024) {
                return new JsonResponse([
                    'error' => 'Le fichier est trop volumineux (max 10MB)'
                ], 400);
            }

            // Générer un nom unique
            $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = transliterator_transliterate('Any-Latin; Latin-ASCII; [^A-Za-z0-9_] remove; Lower()', $originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();

            // Déplacer le fichier
            try {
                $destination = $this->getParameter('kernel.project_dir') . '/public/img/posts';

                // Créer le dossier s'il n'existe pas
                if (!is_dir($destination)) {
                    mkdir($destination, 0777, true);
                }

                $file->move($destination, $newFilename);

                // Retourner l'URL
                $url = '/img/posts/' . $newFilename;

                return new JsonResponse([
                    'link' => $url
                ]);

            } catch (FileException $e) {
                error_log('File upload error: ' . $e->getMessage());
                return new JsonResponse([
                    'error' => 'Erreur lors de l\'enregistrement du fichier'
                ], 500);
            }

        } catch (\Exception $e) {
            error_log('Upload exception: ' . $e->getMessage());
            
            // Gestion spécifique des erreurs de taille
            if (strpos($e->getMessage(), 'Content-Length') !== false || 
                strpos($e->getMessage(), 'post_max_size') !== false) {
                return new JsonResponse([
                    'error' => 'Le fichier ou le contenu est trop volumineux. Veuillez réduire la taille.'
                ], 413);
            }
            
            return new JsonResponse([
                'error' => 'Erreur serveur: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/post/{post}/user/{user}/like', name: 'post_like')]
    public function like(Request $request, Post $post, User $user, EntityManagerInterface $em)
    {
        $likes = $post->getLikes();
        $likes[] = $user->getid();
        $post->setLikes($likes);
        $em->flush();

        return $this->redirectToRoute('post_detail', ['post' => $post->getId()]);
    }

    #[Route('/post/{post}/add-comment', name: 'post_add_comment', methods: ['POST'])]
    public function addComment(Request $request, Post $post, EntityManagerInterface $em)
    {
        // Nouveau commentaire
        $comment = new Comment();
        $form = $this->createForm(CommentType::class, $comment);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            // Vérification de l'existence d'un parent (optionnel pour les réponses)
            $parentId = $request->request->all('comment')['parent'] ?? null;
            if ($parentId) {
                $parent = $em->getRepository(Comment::class)->find($parentId);
                if ($parent) {
                    $comment->setParent($parent);
                } else {
                    $this->addFlash('error', 'Le commentaire parent est introuvable.');
                    return $this->redirectToRoute('post_detail', ['post' => $post->getId()]);
                }
            }

            // Attribution des propriétés
            $comment->setPost($post);
            $comment->setCreationDate(new \DateTime());
            $comment->setPseudo($form->get('pseudo')->getData());
            $comment->setContent($form->get('content')->getData());

            // Persistance en base
            $em->persist($comment);
            $em->flush();

            $this->addFlash('success', 'Commentaire ajouté avec succès.');
        } else {
            $this->addFlash('error', 'Erreur lors de l\'ajout du commentaire.');
        }

        return $this->redirectToRoute('post_detail', [
            'post' => $post->getId(),
        ]);
    }

    #[Route('/comment/{comment}/reply', name: 'post_add_reply')]
    public function addReply(Request $request, Comment $comment, EntityManagerInterface $em)
    {
        $parentId = $comment->getid();
        $post = $comment->getPost();
        if (!$parentId) {
            $this->addFlash('error', 'Aucun commentaire parent spécifié.');
            return $this->redirectToRoute('post_detail', ['post' => $post->getId()]);
        }

        $parent = $em->getRepository(Comment::class)->find($parentId);
        if (!$parent) {
            $this->addFlash('error', 'Le commentaire parent est introuvable.');
            return $this->redirectToRoute('post_detail', ['post' => $post->getId()]);
        }

        // Création d'un nouveau commentaire de type réponse
        $reply = new Comment();
        $form = $this->createForm(CommentType::class, $reply);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $reply->setPost($post);
            $reply->setPseudo($form->get('pseudo')->getData());
            $reply->setCreationDate(new \DateTime());
            $reply->setParent($parent);
            $reply->setContent($form->get('content')->getData());

            $em->persist($reply);
            $em->flush();

            $this->addFlash('success', 'Réponse ajoutée avec succès.');
            return $this->redirectToRoute('post_detail', ['post' => $post->getId()]);
        }

        // En cas d'erreur
        $this->addFlash('error', 'Erreur lors de l\'ajout de la réponse.');
        return $this->redirectToRoute('post_detail', ['post' => $post->getId()]);
    }

    #[Route('/post/{post}/rate', name: 'post_rate', methods: ['POST'])]
    public function rateAjax(
        Post $post,
        Request $request,
        EntityManagerInterface $entityManager,
        CsrfTokenManagerInterface $csrfTokenManager
    ): JsonResponse {

        $csrfToken = $request->headers->get('X-CSRF-TOKEN');
        if (!$csrfTokenManager->isTokenValid(new CsrfToken('rate', $csrfToken))) {
            return new JsonResponse(['error' => 'Invalid CSRF token'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $cookie = $request->cookies->get('voted_posts');
        $votedPosts = $cookie ? json_decode($cookie, true) : [];
        if (!is_array($votedPosts)) {
            $votedPosts = [];
        }

        if (in_array($post->getId(), $votedPosts)) {
            return new JsonResponse(['success' => false, 'message' => 'Vous avez déjà voté pour cette recette.'], 400);
        }

        if (isset($data['rating']) && is_numeric($data['rating'])) {
            $rating = new Rating();
            $rating->setRating((float) $data['rating']);
            $rating->setPost($post);
            $rating->setUser($this->getUser());
            $entityManager->persist($rating);

            if ($rating->getRating() >= 1 && $rating->getRating() <= 5) {
                $post->addRating($rating);
                $post->setRatingCount($post->getRatingCount() + 1);
                $ratings = $post->getRatings();
                $totalResult = 0;
                foreach ($ratings as $vote){
                    $totalResult += $vote->getRating();
                }
                $post->setAverageRating($totalResult / count($ratings));
                $entityManager->flush();

                // Ajoute le post dans les cookies
                $votedPosts[] = $post->getId();

                $response = new JsonResponse(['status' => "success", 'message' => 'Note enregistrée avec succès !']);
                
                // Créer le cookie avec les bonnes options
                $cookie = Cookie::create(
                    'voted_posts',
                    json_encode($votedPosts),
                    time() + (365 * 24 * 60 * 60), // 1 an
                    '/', // path
                    null, // domain
                    null, // secure (laissé null pour utiliser cookie_secure: auto)
                    true, // httpOnly
                    false, // raw
                    null // sameSite (laissé null pour la valeur par défaut)
                );
                
                $response->headers->setCookie($cookie);
                return $response;
            }
        }

        return new JsonResponse(['status' => "failed", 'message' => 'Données invalides.'], 400);
    }
}
