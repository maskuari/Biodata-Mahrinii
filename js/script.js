// Basic interactivity: year, theme toggle, reveal on scroll, skill bars

document.addEventListener('DOMContentLoaded', () => {
    // year
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // hero intro: small delay for entrance
    const hero = document.querySelector('.hero');
    if(hero){ setTimeout(()=> hero.classList.add('show'), 260); }

    // theme toggle (persistent across pages)
    const themeBtn = document.querySelector('.theme-btn');
    const applyTheme = (mode)=>{
        if(mode === 'dark'){
            document.body.classList.add('dark');
            if(themeBtn) themeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4" fill="#fff"/><path d="M12 2v2M12 20v2M4.93 4.93l1.414 1.414M17.657 17.657l1.414 1.414M2 12h2M20 12h2M4.93 19.07l1.414-1.414M17.657 6.343l1.414-1.414" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            themeBtn && themeBtn.setAttribute('aria-pressed','true');
        } else {
            document.body.classList.remove('dark');
            if(themeBtn) themeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="#ff4d89"/></svg>';
            themeBtn && themeBtn.setAttribute('aria-pressed','false');
        }
    };

    // initialize theme from localStorage or system preference
    const saved = localStorage.getItem('theme');
    if(saved){
        applyTheme(saved);
    } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    }

    if(themeBtn){
        // accessibility
        themeBtn.setAttribute('aria-label','Toggle tema gelap / terang');
        themeBtn.setAttribute('role','button');
        themeBtn.setAttribute('tabindex','0');
        // initialise icon based on current mode (applyTheme already sets icon when called earlier)
        themeBtn.addEventListener('click', ()=>{
            const isDark = document.body.classList.toggle('dark');
            const newMode = isDark ? 'dark' : 'light';
            localStorage.setItem('theme', newMode);
            applyTheme(newMode);
        });
    }

    // IntersectionObserver reveal
    const io = new IntersectionObserver(entries => {
        // sort entries by viewport position for consistent stagger
        const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=> (a.boundingClientRect.top - b.boundingClientRect.top));
        visible.forEach((entry, i)=>{
            setTimeout(()=>{
                entry.target.classList.add('show');
                const fills = entry.target.querySelectorAll('.fill');
                fills.forEach(f=>{
                    const level = f.getAttribute('data-level') || 80;
                    f.style.width = level + '%';
                });
            }, i * 90);
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-in, .card, .profile-card, .project').forEach(el => io.observe(el));

    // smooth scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (href.length > 1) {
                e.preventDefault();
                document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // keyboard accessibility for project cards: Enter => open detail (demo)
    // project card keyboard: Enter opens modal (if present)
    document.querySelectorAll('.project').forEach(card => {
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                const pid = card.getAttribute('data-projid');
                if (pid) openCaseStudy(pid);
            }
        });
    });

    // Modal: open/close logic
    const modal = document.getElementById('case-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    const modalPoints = document.getElementById('modal-points');

    const caseData = {
        'proj-app-dashboard': {
            title: 'Comming Soon',
            meta: 'Mahrini - 2025',
            points: ['-']
        },
        'proj-landing': {
            title: 'Landing Page Brand — Studi Kasus',
            meta: 'Frontend • HTML/CSS/JS • 2022',
            points: ['A/B test hero variants', 'Optimisasi LCP dan CLS', 'Hasil: +12% konversi']
        },
        'proj-ecom': {
            title: 'E-commerce Performance — Studi Kasus',
            meta: 'Frontend • Next.js • 2024',
            points: ['Image optimization & preloading', 'Server-side rendering untuk catalog', 'Hasil: skor Lighthouse naik 22 points']
        }
    };

    function openCaseStudy(id) {
        const data = caseData[id];
        if (!data || !modal) return;
        modalTitle.textContent = data.title;
        modalMeta.textContent = data.meta;
        modalPoints.innerHTML = '';
        data.points.forEach(p => {
            const li = document.createElement('li'); li.textContent = p; modalPoints.appendChild(li);
        });
        modal.setAttribute('aria-hidden', 'false');
        // prevent body scroll while modal open
        document.body.classList.add('no-scroll');
        // small animation: focus close button
        const close = modal.querySelector('.modal-close');
        setTimeout(()=> close?.focus(), 50);
        // setup focus trap
        trapFocus(modal);
    }

    function closeModal(){
        modal?.setAttribute('aria-hidden','true');
        document.body.classList.remove('no-scroll');
        releaseFocusTrap();
    }

    // wire open buttons
    document.querySelectorAll('.open-case').forEach(btn=>{
        btn.addEventListener('click', e=>{
            const id = btn.getAttribute('data-projid');
            openCaseStudy(id);
        });
    });

    // close handlers
    document.addEventListener('click', e=>{
        if(e.target.matches('[data-dismiss="modal"]') || e.target.matches('.modal-close')) closeModal();
    });
    document.addEventListener('keydown', e=>{
        if(e.key==='Escape') closeModal();
    });

    // Focus trap utilities for modal
    let _lastFocused = null;
    let _trapHandler = null;
    function trapFocus(container){
        _lastFocused = document.activeElement;
        const focusable = Array.from(container.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'))
            .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
        if(focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        _trapHandler = function(e){
            if(e.key !== 'Tab') return;
            if(e.shiftKey){
                if(document.activeElement === first){ e.preventDefault(); last.focus(); }
            } else {
                if(document.activeElement === last){ e.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener('keydown', _trapHandler);
    }

    function releaseFocusTrap(){
        if(_trapHandler) document.removeEventListener('keydown', _trapHandler);
        _trapHandler = null;
        if(_lastFocused && typeof _lastFocused.focus === 'function') _lastFocused.focus();
        _lastFocused = null;
    }

    // contact form: simple success toast
    const form = document.querySelector('.contact-form');
    form?.addEventListener('submit', e => {
        e.preventDefault();
        alert('Terima kasih! Pesan Anda telah dikirim (demo).');
        form.reset();
    });

    // highlight active nav based on current page and set aria-current for accessibility
    /* Dynamic navigation builder & scroll-spy
       - If `.nav-list` doesn't exist, build it from `navItems` and mount inside `.nav`
       - Mobile toggle (adds `.open` to .nav)
       - Indicator bar follows active link (desktop)
       - Scroll-spy highlights anchors on index.html
    */
    const navItems = [
        { label: 'Home', href: 'index.html' },
        { label: 'Pendidikan', href: 'education.html' },
        { label: 'Pengalaman', href: 'experience.html' },
        { label: 'Keahlian', href: 'skills.html' },
        { label: 'Proyek', href: 'projects.html' },
        
    ];

    function buildNavIfNeeded(){
        const nav = document.querySelector('.nav');
        if(!nav) return;
        // if there's already a structured nav-list, skip
        if(nav.querySelector('.nav-list')) return;

    const btn = document.createElement('button');
    btn.className = 'nav-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Buka menu navigasi');
    btn.innerHTML = '☰';
    // place toggle into header so absolute positioning is relative to header
    const headerEl = document.querySelector('.site-header');
    if(headerEl) headerEl.appendChild(btn);

        const ul = document.createElement('ul'); ul.className = 'nav-list';
        // if nav already contains direct anchor children, move them into the nav-list
        const directAnchors = Array.from(nav.querySelectorAll(':scope > a'));
        if(directAnchors.length){
            directAnchors.forEach(aEl=>{
                const li = document.createElement('li');
                // move existing anchor into list item
                li.appendChild(aEl);
                ul.appendChild(li);
            });
        } else {
            navItems.forEach(it=>{
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = it.href; a.textContent = it.label; a.setAttribute('role','link');
                li.appendChild(a); ul.appendChild(li);
            });
        }
        nav.appendChild(ul);

    // nav indicator removed — simplified active-link handling

        // toggle behavior with overlay for mobile
        let navOverlay = null;
        function createOverlay(){
            if(navOverlay) return;
            navOverlay = document.createElement('div'); navOverlay.className = 'nav-overlay';
            document.body.appendChild(navOverlay);
            navOverlay.addEventListener('click', ()=>{ nav.classList.remove('open'); btn.setAttribute('aria-expanded','false'); removeOverlay(); });
        }
        function removeOverlay(){ if(navOverlay){ navOverlay.remove(); navOverlay = null; } }

        function positionMobileMenu(){
            const menu = nav.querySelector('.nav-list');
            if(!menu) return;
            const headerRect = headerEl.getBoundingClientRect();
            const toggleRect = btn.getBoundingClientRect();
            const padding = 12; // viewport padding
            const maxMenuWidth = Math.min(320, window.innerWidth - padding * 2);
            const menuWidth = Math.min(menu.scrollWidth || 220, maxMenuWidth);
            // compute left so menu's right aligns with toggle right, but clamp within viewport
            let left = Math.round(toggleRect.right - menuWidth);
            if(left < padding) left = padding;
            if(left + menuWidth > window.innerWidth - padding) left = window.innerWidth - menuWidth - padding;
            // position fixed so we position relative to viewport
            menu.style.position = 'fixed';
            menu.style.top = (Math.round(headerRect.bottom) + 8) + 'px';
            menu.style.left = left + 'px';
            menu.style.right = 'auto';
            menu.style.width = menuWidth + 'px';
            menu.style.maxWidth = maxMenuWidth + 'px';
        }

        function resetMobileMenuStyles(){
            const menu = nav.querySelector('.nav-list');
            if(!menu) return;
            menu.style.position = '';
            menu.style.top = '';
            menu.style.left = '';
            menu.style.right = '';
            menu.style.width = '';
            menu.style.maxWidth = '';
        }

        btn.addEventListener('click', ()=>{
            const open = nav.classList.toggle('open');
            btn.setAttribute('aria-expanded', String(open));
            if(open){ createOverlay(); positionMobileMenu(); }
            else { removeOverlay(); resetMobileMenuStyles(); }
        });

        // ensure theme button stays to the right of nav (move it into header end)
        const header = document.querySelector('.site-header');
        const themeBtn = document.querySelector('.theme-btn');
        if(header && themeBtn){
            // append ensures it appears at the end of header flow and respects flex order
            header.appendChild(themeBtn);
            // ensure it's keyboard-focusable
            themeBtn.setAttribute('tabindex','0');
        }

        // wire click to close mobile menu after selecting
        ul.addEventListener('click', e=>{
            if(e.target.tagName === 'A') nav.classList.remove('open');
        });

        // active link handling (no indicator)
        const links = Array.from(nav.querySelectorAll('a'));
        function setActiveByHref(href){
            // href may be a string like 'index.html' or a hash '#about'
            links.forEach(a=>{
                const aHref = a.getAttribute('href') || '';
                // normalize to filename part (strip directories and hash)
                const aName = aHref.split('#')[0].split('/').pop() || 'index.html';
                let targetName = '';
                if(href){ targetName = href.split('#')[0].split('/').pop() || 'index.html'; }
                else { targetName = (window.location.pathname.split('/').pop() || 'index.html'); }
                const isActive = aName === targetName;
                a.classList.toggle('active', isActive);
                if(isActive) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
            });
        }

        // attach smooth scroll to built links too
        links.forEach(a=>{
            a.addEventListener('click', e=>{
                const href = a.getAttribute('href');
                if(href.startsWith('#')){
                    e.preventDefault(); document.querySelector(href)?.scrollIntoView({behavior:'smooth', block:'start'});
                }
                setTimeout(()=> setActiveByHref(href), 60);
            });
        });

        // set initial active based on current location
        const current = window.location.pathname.split('/').pop() || 'index.html';
        const hash = window.location.hash || '';
        if((current === 'index.html' || current === '') && hash){ setActiveByHref(hash); }
        else { // try to match by filename
            const match = links.find(a=> a.getAttribute('href') === current || a.getAttribute('href') === ('/' + current));
            if(match) setActiveByHref(match.getAttribute('href'));
            else {
                // default to Home
                setActiveByHref('index.html');
            }
        }

        // reposition on resize
        window.addEventListener('resize', ()=>{
            // if resizing to desktop, ensure mobile menu is closed and overlay removed
            if(!window.matchMedia('(max-width:780px)').matches){ nav.classList.remove('open'); btn.setAttribute('aria-expanded','false'); removeOverlay(); resetMobileMenuStyles(); }
            else { // if still mobile and menu open, reposition it
                if(nav.classList.contains('open')) positionMobileMenu();
            }
        });

        // scroll-spy on index to highlight section links
        if(window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') ){
            const sections = document.querySelectorAll('main section[id]');
            const spy = new IntersectionObserver(entries=>{
                entries.forEach(en=>{
                    if(en.isIntersecting){
                        const id = '#' + en.target.id;
                        links.forEach(a=> a.classList.toggle('active', a.getAttribute('href') === id));
                        // set active class on links (no indicator)
                        const active = nav.querySelector('.nav-list a.active');
                    }
                });
            },{threshold:0.45});
            sections.forEach(s=> spy.observe(s));
        }
    }

    buildNavIfNeeded();

    // initialize active link based on current URL (robust match)
    const currentName = window.location.pathname.split('/').pop() || 'index.html';
    setActiveByHref(currentName);
});
