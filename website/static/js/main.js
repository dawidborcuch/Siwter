// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.navigation');

    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('mobile-active');
            this.classList.toggle('active');
        });
    }

    // Place hero slider so its TOP starts at half the height of the menu tiles
    const updateHeroCarouselTop = () => {
        const header = document.querySelector('header.header');
        const slider = document.querySelector('.hero-carousel');
        const sliderViewport = document.querySelector('.hero-carousel__viewport');
        const firstMenuLink = document.querySelector('.navigation--main > li > a');
        if (!header || !slider || !firstMenuLink) return;

        const rHeader = header.getBoundingClientRect();
        const rLink = firstMenuLink.getBoundingClientRect();
        const half = rLink.height / 2;

        // target: slider top = middle of menu tile (relative to header)
        const topPx = Math.max(0, Math.round((rLink.top - rHeader.top) + half));
        header.style.setProperty('--hero-carousel-top', `${topPx}px`);

        // Push main content below the visible slider bottom (since slider is absolute)
        if (sliderViewport) {
            const rSlider = sliderViewport.getBoundingClientRect();
            const push = Math.max(0, Math.round(rSlider.bottom - rHeader.bottom));
            document.documentElement.style.setProperty('--hero-carousel-push', `${push}px`);
        }
    };

    updateHeroCarouselTop();
    window.addEventListener('resize', () => {
        window.clearTimeout(window.__siwterHeroTopT);
        window.__siwterHeroTopT = window.setTimeout(updateHeroCarouselTop, 100);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Form submission handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Dziękujemy za wiadomość! Skontaktujemy się z Państwem wkrótce.');
            this.reset();
        });
    }

    // Hero carousel
    const track = document.querySelector('[data-carousel-track]');
    const slides = track ? Array.from(track.querySelectorAll('[data-carousel-slide]')) : [];
    const btnPrev = document.querySelector('[data-carousel-prev]');
    const btnNext = document.querySelector('[data-carousel-next]');

    if (track && slides.length > 0 && btnPrev && btnNext) {
        let idx = 0;
        let timer = null;
        const INTERVAL_MS = 4000;

        const render = () => {
            track.style.transform = `translateX(-${idx * 100}%)`;
            slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
        };

        const next = () => {
            idx = (idx + 1) % slides.length;
            render();
        };

        const prev = () => {
            idx = (idx - 1 + slides.length) % slides.length;
            render();
        };

        const start = () => {
            stop();
            timer = window.setInterval(next, INTERVAL_MS);
        };

        const stop = () => {
            if (timer) window.clearInterval(timer);
            timer = null;
        };

        btnNext.addEventListener('click', () => {
            next();
            start();
        });

        btnPrev.addEventListener('click', () => {
            prev();
            start();
        });

        // Pause on hover (desktop)
        track.addEventListener('mouseenter', stop);
        track.addEventListener('mouseleave', start);

        // Initialize
        render();
        start();
    }
});

