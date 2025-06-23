// Očekává, že se celý DOM načte, než začne manipulovat s elementy
document.addEventListener('DOMContentLoaded', () => {

    // Získáme referenci na header element HNED NA ZAČÁTKU
    // Je potřeba pro logiku plynulého skrolování
    const header = document.querySelector('header');

    // --- Plynulé skrolování k sekcím s ohledem na pevnou hlavičku ---
    // Toto je nová část kódu pro řešení překrývání nadpisů.
    const navLinks = document.querySelectorAll('nav a[href^="#"]'); // Vybere všechny navigační odkazy směřující na ID

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Zabrání výchozímu chování odkazu (okamžitému skoku)

            const targetId = this.getAttribute('href'); // Získá ID cíle (např. "#kontakt")
            const targetElement = document.querySelector(targetId); // Najde cílový element

            if (targetElement) {
                // Zjistí skutečnou výšku hlavičky za běhu, pro maximální přesnost
                // .offsetHeight zahrnuje padding a border
                const headerHeight = header ? header.offsetHeight : 0; // Zabezpečení pro případ, že header neexistuje

                // Výpočet pozice: vzdálenost elementu od shora - výška hlavičky - nějaká rezerva
                // Přidáváme 15px rezervu, aby nadpis nebyl schovaný
                const scrollToPosition = targetElement.offsetTop - headerHeight - 15;

                window.scrollTo({
                    top: scrollToPosition,
                    behavior: 'smooth' // Plynulé skrolování pomocí JavaScriptu
                });
            }
        });
    });

    // --- Efektní načítání sekcí při scrollu pomocí Intersection Observer ---
    const sections = document.querySelectorAll('.section');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // --- Vylepšené odesílání formuláře (AJAX s fetch API) ---
    const contactForms = document.querySelectorAll('form.contact-form');

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
                const response = await fetch(form.action, {
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
                        statusDiv.textContent = data.message || "Chyba při odesílání. Prosím, zkuste to znovu.";
                        statusDiv.classList.add('error');
                    }
                    console.error('Web3Forms error:', data.message);
                }
            } catch (error) {
                if (statusDiv) {
                    statusDiv.textContent = "Došlo k chybě připojení. Prosím, zkuste to znovu později.";
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
            const scrollPosition = window.pageYOffset;
            header.style.backgroundPositionY = `${-scrollPosition * 0.1}px`;
        });
    }

    // --- Aktivní stav v navigaci při scrollu ---
    // (Používá navLinks, které jsou definovány i pro smooth scrolling)

    // Upravená Intersection Observer pro navigaci
    const navObserverOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Nastaví trigger uprostřed viewportu
        threshold: 0
    };

    const navSectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = document.querySelector(`nav a[href="#${id}"]`);

            if (navLink) {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    }, navObserverOptions);

    sections.forEach(section => {
        navSectionObserver.observe(section);
    });

    // Počáteční nastavení aktivního odkazu při načtení stránky
    const firstSection = document.querySelector('.section');
    if (firstSection && firstSection.getBoundingClientRect().top < window.innerHeight - 100) {
        document.querySelector('nav a[href="#' + firstSection.id + '"]')?.classList.add('active');
    }
});
