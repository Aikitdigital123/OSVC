document.addEventListener('DOMContentLoaded', () => {

    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = document.querySelectorAll('.section');
    const contactForms = document.querySelectorAll('form.contact-form');
    const body = document.body; // Pro přístup k body elementu

    // --- Nový wrapper pro fixní pozadí a řešení mobilního pozadí ---
    // Vytvoříme div, který bude držet pozadí, abychom mohli lépe kontrolovat fixed chování
    // a zároveň se vyhnout problémům s body background-attachment na mobilu.
    const fixedBackgroundDiv = document.createElement('div');
    fixedBackgroundDiv.id = 'fixed-background';
    document.body.prepend(fixedBackgroundDiv); // Přidáme ho na začátek body

    // Funkce pro nastavení pozadí pro mobilní zařízení
    function setMobileBackground() {
        const imageUrl = 'https://raw.githubusercontent.com/Aikitdigital123/OSVC/main/images/127.jpg';
        if (window.innerWidth <= 767) { // Používáme stejný breakpoint jako v CSS
            // Na mobilu nastavíme pozadí přímo na body s attachment: fixed
            // a schováme náš #fixed-background div pro desktop.
            body.style.backgroundImage = `url('${imageUrl}')`;
            body.style.backgroundAttachment = 'fixed';
            body.style.backgroundSize = 'cover';
            body.style.backgroundPosition = 'center center';
            if (fixedBackgroundDiv) {
                fixedBackgroundDiv.style.display = 'none';
            }
        } else {
            // Na desktopu a tabletech použijeme #fixed-background div pro paralax
            body.style.backgroundImage = 'none'; // Odstraníme pozadí z body
            body.style.backgroundAttachment = '';
            if (fixedBackgroundDiv) {
                fixedBackgroundDiv.style.display = 'block'; // Zobrazíme div s pozadím
            }
        }
    }

    // Voláme funkci při načtení stránky a při změně velikosti okna
    setMobileBackground();
    window.addEventListener('resize', setMobileBackground);


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

    // --- Efektní načítání sekcí a jejich obsahu při scrollu pomocí Intersection Observer ---
    const sectionObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Sekce se aktivuje, jakmile je 10% její výšky viditelné
    };

    const sectionVisibilityObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Pro animaci vnořených prvků s kaskádovým zpožděním
                animateSectionContent(entry.target);
                // Můžeme odpojit observer, pokud se animace má spustit jen jednou
                // observer.unobserve(entry.target); 
            } else {
                // Volitelné: Pro reset animace při odskrollování pryč (pokud chcete animaci vždy znovu při vstupu)
                // entry.target.classList.remove('is-visible');
                // resetSectionContent(entry.target); // Resetuje vnořené animace
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => {
        sectionVisibilityObserver.observe(section);
    });

    // Funkce pro animaci obsahu uvnitř sekce
    function animateSectionContent(sectionElement) {
        const animatedElements = sectionElement.querySelectorAll('.animated-element');
        const animatedTexts = sectionElement.querySelectorAll('.animated-text');
        const animatedLists = sectionElement.querySelectorAll('.animated-list');

        animatedTexts.forEach((el, index) => {
            el.style.transitionDelay = `${0.2 + index * 0.1}s`; // Postupné zpoždění pro odstavce
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });

        animatedElements.forEach((el, index) => {
            el.style.transitionDelay = `${0.4 + index * 0.15}s`; // Postupné zpoždění pro karty/formulář
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });

        animatedLists.forEach(ul => {
            const listItems = ul.querySelectorAll('li');
            listItems.forEach((li, index) => {
                li.style.transitionDelay = `${0.5 + index * 0.1}s`; // Kaskádové zpoždění pro li
                li.style.opacity = '1';
                li.style.transform = 'translateY(0)';
            });
        });
    }

    // Volitelné: Funkce pro reset animace obsahu
    // function resetSectionContent(sectionElement) {
    //     const animatedElements = sectionElement.querySelectorAll('.animated-element');
    //     const animatedTexts = sectionElement.querySelectorAll('.animated-text');
    //     const animatedLists = sectionElement.querySelectorAll('.animated-list');

    //     animatedTexts.forEach(el => {
    //         el.style.opacity = '0';
    //         el.style.transform = 'translateY(20px)';
    //         el.style.transitionDelay = '0s';
    //     });
    //     animatedElements.forEach(el => {
    //         el.style.opacity = '0';
    //         el.style.transform = 'translateY(20px)';
    //         el.style.transitionDelay = '0s';
    //     });
    //     animatedLists.forEach(ul => {
    //         const listItems = ul.querySelectorAll('li');
    //         listItems.forEach(li => {
    //             li.style.opacity = '0';
    //             li.style.transform = 'translateY(20px)';
    //             li.style.transitionDelay = '0s';
    //         });
    //     });
    // }

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

    // --- Aktivní stav v navigaci při scrollu ---
    const navSectionObserverOptions = {
        root: null,
        rootMargin: '-30% 0px -30% 0px', 
        threshold: 0.2 
    };

    const navSectionActiveObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navLink = document.querySelector(`nav a[href="#${id}"]`);

            if (navLink) {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                } else {
                    // Volitelné: navLink.classList.remove('active'); 
                }
            } 
        }); 
    }, navSectionObserverOptions); 

    sections.forEach(section => {
        navSectionActiveObserver.observe(section);
    });

    // Inicializace aktivní sekce po načtení stránky
    window.addEventListener('load', () => { 
        let activeFound = false;
        const currentHeaderHeight = header ? header.offsetHeight : 0;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= currentHeaderHeight + 15 && rect.bottom > currentHeaderHeight + 15 && !activeFound) {
                navLinks.forEach(link => link.classList.remove('active'));
                document.querySelector(`nav a[href="#${section.id}"]`)?.classList.add('active');
                activeFound = true;
            }
        });
        if (!activeFound && sections.length > 0) {
            document.querySelector(`nav a[href="#${sections[0].id}"]`)?.classList.add('active');
        }
    });

    // --- Mikrointerakce: Jemné zmenšení/zvětšení při kliknutí na navigační odkazy a tlačítka ---
    const clickableElements = document.querySelectorAll('nav a, .btn-main');

    clickableElements.forEach(element => {
        element.addEventListener('mousedown', () => {
            element.style.transform += ' scale(0.98)'; // Jemné zmenšení
            element.style.transition = 'transform 0.1s ease-out';
        });

        element.addEventListener('mouseup', () => {
            // Vrátit původní transform po krátké době
            setTimeout(() => {
                // Odstranit scale, ale ponechat translateY z hover efektu, pokud je
                const currentTransform = element.style.transform;
                const newTransform = currentTransform.replace(/scale\([^)]*\)/, '').trim();
                element.style.transform = newTransform || 'none'; 
            }, 100);
            element.style.transition = ''; // Reset pro navazující animace
        });

        element.addEventListener('mouseleave', () => {
            // Resetovat, pokud myš opustí prvek před mouseup
            const currentTransform = element.style.transform;
            const newTransform = currentTransform.replace(/scale\([^)]*\)/, '').trim();
            element.style.transform = newTransform || 'none';
        });
    });

});
