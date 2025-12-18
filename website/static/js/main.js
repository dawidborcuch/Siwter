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
    
    // Contact/quote form is handled server-side (Django POST) now

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

    // Reveal animations on scroll (IntersectionObserver)
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));

    if (!prefersReduced && revealEls.length > 0 && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

        revealEls.forEach((el) => io.observe(el));
    } else {
        // fallback: show immediately
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    // Gallery lightbox (click to open full size)
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;
    const lightboxClose = lightbox ? lightbox.querySelector('.lightbox__close') : null;

    const closeLightbox = () => {
        if (!lightbox || !lightboxImg) return;
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImg.removeAttribute('src');
    };

    if (lightbox && lightboxImg && lightboxClose) {
        document.addEventListener('click', (e) => {
            const link = e.target && e.target.closest ? e.target.closest('.gallery-link') : null;
            if (link) {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (!href) return;
                lightboxImg.setAttribute('src', href);
                lightbox.classList.add('is-open');
                lightbox.setAttribute('aria-hidden', 'false');
                return;
            }

            // click outside image closes
            if (e.target === lightbox) closeLightbox();
        });

        lightboxClose.addEventListener('click', closeLightbox);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    // Breadcrumb depth for Oferta sections (hash-based)
    const offerSectionEl = document.querySelector('.breadcrumb__section');
    const offerSepEl = document.querySelector('.breadcrumb__sep--section');
    if (offerSectionEl && offerSepEl) {
        const map = {
            '#murarskie': 'Prace murarsko – wyburzeniowe',
            '#gipsy': 'Gipsy, malowanie',
            '#montaz': 'Prace montażowe',
            '#podlogi': 'Podłogi',
            '#glazura': 'Glazura, terakota',
            '#instalacje': 'Instalacje wod.-kan., biały montaż, obudowy',
            '#elektryczne': 'Instalacje elektryczne',
        };

        const updateOfferBreadcrumb = () => {
            const h = window.location.hash || '';
            const label = map[h];
            if (label) {
                offerSectionEl.textContent = label;
                offerSectionEl.hidden = false;
                offerSepEl.style.display = '';
            } else {
                offerSectionEl.textContent = '';
                offerSectionEl.hidden = true;
                offerSepEl.style.display = 'none';
            }
        };

        updateOfferBreadcrumb();
        window.addEventListener('hashchange', updateOfferBreadcrumb);
    }
});

