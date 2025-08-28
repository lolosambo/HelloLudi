// Script ultra-simple pour la modale de galerie

document.addEventListener('DOMContentLoaded', function() {
    console.log('📸 Script galerie chargé');
    
    // Trouver toutes les images de galerie
    const galleryImages = document.querySelectorAll('.gallery-image');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = modal ? modal.querySelector('.btn-close') : null;
    
    console.log('📸 Images trouvées:', galleryImages.length);
    console.log('📸 Modale trouvée:', !!modal);
    
    if (!modal || !modalImg) {
        console.error('❌ Éléments modale manquants');
        return;
    }
    
    // Fonction pour ouvrir la modale
    function openModal(imageSrc, imageAlt) {
        console.log('📸 Ouverture modale:', imageSrc);
        modalImg.src = imageSrc;
        modalImg.alt = imageAlt || 'Image';
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    // Fonction pour fermer la modale
    function closeModal() {
        console.log('📸 Fermeture modale');
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
    
    // Ajouter des événements de clic sur chaque image
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('📸 Clic image', index + 1);
            const src = this.getAttribute('data-image-src') || this.src;
            const alt = this.getAttribute('data-image-alt') || this.alt;
            openModal(src, alt);
        });
    });
    
    // Fermeture avec le bouton X
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Fermeture avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
    
    // Fermeture en cliquant en dehors de l'image
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    console.log('✅ Script galerie initialisé');
});
