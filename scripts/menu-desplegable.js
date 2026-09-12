document.addEventListener('DOMContentLoaded', () => {
    // Drawer menu interactions
    const toggleBtn = document.getElementById('menu-toggle-btn');
    const closeBtn = document.getElementById('menu-close-btn');
    const backdrop = document.getElementById('menu-backdrop');
    const drawer = document.getElementById('drawer-panel');
    const navLinks = document.querySelectorAll('.menu-item');

    let isOpen = false;

    window.openMenu = function() {
        if (isOpen) return;
        isOpen = true;

        backdrop.classList.add('visible');
        drawer.classList.add('open');

        if (toggleBtn) {
            toggleBtn.classList.add('hamburger-active');
            toggleBtn.setAttribute('aria-expanded', 'true');
        }

        document.body.classList.add('menu-open');
        document.body.style.overflow = 'hidden';
    };

    window.closeMenu = function() {
        if (!isOpen) return;
        isOpen = false;

        document.body.classList.remove('menu-open');
        drawer.classList.remove('open');
        backdrop.classList.remove('visible');

        if (toggleBtn) {
            toggleBtn.classList.remove('hamburger-active');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }

        setTimeout(() => {
            if (!isOpen) {
                document.body.style.overflow = '';
            }
        }, 450);
    };

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isOpen ? closeMenu() : openMenu();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closeMenu();
        }
    });

    // IntersectionObserver for smooth continuous scroll reveals
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => revealObserver.observe(el));
});