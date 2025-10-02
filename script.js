'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // Kľúčové elementy
    const header = document.querySelector('header');
    // Filtrujeme odkazy, ktoré vedú na sekcie v rámci stránky
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = document.querySelectorAll('.section');
    const contactForms = document.querySelectorAll('form.contact-form');

    // Kontroly pre optimalizáciu a prístupnosť
    const supportsIntersectionObserver = 'IntersectionObserver' in window;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /**
     * Aktivuje odkaz v navigácii pridaním triedy 'active'
     * @param {string} sectionId - ID sekcie (napr. 'about')
     */
    const activateLink = (sectionId) => {
        if (!sectionId) {
            return;
        }

        navLinks.forEach((link) => {
            // Kontroluje, či href odkazu zodpovedá ID sekcie
            link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });
    };

    /**
     * Vracia vypočítanú výšku hlavičky pre ofset (scroll-margin)
     * @returns {number} Výška hlavičky + dodatočný okraj
     */
    const getHeaderOffset = () => {
        // Hlavička je sticky, musíme odpočítať jej výšku + malý okraj
        return (header ? header.offsetHeight : 0) + 15;
    };

    // Plynulé scrollovanie k sekciám
    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (!targetElement) {
                return;
            }

            const scrollToPosition = Math.max(0, targetElement.offsetTop - getHeaderOffset());

            if (prefersReducedMotion) {
                // Pre užívateľov s preferenciou redukovaného pohybu použijeme okamžitý skok
                window.scrollTo(0, scrollToPosition);
            } else {
                // Pre plynulé scrollovanie použijeme moderné API
                window.scrollTo({
                    top: scrollToPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Efekty pri načítaní a sledovanie pozície sekcií (Intersection Observer) ---
    if (supportsIntersectionObserver) {
        // 1. Observer pre animáciu načítania sekcií (is-visible)
        const sectionVisibilityObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                // Len raz po objavení
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            // Spúšťa sa, keď je viditeľných aspoň 10% sekcie
            threshold: 0.1 
        });

        // 2. Observer pre aktívnu navigáciu (určenie, ktorá sekcia je aktuálna)
        const navSectionActiveObserver = new IntersectionObserver((entries) => {
            let activeId = null;
            // Prechádzame len viditeľné sekcie
            entries.filter(entry => entry.isIntersecting).forEach(entry => {
                // Pretože rootMargin je symetrický, vyberieme prvú pretínajúcu sa sekciu
                // čo by mala byť tá, ktorá je najbližšie stredu
                activeId = entry.target.id;
            });
            
            // Ak nájdeme aktívnu ID, aktivujeme odkaz
            if (activeId) {
                activateLink(activeId);
            }
        }, {
            root: null,
            // Prispôsobený margin tak, aby sa "aktívna zóna" nachádzala v strede
            // '-30% 0px' od hora/dola je dobrý kompromis
            rootMargin: '-30% 0px -30% 0px', 
            threshold: 0.01 // Spúšťa sa pri minimálnom pretínaní
        });

        // Spustenie sledovania
        sections.forEach((section) => {
            sectionVisibilityObserver.observe(section);
            navSectionActiveObserver.observe(section);
        });

    } else {
        // --- Fallback pre staré prehliadače (bez Intersection Observer) ---

        // Všetky sekcie ihneď viditeľné
        sections.forEach((section) => section.classList.add('is-visible'));

        const fallbackScrollHandler = () => {
            const scrollPosition = window.scrollY || window.pageYOffset || 0;
            const offset = getHeaderOffset(); // Opakované použitie ofsetu

            let activeSectionId = null;

            // Prejdeme sekcie od konca, aby sme uprednostnili sekciu, ktorá je najvyššie
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                const top = section.offsetTop;

                // Ak je pozícia scrollu (s ofsetom) za začiatkom sekcie
                if (scrollPosition + offset >= top) {
                    activeSectionId = section.id;
                    break;
                }
            }

            // Ak žiadna nie je aktívna (sme na vrchole), nastavíme prvú
            if (!activeSectionId && sections.length > 0) {
                 activeSectionId = sections[0].id;
            }

            activateLink(activeSectionId);
        };

        window.addEventListener('scroll', fallbackScrollHandler, { passive: true });
        fallbackScrollHandler();
    }


    // --- AJAX ODESÍLÁNÍ FORMULÁŘE (Web3Forms) ---
    contactForms.forEach((form) => {
        form.addEventListener('submit', async (event) => {
            // Použijeme fetch API, ak nie je k dispozícii, necháme formulár odoslať tradične
            if (!window.fetch) {
                return;
            }

            event.preventDefault();

            const statusElement = form.querySelector('.form-status');
            const submitButton = form.querySelector('.form-submit-btn');
            const formData = new FormData(form);

            // Nastavenie počiatočného stavu
            if (statusElement) {
                statusElement.textContent = 'Odesílám...';
                statusElement.classList.remove('success', 'error');
                statusElement.style.opacity = '1';
            }
            if (submitButton) {
                submitButton.disabled = true;
            }

            try {
                const response = await fetch(form.action || 'https://api.web3forms.com/submit', {
                    method: form.method || 'POST',
                    body: formData,
                    headers: {
                        // Nie je potrebné pre Web3Forms, ale pre čistotu to tu ponecháme
                        Accept: 'application/json' 
                    }
                });

                const data = await response.json();

                if (data.success) {
                    if (statusElement) {
                        statusElement.textContent = 'Zpráva byla úspěšně odeslána. Ozvu se vám co nejdříve.';
                        statusElement.classList.add('success');
                    }
                    form.reset();
                } else {
                    // Chybová správa od Web3Forms
                    const errorMessage = data.message || 'Chyba při odeslání formuláře. Zkuste to prosím později.';
                    if (statusElement) {
                        statusElement.textContent = errorMessage;
                        statusElement.classList.add('error');
                    }
                    console.error('Web3Forms error:', errorMessage);
                }
            } catch (error) {
                // Chyba na úrovni siete/pripojenia
                if (statusElement) {
                    statusElement.textContent = 'Došlo k chybě připojení k serveru. Zkuste to prosím později.';
                    statusElement.classList.add('error');
                }
                console.error('Form submission network error:', error);
            } finally {
                // Vždy znovu povoliť tlačidlo a spustiť časovač na skrytie správy
                if (submitButton) {
                    submitButton.disabled = false;
                }
                
                if (statusElement) {
                    // Postupne skrytie správy
                    window.setTimeout(() => {
                        statusElement.style.opacity = '0';
                        window.setTimeout(() => {
                            statusElement.textContent = '';
                            statusElement.classList.remove('success', 'error');
                        }, 300); // 300ms je pre CSS transition opacity
                    }, 5000);
                }
            }
        });
    });

    // --- Jemná inicializácia aktívneho odkazu po načítaní ---
    // (Ponechané, ale IntersectionObserver robí túto prácu lepšie počas scrollu.)
    window.addEventListener(
        'load',
        () => {
            let activeFound = false;
            const offset = getHeaderOffset();

            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                // Kontrola, či je sekcia v rámci viewportu a pod hlavičkou
                if (!activeFound && rect.top <= offset && rect.bottom > offset) {
                    activateLink(section.id);
                    activeFound = true;
                }
            });

            // Ak žiadna sekcia nie je aktívna (napr. na úplnom vrchu), aktivujeme prvú
            if (!activeFound && sections.length > 0) {
                activateLink(sections[0].id);
            }
        },
        { once: true }
    );
});
