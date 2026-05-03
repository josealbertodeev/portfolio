/* ===================================================================
   PORTFOLIO — José Alberto Farias
   script.js — particles, typing effect, scroll reveal, navbar, menu
   =================================================================== */

(function () {
    'use strict';

    /* ------------------------------------------------------------------
       1. NAVBAR — sticky blur + active link highlight
    ------------------------------------------------------------------ */
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navLinks');

    function onScroll() {
        // blur effect
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // active nav link
        let current = '';
        sections.forEach(function (sec) {
            const offset = sec.offsetTop - 100;
            if (window.scrollY >= offset) {
                current = sec.getAttribute('id');
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // hamburger toggle
    hamburger.addEventListener('click', function () {
        const isOpen = navMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // close menu on link click
    navMenu.addEventListener('click', function (e) {
        if (e.target.classList.contains('nav-link')) {
            navMenu.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    /* ------------------------------------------------------------------
       2. TYPING EFFECT — hero subtitle
    ------------------------------------------------------------------ */
    const words = [
        'Front-End',
        'React',
        'IA & Automação',
        'JavaScript',
        'Interfaces Modernas',
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

    /* ------------------------------------------------------------------
       3. CANVAS PARTICLES — hero background
    ------------------------------------------------------------------ */
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

    const COLORS = ['#00d4ff', '#7c3aed', '#a78bfa', '#38bdf8'];

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
                    ctx.strokeStyle = 'rgba(0,212,255,' + opacity + ')';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    function init() {
        cancelAnimationFrame(animFrame);
        const count = Math.min(Math.floor((W * H) / 12000), 90);
        particles = Array.from({ length: count }, function () { return new Particle(); });
        loop();
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(function (p) { p.update(); p.draw(); });
        drawConnections();
        animFrame = requestAnimationFrame(loop);
    }

    // pause particles when tab hidden (performance)
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            cancelAnimationFrame(animFrame);
        } else {
            loop();
        }
    });

    window.addEventListener('resize', resize, { passive: true });
    resize();

    /* ------------------------------------------------------------------
       4. SCROLL REVEAL — IntersectionObserver
    ------------------------------------------------------------------ */
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

    /* ------------------------------------------------------------------
       5. SMOOTH ANCHOR SCROLL (override default for offset)
    ------------------------------------------------------------------ */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

    document.querySelectorAll('.skill-card').forEach(function (card, i) {
        card.style.transitionDelay = (i * 0.06) + 's';
    });

    /* ------------------------------------------------------------------
       7. PROJECT CARDS — staggered reveal delay
    ------------------------------------------------------------------ */
    document.querySelectorAll('.project-card').forEach(function (card, i) {
        card.style.transitionDelay = (i * 0.1) + 's';
    });

    /* ------------------------------------------------------------------
       8. CONTACT FORM — basic client-side validation feedback
    ------------------------------------------------------------------ */
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            const name = form.querySelector('#name').value.trim();
            const email = form.querySelector('#email').value.trim();
            const message = form.querySelector('#message').value.trim();

            if (!name || !email || !message) {
                e.preventDefault();
                return;
            }

            // mailto fallback works without backend
            // allow default form action (mailto:)
        });
    }

    /* ------------------------------------------------------------------
       9. LOADER — esconder após carregamento completo
    ------------------------------------------------------------------ */
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', function () {
            setTimeout(function () {
                loader.classList.add('done');
            }, 1900);
        });
        // fallback: remover após 4s caso 'load' demore
        setTimeout(function () {
            loader.classList.add('done');
        }, 4000);
    }

    /* ------------------------------------------------------------------
       10. SCROLL PROGRESS BAR + BACK TO TOP visibility
    ------------------------------------------------------------------ */
    const scrollProg = document.getElementById('scroll-prog');
    const backToTop = document.getElementById('back-to-top');

    function updateScrollUI() {
        const scrollY = window.scrollY;
        const docH = document.documentElement.scrollHeight - window.innerHeight;

        // barra de progresso
        if (scrollProg) {
            scrollProg.style.width = (docH > 0 ? (scrollY / docH) * 100 : 0) + '%';
        }

        // botão voltar ao topo
        if (backToTop) {
            backToTop.classList.toggle('show', scrollY > 400);
        }
    }

    window.addEventListener('scroll', updateScrollUI, { passive: true });
    updateScrollUI(); // estado inicial

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ------------------------------------------------------------------
       11. 3D TILT — cards de projeto (somente desktop)
    ------------------------------------------------------------------ */
    if (!('ontouchstart' in window)) {
        document.querySelectorAll('.project-card').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const rotX = ((y - cy) / cy) * -10;
                const rotY = ((x - cx) / cx) * 10;
                card.style.transform =
                    'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateY(-8px)';
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
                card.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(function () {
                    card.style.transition = '';
                }, 500);
            });
        });
    }

})();
