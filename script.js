// Očekává, že se celý DOM načte, než začne manipulovat s elementy
document.addEventListener('DOMContentLoaded', () => {

    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = document.querySelectorAll('.section');
    const contactForms = document.querySelectorAll('form.contact-form');

    let headerHeight = 0; // Proměnná pro dynamickou výšku hlavičky

    // Funkce pro aktualizaci výšky hlavičky
    const updateHeaderHeight = () => {
        if (header) {
            headerHeight = header.offsetHeight;
        }
    };

    // --- Plynulé skrolování k sekcím s ohledem na pevnou hlavičku ---
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            // Okamžité nastavení aktivní třídy při KLIKNUTÍ pro vizuální zpětnou vazbu
            navLinks.forEach(nav => nav.classList.remove('active')); // Nejdřív odeber ze všech
            this.classList.add('active'); // Pak přidej k právě kliknutému

            if (targetElement) {
                // Vypočítáme cílovou pozici s ohledem na aktuální výšku hlavičky
                const scrollToPosition = targetElement.offsetTop - headerHeight - 15; // + 15px odsazení

                window.scrollTo({
                    top: scrollToPosition,
                    behavior: 'smooth'
                });

                // Důležité: Po dokončení plynulého skrolování, vynutíme re-evaluaci active stavu
                // To je pojistka, pokud by IntersectionObserver nedetekoval změnu okamžitě
                setTimeout(() => {
                    // Vynucení aktualizace IntersectionObserveru
                    // Nejjednodušší způsob je dočasně odpojit a znovu připojit observer
                    sections.forEach(section => {
                        navSectionActiveObserver.unobserve(section);
                        navSectionActiveObserver.observe(section);
                    });
                }, 400); // Malé zpoždění, aby se skrolování dokončilo
            }
        });
    });

    // --- Efektní načítání sekcí při scrollu pomocí Intersection Observer ---
    const sectionObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionVisibilityObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Pokud chceš, aby se animace spustila jen jednou, odkomentuj následující řádek:
                // observer.unobserve(entry.target); 
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => {
        sectionVisibilityObserver.observe(section);
    });

    // --- Vylepšené odesílání formuláře (AJAX s fetch API) ---
    contactForms.forEach(form => {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            const statusDiv = form.querySelector("#form-status");
            const formData = new FormData(form);

            if (statusDiv) {
                statusDiv.textContent = "Odesílám...";
                statusDiv.classList.remove('success', 'error');
                statusDiv.style.opacity = '1';
            }

            try {
                const formAction = form.action || "https://api.web3forms.com/submit"; 
                
                const response = await fetch(formAction, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    if (statusDiv) {
                        statusDiv.textContent = "Zpráva byla úspěšně odeslána! Ozvu se vám co nejdříve.";
                        statusDiv.classList.add('success');
                    }
                    form.reset();
                } else {
                    if (statusDiv) {
                        statusDiv.textContent = data.message || "Chyba při odesílání formuláře. Zkuste to prosím později.";
                        statusDiv.classList.add('error');
                    }
                    console.error('Web3Forms error:', data.message);
                }
            } catch (error) {
                if (statusDiv) {
                    statusDiv.textContent = "Došlo k chybě připojení k serveru. Zkuste to prosím později.";
                    statusDiv.classList.add('error');
                }
                console.error('Form submission network error:', error);
            }

            setTimeout(() => {
                if (statusDiv) {
                    statusDiv.style.opacity = '0';
                    setTimeout(() => {
                        statusDiv.textContent = "";
                        statusDiv.classList.remove('success', 'error');
                    }, 300);
                }
            }, 5000);
        });
    });

    // --- Jemný efekt posunu pozadí hlavičky při scrollu (Parallax like) ---
    if (header) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            header.style.backgroundPositionY = `${-scrollPosition * 0.1}px`;
        });
    }

    // --- Aktivní stav v navigaci při scrollu (VYLEPŠENO) ---
    // Funkce, která se spustí při každé změně protnutí sekce
    const handleNavIntersection = (entries) => {
        let currentActiveId = null;

        // Najdeme sekci, která je aktuálně nejvíce "viditelná" v aktivní zóně
        // a která by měla být prioritní.
        // Projdeme sekce od konce (odspoda nahoru), protože ta nejvyšší viditelná
        // je obvykle ta, kterou uživatel právě čte.
        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const rect = section.getBoundingClientRect();

            // Pokud je sekce alespoň částečně viditelná v rámci "aktivního okna"
            // (pod hlavičkou a ne příliš dole)
            // A její horní okraj je nad (nebo na) horní hranici aktivní zóny
            // A její spodní okraj je pod (nebo na) spodní hranici aktivní zóny
            const headerOffset = headerHeight + 10; // Malé odsazení od hlavičky
            const viewportHeight = window.innerHeight;
            const activationPoint = viewportHeight * 0.3; // např. aktivovat, když je 30% viewportu od shora

            if (rect.top <= headerOffset && rect.bottom > activationPoint) {
                currentActiveId = section.id;
                break; // Našli jsme nejlepší shodu, ukončíme hledání
            }
        }
        
        // Pokud žádná sekce neodpovídá kritériím, ale jsme nahoře na stránce, aktivuj první odkaz
        if (!currentActiveId && window.scrollY === 0 && sections.length > 0) {
            currentActiveId = sections[0].id;
        }

        // Nastavíme aktivní třídu pouze na ten správný odkaz
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${currentActiveId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // Vytvoření Intersection Observeru s dynamickým rootMargin
    // rootMargin bude nastaven při startu a při resize, aby zohledňoval výšku hlavičky
    const navSectionActiveObserver = new IntersectionObserver(handleNavIntersection, {
        root: null, // Pozorování relativně k viewportu
        // rootMargin bude aktualizován dynamicky
        // Nastavíme zde výchozí hodnoty, které se přepíší
        rootMargin: `${-headerHeight}px 0px -${window.innerHeight * 0.3}px 0px`, // Dynamický margin
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] // Sledujeme více prahových hodnot pro plynulejší detekci
    }); 

    // Přiřazení observeru ke všem sekcím
    sections.forEach(section => {
        navSectionActiveObserver.observe(section);
    });

    // --- Inicializace a naslouchání událostem ---
    // Aktualizuj výšku hlavičky a aktivní odkaz při načtení stránky
    window.addEventListener('load', () => { //
        updateHeaderHeight(); // Získání aktuální výšky hlavičky
        // Počkej chvíli, aby se hlavička vykreslila a Intersection Observer se správně inicializoval
        setTimeout(() => { //
            // Po načtení a malé prodlevě znovu spustíme logiku pro navigaci
            // aby se zohlednila aktuální pozice
            handleNavIntersection(navSectionActiveObserver.takeRecords()); // Zpracuj aktuální záznamy observeru
        }, 100); 
    });

    // Aktualizuj výšku hlavičky a resetuj observer při změně velikosti okna
    let resizeTimeout;
    window.addEventListener('resize', () => { //
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateHeaderHeight(); // Aktualizuj výšku hlavičky
            // Znovu vytvoř observer s novým rootMargin
            navSectionActiveObserver.disconnect(); // Odpoj starý observer
            navSectionActiveObserver.takeRecords(); // Vyčisti čekající záznamy
            navSectionActiveObserver.rootMargin = `${-headerHeight}px 0px -${window.innerHeight * 0.3}px 0px`;
            sections.forEach(section => {
                navSectionActiveObserver.observe(section); // Znovu připoj observer k sekcím
            });
            // Ihned aktualizuj aktivní odkaz po resize
            handleNavIntersection(navSectionActiveObserver.takeRecords());
        }, 200); // Debounce pro resize
    });
    
    // --- Mikrointerakce: Jemné zmenšení/zvětšení při kliknutí na tlačítka ---
    const clickableElementsForButtonsOnly = document.querySelectorAll('.btn-main'); 
    clickableElementsForButtonsOnly.forEach(element => {
        element.addEventListener('mousedown', () => {
            element.style.transform += ' scale(0.98)';
            element.style.transition = 'transform 0.1s ease-out';
        });
        element.addEventListener('mouseup', () => {
            setTimeout(() => {
                const currentTransform = element.style.transform;
                const newTransform = currentTransform.replace(/scale\([^)]*\)/, '').trim();
                element.style.transform = newTransform || 'none'; 
            }, 100);
            element.style.transition = '';
        });
        element.addEventListener('mouseleave', () => {
            const currentTransform = element.style.transform;
            const newTransform = currentTransform.replace(/scale\([^)]*\)/, '').trim();
            element.style.transform = newTransform || 'none';
        });
    });

});
