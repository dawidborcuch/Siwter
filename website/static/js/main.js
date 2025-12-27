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
        const heroCarousel = document.querySelector('.hero-carousel');
        let originalSliderTop = null;
        
        // Function to update slider position based on menu height
        const updateSliderPosition = () => {
            if (window.innerWidth > 768 || !heroCarousel) return;
            
            if (mainNav.classList.contains('mobile-active')) {
                // Save original position if not saved
                if (originalSliderTop === null) {
                    originalSliderTop = heroCarousel.style.marginTop || '';
                }
                
                // Get menu height - slider should move down only by menu height
                // since it's already below header-bottom in the flow
                const menuHeight = mainNav.offsetHeight;
                
                // Move slider down by menu height only
                heroCarousel.style.marginTop = menuHeight + 'px';
                heroCarousel.style.transition = 'margin-top 0.3s ease';
            } else {
                // Restore original position
                if (originalSliderTop !== null) {
                    heroCarousel.style.marginTop = originalSliderTop || '0';
                    setTimeout(() => {
                        heroCarousel.style.marginTop = '';
                        originalSliderTop = null;
                    }, 300);
                }
            }
        };
        
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = mainNav.classList.contains('mobile-active');
            
            if (!isActive) {
                // Calculate position below header-bottom
                // Menu should be positioned relative to first container (with header-bottom)
                const headerBottom = document.querySelector('.header-bottom');
                const firstContainer = document.querySelector('.header > .container:first-of-type');
                
                if (headerBottom) {
                    // Get header element
                    const header = document.querySelector('.header');
                    if (header) {
                        // Get positions relative to viewport
                        const headerRect = header.getBoundingClientRect();
                        const headerBottomRect = headerBottom.getBoundingClientRect();
                        
                        // Calculate top: distance from header top to bottom of header-bottom
                        // Since navigation is absolute and header is relative,
                        // we calculate position relative to header
                        const topPosition = headerBottomRect.bottom - headerRect.top;
                        mainNav.style.top = topPosition + 'px';
                    }
                }
            } else {
                // Reset top when closing
                mainNav.style.top = '';
            }
            
            mainNav.classList.toggle('mobile-active');
            this.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('mobile-active') ? 'hidden' : '';
            
            // Update slider position after menu toggle
            setTimeout(updateSliderPosition, 10);
        });
        
        // Handle submenu expand on mobile - clicking OFERTA expands the list
        // Use direct listeners on parent links for better control
        const submenuParentLinks = mainNav.querySelectorAll('.menu-item-has-children > a');
        submenuParentLinks.forEach(function(parentLink) {
            parentLink.addEventListener('click', function(e) {
                // Only handle on mobile
                if (window.innerWidth > 768) return;
                
                const parentLi = this.parentElement;
                if (!parentLi || !parentLi.classList.contains('menu-item-has-children')) return;
                
                // Prevent default navigation IMMEDIATELY
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                // Expand submenu (always expand, don't toggle)
                parentLi.classList.add('mobile-submenu-open');
                
                // Update slider position when submenu expands
                setTimeout(updateSliderPosition, 100);
                
                // Return false to prevent any further handling
                return false;
            }, true); // Use capture phase to handle before other listeners
        });
        
        // Close menu when clicking outside or on menu item
        document.addEventListener('click', function(e) {
            if (mainNav.classList.contains('mobile-active')) {
                // Check if click is on submenu parent (should toggle, not close)
                const parentLi = e.target.closest('.menu-item-has-children');
                if (parentLi && window.innerWidth <= 768) {
                    // Don't close - submenu toggle handler already dealt with it
                    return;
                }
                
                let shouldClose = false;
                
                // Close if clicking outside menu
                if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    shouldClose = true;
                }
                // Close if clicking on a menu link (not submenu parent)
                const clickedMenuLink = e.target.closest('a');
                if (clickedMenuLink && mainNav.contains(clickedMenuLink)) {
                    const parentLiOfLink = clickedMenuLink.parentElement;
                    if (!parentLiOfLink.classList.contains('menu-item-has-children')) {
                        shouldClose = true;
                    }
                }
                
                if (shouldClose) {
                    mainNav.classList.remove('mobile-active');
                    mobileMenuToggle.classList.remove('active');
                    document.body.style.overflow = '';
                    updateSliderPosition();
                }
            }
        });
        
        // Observe menu height changes (for submenu expansion)
        if (window.innerWidth <= 768 && 'ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver(() => {
                if (mainNav.classList.contains('mobile-active')) {
                    updateSliderPosition();
                }
            });
            resizeObserver.observe(mainNav);
        }
    }

    // Place hero slider so its TOP starts at half the height of the menu tiles
    // Only on desktop - on mobile slider is in normal flow below header
    const updateHeroCarouselTop = () => {
        // Skip on mobile
        if (window.innerWidth <= 768) {
            document.documentElement.style.setProperty('--hero-carousel-push', '0px');
            return;
        }

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
    const pagination = document.querySelector('[data-carousel-pagination]');

    // Create pagination dots
    if (pagination && slides.length > 0) {
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'hero-carousel__pagination-dot';
            dot.setAttribute('aria-label', `Przejdź do slajdu ${i + 1}`);
            dot.setAttribute('data-slide-index', i);
            pagination.appendChild(dot);
        });
    }

    if (track && slides.length > 0 && btnPrev && btnNext) {
        let idx = 0;
        let timer = null;
        const INTERVAL_MS = 4000;

        const render = () => {
            track.style.transform = `translateX(-${idx * 100}%)`;
            slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
            
            // Update pagination dots
            if (pagination) {
                const dots = pagination.querySelectorAll('.hero-carousel__pagination-dot');
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === idx);
                });
            }
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

        // Pagination dots click handlers
        if (pagination) {
            const dots = pagination.querySelectorAll('.hero-carousel__pagination-dot');
            dots.forEach((dot, i) => {
                dot.addEventListener('click', () => {
                    idx = i;
                    render();
                    start();
                });
            });
        }

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

    // Helper function to check if element is in viewport
    const isInViewport = (el) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    // Check if element is already visible (e.g., after hash navigation)
    const checkInitialVisibility = () => {
        revealEls.forEach((el) => {
            // If element is already in viewport or above viewport, show it immediately
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('is-visible');
            }
        });
    };

    // Check immediately on load
    checkInitialVisibility();

    // Also check after a short delay to catch hash navigation
    setTimeout(checkInitialVisibility, 100);
    setTimeout(checkInitialVisibility, 500);

    if (!prefersReduced && revealEls.length > 0 && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

        revealEls.forEach((el) => {
            // Only observe if not already visible
            if (!el.classList.contains('is-visible')) {
                io.observe(el);
            }
        });
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

    // Parallax Effect for Hero (subtle)
    // Parallax effect disabled - slider should stay in place on both mobile and desktop
    // Removed parallax effect to prevent slider from moving during scroll
    
    // Contact form validation: at least one of email or phone must be filled
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        const phoneInput = contactForm.querySelector('#phone-input');
        const emailInput = contactForm.querySelector('#email-input');
        
        if (phoneInput && emailInput) {
            // Create modal for error message
            const createModal = (message) => {
                // Remove existing modal if any
                const existingModal = document.querySelector('.contact-form-modal');
                if (existingModal) {
                    existingModal.remove();
                }
                
                const modal = document.createElement('div');
                modal.className = 'contact-form-modal';
                modal.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100000;
                    animation: fadeIn 0.3s ease;
                `;
                
                const modalContent = document.createElement('div');
                modalContent.style.cssText = `
                    background: #fff;
                    padding: 30px;
                    border-radius: 8px;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    animation: slideIn 0.3s ease;
                `;
                
                const modalTitle = document.createElement('h3');
                modalTitle.textContent = 'Uwaga';
                modalTitle.style.cssText = 'margin: 0 0 15px 0; color: #222; font-size: 20px;';
                
                const modalMessage = document.createElement('p');
                modalMessage.textContent = message;
                modalMessage.style.cssText = 'margin: 0 0 20px 0; color: #666; font-size: 14px; line-height: 1.5;';
                
                const modalButton = document.createElement('button');
                modalButton.textContent = 'Rozumiem';
                modalButton.className = 'btn btn-primary btn-primary--yellow';
                modalButton.style.cssText = 'width: 100%;';
                modalButton.addEventListener('click', () => {
                    modal.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => modal.remove(), 300);
                });
                
                modalContent.appendChild(modalTitle);
                modalContent.appendChild(modalMessage);
                modalContent.appendChild(modalButton);
                modal.appendChild(modalContent);
                
                // Add CSS animations if not already added
                if (!document.querySelector('#contact-form-modal-styles')) {
                    const style = document.createElement('style');
                    style.id = 'contact-form-modal-styles';
                    style.textContent = `
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes fadeOut {
                            from { opacity: 1; }
                            to { opacity: 0; }
                        }
                        @keyframes slideIn {
                            from { transform: translateY(-20px); opacity: 0; }
                            to { transform: translateY(0); opacity: 1; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                document.body.appendChild(modal);
                
                // Close on click outside
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.style.animation = 'fadeOut 0.3s ease';
                        setTimeout(() => modal.remove(), 300);
                    }
                });
            };
            
            // Validate on form submit
            contactForm.addEventListener('submit', function(e) {
                const phoneValue = phoneInput.value.trim();
                const emailValue = emailInput.value.trim();
                
                if (!phoneValue && !emailValue) {
                    e.preventDefault();
                    e.stopPropagation();
                    createModal('Proszę podać przynajmniej jeden z kontaktów: telefon lub e-mail.');
                    return false;
                }
            });
        }
    }
});

