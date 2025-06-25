// Očekává, že se celý DOM načte, než začne manipulovat s elementy
document.addEventListener('DOMContentLoaded', () => {

    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = document.querySelectorAll('.section');
    const contactForms = document.querySelectorAll('form.contact-form');

    // --- Plynulé skrolování k sekcím s ohledem na pevnou hlavičku ---
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 0;
                const scrollToPosition = targetElement.offsetTop - headerHeight - 15;

                window.scrollTo({
                    top: scrollToPosition,
                    behavior: 'smooth'
                });
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
                observer.unobserve(entry.target);
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
                // Přidáno `form.action` pro jistotu, i když je v kódu už zahrnuto
                const formAction = form.action || "https://api.web3forms.com/submit"; // Zajištění fallback URL
                
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
                        // Zlepšená zpráva pro uživatele
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
                    }, 300); // Doba pro opacity transition
                }
            }, 5000);
        });
    });

    // --- Jemný efekt posunu pozadí hlavičky při scrollu (Parallax like) ---
    if (header) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop; // Kompatibilita
            header.style.backgroundPositionY = `${-scrollPosition * 0.1}px`;
        });
    }

    // --- Aktivní stav v navigaci při scrollu ---
    const navSectionObserverOptions = {
        root: null,
        // Trigger zóna uprostřed viewportu, aby bylo jasné, která sekce je "aktivní"
        // Změna threshold z 0 na 0.2 (20%) pro spolehlivější detekci
        rootMargin: '-30% 0px -30% 0px', // Trigger zóna uprostřed 40% viewportu
        threshold: 0.2 // Sekce musí být viditelná z 20%
    };

    const navSectionActiveObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = document.querySelector(`nav a[href="#${id}"]`);

            if (navLink) {
                if (entry.isIntersecting) {
                    // Odebereme 'active' ze všech, pak přidáme na aktuální
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                } else {
                    // Volitelné: pokud se sekce odskroluje, odebrat 'active'
                    // Lze vypnout, pokud preferuješ, aby active zůstalo, dokud není další sekce
                    // navLink.classList.remove('active'); 
                }
            } 
        }); 
    }, navSectionObserverOptions); 

    sections.forEach(section => {
        navSectionActiveObserver.observe(section);
    });

    // Počáteční nastavení aktivního odkazu při načtení stránky
    // Zde je potenciální problém: getBoundingClientRect().top nemusí být hned po načtení přesné.
    // Můžeme to odložit nebo použít observer.
    // Lepší je nechat observer, aby se postaral o počáteční stav.
    // Alternativně:
    window.addEventListener('load', () => { // Čekáme na úplné načtení všech zdrojů (včetně obrázků)
        let activeFound = false;
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            // Pokud je sekce nahoře a viditelná, nastav ji jako aktivní
            if (rect.top <= header.offsetHeight + 15 && rect.bottom > header.offsetHeight + 15 && !activeFound) {
                navLinks.forEach(link => link.classList.remove('active'));
                document.querySelector(`nav a[href="#${section.id}"]`)?.classList.add('active');
                activeFound = true;
            }
        });
        // Pokud žádná sekce nebyla nalezena jako aktivní (např. stránka je příliš krátká), nastav první
        if (!activeFound && sections.length > 0) {
            document.querySelector(`nav a[href="#${sections[0].id}"]`)?.classList.add('active');
        }
    });

    // Alternativní (a možná spolehlivější) způsob pro počáteční aktivní stav:
    // Zvolíme sekci, která je nejblíže vrcholu viewportu po plném načtení.
    // Tohle by mělo být obslouženo Intersection Observerem s rootMargin: '-30% 0px -30% 0px'
    // Nicméně, pokud se ti to nezdá spolehlivé, můžeš zkusit následující po DOMContentLoaded:
    // const currentHash = window.location.hash;
    // if (currentHash) {
    //     document.querySelector(`nav a[href="${currentHash}"]`)?.classList.add('active');
    // } else {
    //     // Defaultně aktivuj první odkaz, pokud není hash
    //     if (navLinks.length > 0) {
    //         navLinks[0].classList.add('active');
    //     }
    // }

});
