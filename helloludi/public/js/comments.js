/**
 * Système d'interactions et animations pour les commentaires
 */

document.addEventListener('DOMContentLoaded', function() {

    // Animations d'apparition progressive des commentaires
    const animateComments = () => {
        const comments = document.querySelectorAll('.comment');
        comments.forEach((comment, index) => {
            comment.style.opacity = '0';
            comment.style.transform = 'translateX(-50px)';

            setTimeout(() => {
                comment.style.transition = 'all 0.6s ease';
                comment.style.opacity = '1';
                comment.style.transform = 'translateX(0)';
            }, index * 150);
        });
    };

    // Effet de survol sur les avatars
    const addAvatarEffects = () => {
        const avatars = document.querySelectorAll('.comment-avatar, .reply-avatar');

        avatars.forEach(avatar => {
            avatar.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.2) rotate(10deg)';
            });

            avatar.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) rotate(0deg)';
            });

            // Ajout d'un effet de clic
            avatar.addEventListener('click', function() {
                this.style.animation = 'bounce 0.5s ease';
                setTimeout(() => {
                    this.style.animation = '';
                }, 500);
            });
        });
    };

    // Compteur de caractères pour les formulaires
    const addCharacterCounter = () => {
        const textareas = document.querySelectorAll('textarea[name*="content"]');

        textareas.forEach(textarea => {
            const maxLength = 500;
            const wrapper = textarea.parentElement;

            // Créer le compteur
            const counter = document.createElement('div');
            counter.className = 'character-counter';
            counter.style.cssText = `
                text-align: right;
                font-size: 0.85rem;
                color: #7f8c8d;
                margin-top: 0.5rem;
                transition: color 0.3s ease;
            `;

            const updateCounter = () => {
                const remaining = maxLength - textarea.value.length;
                counter.textContent = `${remaining} caractères restants`;

                if (remaining < 50) {
                    counter.style.color = '#e74c3c';
                } else if (remaining < 100) {
                    counter.style.color = '#f39c12';
                } else {
                    counter.style.color = '#27ae60';
                }
            };

            textarea.addEventListener('input', updateCounter);
            wrapper.appendChild(counter);
            updateCounter();
        });
    };

    // Effet de like/reaction sur les commentaires
    const addReactionSystem = () => {
        const comments = document.querySelectorAll('.comment-content');

        comments.forEach(comment => {
            if (!comment.querySelector('.reactions')) {
                const reactionsDiv = document.createElement('div');
                reactionsDiv.className = 'reactions';
                reactionsDiv.style.cssText = `
                    margin-top: 1rem;
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                `;

                const reactions = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

                reactions.forEach(emoji => {
                    const button = document.createElement('button');
                    button.className = 'reaction-btn';
                    button.innerHTML = `${emoji} <span class="count">0</span>`;
                    button.style.cssText = `
                        background: #ecf0f1;
                        border: none;
                        border-radius: 20px;
                        padding: 0.4rem 0.8rem;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 0.3rem;
                    `;

                    button.addEventListener('click', function() {
                        const count = this.querySelector('.count');
                        let currentCount = parseInt(count.textContent);

                        if (this.classList.contains('active')) {
                            currentCount--;
                            this.classList.remove('active');
                            this.style.background = '#ecf0f1';
                            this.style.transform = 'scale(1)';
                        } else {
                            currentCount++;
                            this.classList.add('active');
                            this.style.background = '#3498db';
                            this.style.color = 'white';
                            this.style.transform = 'scale(1.1)';

                            // Animation de particules
                            createParticles(this, emoji);
                        }

                        count.textContent = currentCount;
                    });

                    button.addEventListener('mouseenter', function() {
                        if (!this.classList.contains('active')) {
                            this.style.background = '#d5dbdb';
                            this.style.transform = 'scale(1.05)';
                        }
                    });

                    button.addEventListener('mouseleave', function() {
                        if (!this.classList.contains('active')) {
                            this.style.background = '#ecf0f1';
                            this.style.transform = 'scale(1)';
                        }
                    });

                    reactionsDiv.appendChild(button);
                });

                comment.appendChild(reactionsDiv);
            }
        });
    };

    // Création de particules lors d'une réaction
    const createParticles = (button, emoji) => {
        const rect = button.getBoundingClientRect();

        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.textContent = emoji;
            particle.style.cssText = `
                position: fixed;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                font-size: 1.5rem;
                pointer-events: none;
                z-index: 9999;
                animation: particleFly 1s ease forwards;
            `;

            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    };

    // Ajouter le CSS pour l'animation des particules
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particleFly {
            0% {
                opacity: 1;
                transform: translate(0, 0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(${Math.random() * 100 - 50}px, -100px) scale(0.5);
            }
        }
        
        .reaction-btn .count {
            font-size: 0.85rem;
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);

    // Bouton flottant pour ajouter un commentaire
    const addFloatingButton = () => {
        if (!document.querySelector('.btn-add-comment')) {
            const button = document.createElement('button');
            button.className = 'btn-add-comment';
            button.innerHTML = '<i class="bi bi-chat-dots-fill"></i>';
            button.setAttribute('data-bs-toggle', 'modal');
            button.setAttribute('data-bs-target', '#commentModal');

            document.body.appendChild(button);

            // Effet de pulsation au survol
            button.addEventListener('mouseenter', function() {
                this.style.animation = 'pulse 0.5s ease infinite';
            });

            button.addEventListener('mouseleave', function() {
                this.style.animation = '';
            });
        }
    };

    // Notification de nouveau commentaire
    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.className = 'comment-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #27ae60, #229954);
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(39, 174, 96, 0.4);
            z-index: 9999;
            animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 3s forwards;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3500);
    };

    // Ajouter les animations CSS
    const addAnimationStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
        `;
        document.head.appendChild(style);
    };

    // Effet de typing pour les nouveaux commentaires
    const typewriterEffect = (element, text, speed = 50) => {
        element.textContent = '';
        let i = 0;

        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        };

        typeWriter();
    };

    // Initialisation
    animateComments();
    addAvatarEffects();
    addCharacterCounter();
    addReactionSystem();
    addFloatingButton();
    addAnimationStyles();

    // Observer pour les nouveaux commentaires ajoutés dynamiquement
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('comment')) {
                        // Animer le nouveau commentaire
                        node.style.opacity = '0';
                        node.style.transform = 'translateY(20px)';

                        setTimeout(() => {
                            node.style.transition = 'all 0.6s ease';
                            node.style.opacity = '1';
                            node.style.transform = 'translateY(0)';
                        }, 100);

                        // Afficher une notification
                        showNotification('Nouveau commentaire ajouté ! 🎉');
                    }
                });
            }
        });
    });

    const commentsSection = document.querySelector('.comments-section');
    if (commentsSection) {
        observer.observe(commentsSection, { childList: true, subtree: true });
    }
});

// Fonction pour améliorer l'UX des formulaires
function enhanceForms() {
    const forms = document.querySelectorAll('form[name*="comment"]');

    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Envoi en cours...';
                submitButton.disabled = true;
            }
        });
    });
}

// Appel de la fonction au chargement
document.addEventListener('DOMContentLoaded', enhanceForms);