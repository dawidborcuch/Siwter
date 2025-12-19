// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Splash screen on homepage (logo for 1.5s, then reveal)
    const splash = document.querySelector('[data-splash]');
    if (splash) {
        document.body.classList.add('is-splash-active');
        window.setTimeout(() => {
            splash.classList.add('is-hidden');
            document.body.classList.remove('is-splash-active');
            window.setTimeout(() => splash.remove(), 500);
        }, 1000);
    }

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

    // Oferta breadcrumb is always 2-level now (no hash-based depth)

    // Scroll Progress Bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    const updateProgress = () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = `${scrolled}%`;
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress();

    // Scroll to Top Button
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.setAttribute('aria-label', 'Przewiń do góry');
    document.body.appendChild(scrollToTopBtn);

    const toggleScrollToTop = () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    };

    window.addEventListener('scroll', toggleScrollToTop);
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Animated Counters
    const animateCounter = (el, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.textContent = Math.round(target);
                clearInterval(timer);
            } else {
                el.textContent = Math.round(current);
            }
        }, 16);
    };

    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    const target = parseInt(entry.target.dataset.target || entry.target.textContent);
                    entry.target.dataset.animated = 'true';
                    entry.target.textContent = '0';
                    animateCounter(entry.target, target);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach((stat) => statObserver.observe(stat));
    }

    // Gallery Filters
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            // Update active state
            filterButtons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter items
            galleryItems.forEach((item) => {
                const category = item.dataset.category || 'all';
                if (filter === 'all' || category === filter) {
                    item.style.display = '';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Lazy Loading (bez blur - obrazy są już załadowane przez Django)

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Sprawdź zapisane preferencje lub użyj systemowych
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        });
    }
    
    // Obserwuj zmiany preferencji systemowych (tylko jeśli użytkownik nie wybrał ręcznie)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
    });

    // Parallax Effect for Hero (subtle)
    const heroSlides = document.querySelectorAll('.hero-carousel__slide img');
    if (heroSlides.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            heroSlides.forEach((img) => {
                const slide = img.closest('.hero-carousel__slide');
                if (slide && slide.classList.contains('is-active')) {
                    const rate = scrolled * 0.3;
                    img.style.transform = `translateY(${rate}px)`;
                }
            });
        });
    }
});

