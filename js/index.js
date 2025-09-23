/**
 * Carousel infini avec défilement automatique
 * Les cartes se déplacent automatiquement et en boucle infinie
 */

document.addEventListener('DOMContentLoaded', function() {
    const scrollContainer = document.querySelector('.scrollbar');
    const cardsContainer = document.querySelector('.cards');
    
    if (!scrollContainer || !cardsContainer) return;
    
    // Configuration
    const CONFIG = {
        autoScrollSpeed: 0.8, // Vitesse de défilement (pixels par frame)
        pauseOnHover: true, // Pause au survol
        duplicateCount: 3, // Nombre de duplications des cartes pour fluidité
        transitionDuration: 0, // Pas de transition pour un mouvement fluide
        resetThreshold: 0.8 // Seuil pour réinitialiser la position (80% du scroll)
    };
    
    let isAutoScrolling = true;
    let animationFrame;
    let isPaused = false;
    
    // Fonction pour dupliquer les cartes et créer l'effet infini
    function createInfiniteLoop() {
        const originalCards = Array.from(cardsContainer.children);
        const cardCount = originalCards.length;
        
        // Dupliquer les cartes plusieurs fois pour un effet infini fluide
        for (let i = 0; i < CONFIG.duplicateCount; i++) {
            originalCards.forEach(card => {
                const clone = card.cloneNode(true);
                clone.classList.add('cloned-card');
                cardsContainer.appendChild(clone);
            });
        }
        
        // Ajouter quelques cartes au début pour un démarrage fluide
        originalCards.slice().reverse().forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('cloned-card');
            cardsContainer.insertBefore(clone, cardsContainer.firstChild);
        });
        
        console.log(`✅ ${cardCount} cartes originales dupliquées pour l'effet infini`);
    }
    
    // REFACTORED: Slider infini toujours vers l'avant basé sur translateX
    // On garde l'ancienne logique plus bas si besoin de rollback, mais on ajoute une nouvelle implémentation plus fiable
    
    // ===================== SLIDER INFINI (version contrôlée) =====================
    // Refactor précédent conservé. Ci‑dessous : version sans interaction utilisateur.
    (function() {
        const wrapper = document.querySelector('.scrollbar');
        const track = document.querySelector('.cards');
        if(!wrapper || !track) return;
    
        // Empêcher tout scroll natif dans la zone du slider
        wrapper.style.overflow = 'hidden';
        wrapper.addEventListener('wheel', e => { e.preventDefault(); }, { passive:false });
        wrapper.addEventListener('touchmove', e => { e.preventDefault(); }, { passive:false });
    
        // Désactiver la sélection / drag
        wrapper.style.userSelect = 'none';
        wrapper.style.cursor = 'default';
    
        // Récupérer les cartes originales
        const originalCards = Array.from(track.children);
        if (originalCards.length === 0) return;
    
        // Forcer le layout nécessaire
        track.style.display = 'flex';
        track.style.flexWrap = 'nowrap';
        track.style.willChange = 'transform';
        track.style.backfaceVisibility = 'hidden';
    
        // Calcul du gap réel
        let gapPx = 24;
        const trackStyles = getComputedStyle(track);
        const declaredGap = parseFloat(trackStyles.gap || trackStyles.columnGap || '24');
        if(!isNaN(declaredGap)) gapPx = declaredGap;
    
        // Ajouter une seconde série pour la boucle
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('clone');
            track.appendChild(clone);
        });
    
        // Mesure de la largeur cumulée des cartes originales
        function measureCycleWidth() {
            return originalCards.reduce((acc, el) => acc + el.getBoundingClientRect().width + gapPx, 0);
        }
        let cycleWidth = measureCycleWidth();
        window.addEventListener('resize', () => { cycleWidth = measureCycleWidth(); });
    
        // Animation auto (toujours vers l'avant)
        let x = 0;
        const BASE_SPEED = 0.5; // ajuster ici la vitesse
    
        function loop() {
            x -= BASE_SPEED; // déplacement vers la gauche
            if (Math.abs(x) >= cycleWidth) {
                // Replacer sans flash: conserver surplus éventuel
                x += cycleWidth;
            }
            track.style.transform = `translateX(${x}px)`;
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    
        // Bloquer les interactions clavier qui pourraient scroller la page quand focus dans la zone
        wrapper.setAttribute('tabindex','-1');
        wrapper.addEventListener('keydown', e => {
            const keysToBlock = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','PageDown','PageUp','Home','End'];
            if(keysToBlock.includes(e.code)) e.preventDefault();
        });
    
        // Option : empêcher scroll page quand souris sur le slider (vertical aussi)
        const blockWheel = e => { e.preventDefault(); };
        wrapper.addEventListener('mouseenter', () => {
            window.addEventListener('wheel', blockWheel, { passive:false });
        });
        wrapper.addEventListener('mouseleave', () => {
            window.removeEventListener('wheel', blockWheel, { passive:false });
        });
    
        // Retirer les anciens écouteurs potentiels (défensif) si le code précédent est encore chargé
        // Impossible d'enlever précisément sans références; on neutralise via pointer-events
        track.style.pointerEvents = 'none';
    })();
    // ================== FIN SLIDER INFINI SANS INTERACTION ==================
    
    // Nettoyage à la fermeture
    window.addEventListener('beforeunload', () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    });
    
    // Lancer l'initialisation
    init();
});
