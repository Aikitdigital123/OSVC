// Očekává, že se celý DOM načte, než začne manipulovat s elementy
document.addEventListener('DOMContentLoaded', () => {

    // --- Efektní načítání sekcí při scrollu pomocí Intersection Observer ---
    // Intersection Observer je moderní API, které efektivně sleduje,
    // zda se element stal viditelným (nebo se k tomu blíží) v zorném poli uživatele.
    // Je mnohem výkonnější než poslouchání události 'scroll'.

    const sections = document.querySelectorAll('.section');

    // Možnosti pro Intersection Observer
    const observerOptions = {
        root: null, // Sleduje viditelnost vzhledem k viewportu
        rootMargin: '0px', // Žádná extra mezera kolem viewportu
        threshold: 0.1 // Spustí callback, jakmile je 10% elementu viditelných
    };

    // Callback funkce, která se spustí, když se změní viditelnost elementu
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Pokud je sekce viditelná, přidáme třídu 'is-visible',
                // která v CSS spustí animaci opacity a transform
                entry.target.classList.add('is-visible');
                // Jakmile je sekce animována, můžeme ji přestat sledovat
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Začneme sledovat všechny sekce
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // --- Vylepšené odesílání formuláře (AJAX s fetch API) ---
    // Tento skript zachytí odeslání formuláře, odešle data asynchronně
    // a poskytne uživateli zpětnou vazbu bez přenačítání stránky.

    const contactForms = document.querySelectorAll('form.contact-form');

    contactForms.forEach(form => {
        form.addEventListener('submit', async function(event) {
            // Zabráníme výchozímu chování odeslání formuláře (tj. přenačítání stránky)
            event.preventDefault();

            const statusDiv = form.querySelector("#form-status");
            const formData = new FormData(form);

            // Zobrazíme zprávu "Odesílám..." a odstraníme předchozí stavy
            if (statusDiv) {
                statusDiv.textContent = "Odesílám...";
                statusDiv.classList.remove('success', 'error'); // Odstraní předchozí barvy
                statusDiv.style.opacity = '1'; // Zajištění viditelnosti
            }

            try {
                // Odeslání dat formuláře pomocí fetch API
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Důležité pro příjem JSON odpovědi
                    }
                });

                // Zpracování odpovědi z Web3Forms
                const data = await response.json();

                if (data.success) {
                    // Úspěšné odeslání
                    if (statusDiv) {
                        statusDiv.textContent = "Zpráva byla úspěšně odeslána! Ozvu se vám co nejdříve.";
                        statusDiv.classList.add('success'); // Přidá zelený styl
                    }
                    form.reset(); // Vyčistí všechna pole formuláře
                } else {
                    // Chyba při odesílání (např. neplatný access key, spam)
                    if (statusDiv) {
                        statusDiv.textContent = data.message || "Chyba při odesílání. Prosím, zkuste to znovu.";
                        statusDiv.classList.add('error'); // Přidá červený styl
                    }
                    console.error('Web3Forms error:', data.message);
                }
            } catch (error) {
                // Chyba připojení k síti nebo jiná neočekávaná chyba
                if (statusDiv) {
                    statusDiv.textContent = "Došlo k chybě připojení. Prosím, zkuste to znovu později.";
                    statusDiv.classList.add('error'); // Přidá červený styl
                }
                console.error('Form submission network error:', error);
            }
            
            // Zpráva se po 5 sekundách skryje
            setTimeout(() => {
                if (statusDiv) {
                    statusDiv.style.opacity = '0';
                    setTimeout(() => {
                        statusDiv.textContent = "";
                        statusDiv.classList.remove('success', 'error');
                    }, 300); // Počkejte na dokončení fade-out animace před vyčištěním textu
                }
            }, 5000); // Zpráva zůstane viditelná 5 sekund
        });
    });

    // --- Jemný efekt posunu pozadí hlavičky při scrollu (Parallax like) ---
    // Tento efekt dodá hlavičce dynamický vizuální prvek.

    const header = document.querySelector('header');

    if (header) { // Zkontrolujte, zda element header existuje
        window.addEventListener('scroll', () => {
            // Vypočítáme posun pozadí na základě pozice scrollu
            // Čím rychleji se scrolluje, tím rychleji se pozadí posouvá
            const scrollPosition = window.pageYOffset;
            header.style.backgroundPositionY = `${-scrollPosition * 0.1}px`; // Hodnota 0.1 určuje rychlost efektu
        });
    }

    // --- Aktivní stav v navigaci při scrollu ---
    // Zvýrazní aktuální sekci v navigaci

    const navLinks = document.querySelectorAll('nav a');

    // Upravená Intersection Observer pro navigaci
    const navObserverOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Nastaví trigger uprostřed viewportu
        threshold: 0 // Nemusí být viditelný, stačí procházet středem
    };

    const navSectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = document.querySelector(`nav a[href="#${id}"]`);

            if (navLink) { // Zkontrolujeme, zda navLink existuje
                if (entry.isIntersecting) {
                    navLinks.forEach(link => link.classList.remove('active')); // Odebere aktivní třídu ze všech
                    navLink.classList.add('active'); // Přidá aktivní třídu aktuálnímu odkazu
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
