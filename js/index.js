/**
 * Carousel infini avec défilement automatique
 * Les cartes se déplacent automatiquement et en boucle infinie
 */

document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.querySelector('.scrollbar');
    const cardsContainer = document.querySelector('.cards');
    
    if (!scrollContainer || !cardsContainer) return;
    
    // Configuration optimisée
    const CONFIG = Object.freeze({
        autoScrollSpeed: 0.8,
        pauseOnHover: true,
        duplicateCount: 3,
        transitionDuration: 0,
        resetThreshold: 0.8
    });
    
    let isAutoScrolling = true;
    let animationFrame = null;
    let isPaused = false;
    
    // Fonction optimisée pour dupliquer les cartes et créer l'effet infini
    const createInfiniteLoop = () => {
        const originalCards = [...cardsContainer.children];
        const cardCount = originalCards.length;
        const fragment = document.createDocumentFragment();
        
        // Dupliquer les cartes plusieurs fois pour un effet infini fluide
        for (let i = 0; i < CONFIG.duplicateCount; i++) {
            originalCards.forEach(card => {
                const clone = card.cloneNode(true);
                clone.classList.add('cloned-card');
                fragment.appendChild(clone);
            });
        }
        cardsContainer.appendChild(fragment);
        
        // Ajouter quelques cartes au début pour un démarrage fluide
        const startFragment = document.createDocumentFragment();
        originalCards.slice().reverse().forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('cloned-card');
            startFragment.appendChild(clone);
        });
        cardsContainer.insertBefore(startFragment, cardsContainer.firstChild);
        
        console.log(`✅ ${cardCount} cartes originales dupliquées pour l'effet infini`);
    };
    
    // Initialiser le carousel optimisé
    (() => {
        const wrapper = scrollContainer;
        const track = cardsContainer;
        if (!wrapper || !track) return;
    
        // Empêcher uniquement le scroll horizontal du slider
        wrapper.style.overflow = 'hidden';
        
        // Gestionnaire de scroll optimisé
        const handleWheel = (e) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.preventDefault();
            }
        };
        
        const handleTouchMove = (e) => e.preventDefault();
        
        wrapper.addEventListener('wheel', handleWheel, { passive: false });
        wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
    
        // Désactiver la sélection / drag
        wrapper.style.userSelect = 'none';
        wrapper.style.cursor = 'default';
    
        // Récupérer les cartes originales
        const originalCards = [...track.children];
        if (originalCards.length === 0) return;
    
        // Optimiser le layout avec Object.assign
        Object.assign(track.style, {
            display: 'flex',
            flexWrap: 'nowrap',
            willChange: 'transform',
            backfaceVisibility: 'hidden'
        });
    
        // Calcul optimisé du gap réel
        let gapPx = 24;
        const trackStyles = getComputedStyle(track);
        const declaredGap = parseFloat(trackStyles.gap || trackStyles.columnGap || '0');
        if (declaredGap > 0) gapPx = declaredGap;
    
        // Ajouter une seconde série pour la boucle avec fragment
        const cloneFragment = document.createDocumentFragment();
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('clone');
            cloneFragment.appendChild(clone);
        });
        track.appendChild(cloneFragment);
    
        // Mesure optimisée de la largeur cumulée des cartes originales
        const measureCycleWidth = () => {
            return originalCards.reduce((acc, el) => acc + el.getBoundingClientRect().width + gapPx, 0);
        };
        
        let cycleWidth = measureCycleWidth();
        const handleResize = () => { cycleWidth = measureCycleWidth(); };
        window.addEventListener('resize', handleResize, { passive: true });
    
        // Animation optimisée (toujours vers l'avant)
        let x = 0;
        const BASE_SPEED = 0.5;
    
        const loop = () => {
            x -= BASE_SPEED;
            if (Math.abs(x) >= cycleWidth) {
                x += cycleWidth;
            }
            track.style.transform = `translate3d(${x}px, 0, 0)`;
            animationFrame = requestAnimationFrame(loop);
        };
        animationFrame = requestAnimationFrame(loop);
    
        // Gestionnaire de clavier optimisé
        wrapper.setAttribute('tabindex', '-1');
        const keysToBlock = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'PageDown', 'PageUp', 'Home', 'End']);
        
        const handleKeydown = (e) => {
            if (keysToBlock.has(e.code)) e.preventDefault();
        };
        
        wrapper.addEventListener('keydown', handleKeydown);
        
        // Optimisation pointer-events
        track.style.pointerEvents = 'none';
    })();
    
    // Nettoyage optimisé à la fermeture
    const cleanup = () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    };
    
    window.addEventListener('beforeunload', cleanup, { once: true });
    
    // Nettoyage lors de la visibilité de la page
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    });
    
    // Note: init() function n'est pas définie, suppression de l'appel
});
