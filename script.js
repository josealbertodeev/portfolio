(function () {
    'use strict';

    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navLinks');

    function onScroll() {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    hamburger.addEventListener('click', function () {
        const isOpen = navMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.addEventListener('click', function (e) {
        if (e.target.classList.contains('nav-link')) {
            navMenu.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    const words = [
        'Full Stack Jr',
        'React.js',
        'Node.js',
        'TypeScript',
        'JavaScript ES6+',
        'IA & Automação',
        'HTML5 & CSS3',
    ];
    const typingEl = document.getElementById('typingText');
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;
    const TYPE_SPEED = 90;
    const DELETE_SPEED = 50;
    const PAUSE_END = 1800;
    const PAUSE_START = 300;

    function type() {
        const word = words[wordIndex];
        const visible = word.substring(0, charIndex);
        typingEl.textContent = visible;

        if (!deleting) {
            if (charIndex < word.length) {
                charIndex++;
                setTimeout(type, TYPE_SPEED);
            } else {
                setTimeout(function () { deleting = true; type(); }, PAUSE_END);
            }
        } else {
            if (charIndex > 0) {
                charIndex--;
                setTimeout(type, DELETE_SPEED);
            } else {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                setTimeout(type, PAUSE_START);
            }
        }
    }

    type();

    const canvas = document.getElementById('particlesCanvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles, animFrame;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        init();
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return r + ',' + g + ',' + b;
    }

    const COLORS = ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a'];

    function Particle() {
        this.x = random(0, W);
        this.y = random(0, H);
        this.vx = random(-0.35, 0.35);
        this.vy = random(-0.35, 0.35);
        this.r = random(1, 2.5);
        this.color = COLORS[Math.floor(random(0, COLORS.length))];
        this.alpha = random(0.3, 0.8);
    }

    Particle.prototype.update = function () {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = W;
        if (this.x > W) this.x = 0;
        if (this.y < 0) this.y = H;
        if (this.y > H) this.y = 0;
    };

    Particle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + hexToRgb(this.color) + ',' + this.alpha + ')';
        ctx.fill();
    };

    const MAX_DIST = 120;

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const opacity = (1 - dist / MAX_DIST) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = 'rgba(255,255,255,' + opacity + ')';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    function init() {
        cancelAnimationFrame(animFrame);
        const count = Math.min(Math.floor((W * H) / 16000), 90);
        particles = Array.from({ length: count }, function () { return new Particle(); });
        loop();
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(function (p) { p.update(); p.draw(); });
        drawConnections();
        animFrame = requestAnimationFrame(loop);
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            cancelAnimationFrame(animFrame);
        } else {
            loop();
        }
    });

    window.addEventListener('resize', resize, { passive: true });
    resize();

    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) { observer.observe(el); });

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    const views = document.querySelectorAll('.view');
    const viewExtras = document.querySelectorAll('[data-view]');
    const DEFAULT_VIEW = 'hero';

    function viewExists(id) {
        return !!(id && document.getElementById(id) &&
            document.getElementById(id).classList.contains('view'));
    }

    function showView(id, push) {
        if (!viewExists(id)) id = DEFAULT_VIEW;

        views.forEach(function (v) { v.classList.toggle('active', v.id === id); });
        viewExtras.forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-view') === id);
        });

        navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });

        if (push && ('#' + id) !== window.location.hash) {
            history.pushState({ view: id }, '', id === DEFAULT_VIEW ? '#' : '#' + id);
        }

        window.scrollTo(0, 0);
        requestAnimationFrame(function () { window.scrollTo(0, 0); });
        onScroll();
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href').slice(1);
            if (!viewExists(id)) return;
            e.preventDefault();
            showView(id, true);
        });
    });

    window.addEventListener('popstate', function () {
        showView(window.location.hash.slice(1), false);
    window.addEventListener('load', function () { window.scrollTo(0, 0); });
    });

    showView(window.location.hash.slice(1), false);

    document.querySelectorAll('.skill-card').forEach(function (card, i) {
        card.style.transitionDelay = (i * 0.06) + 's';
    });

    document.querySelectorAll('.project-card').forEach(function (card, i) {
        card.style.transitionDelay = (i * 0.1) + 's';
    });

    const loader = document.getElementById('loader');
    if (loader) {
        if (document.readyState === 'complete') {
            loader.classList.add('done');
        } else {
            window.addEventListener('load', function () {
                loader.classList.add('done');
            });
        }

        setTimeout(function () {
            loader.classList.add('done');
        }, 2500);
    }

    const backToTop = document.getElementById('back-to-top');

    function updateScrollUI() {
        if (backToTop) {
            backToTop.classList.toggle('show', window.scrollY > 400);
        }
    }

    window.addEventListener('scroll', updateScrollUI, { passive: true });
    updateScrollUI();

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var statEls = document.querySelectorAll('.stat-number[data-target]');
    if (statEls.length) {
        var statsObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var target = parseInt(el.getAttribute('data-target'), 10);
                var current = 0;
                var step = Math.ceil(target / 30);
                var timer = setInterval(function () {
                    current = Math.min(current + step, target);
                    el.textContent = current;
                    if (current >= target) clearInterval(timer);
                }, 40);
                statsObserver.unobserve(el);
            });
        }, { threshold: 0.5 });
        statEls.forEach(function (el) { statsObserver.observe(el); });
    }

    var filterBtns = document.querySelectorAll('.filter-btn');
    var projectCards = document.querySelectorAll('.project-card[data-category]');

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var filter = btn.getAttribute('data-filter');
            projectCards.forEach(function (card) {
                if (filter === 'all' || card.getAttribute('data-category').split(' ').includes(filter)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    if (!('ontouchstart' in window)) {
        document.querySelectorAll('.project-card').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
                card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
            });
        });
    }
})();
