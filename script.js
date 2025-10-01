'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  const sections = document.querySelectorAll('.section');
  const contactForms = document.querySelectorAll('form.contact-form');

  const supportsSmoothScroll = 'scrollBehavior' in document.documentElement.style;
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const activateLink = (sectionId) => {
    if (!sectionId) {
      return;
    }

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
    });
  };

  // Plynulé scrollování k sekcím s ohledem na pevnou hlavičku
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (!targetElement) {
        return;
      }

      const headerHeight = header ? header.offsetHeight : 0;
      const scrollToPosition = Math.max(0, targetElement.offsetTop - headerHeight - 15);

      if (!supportsSmoothScroll || prefersReducedMotion) {
        window.scrollTo(0, scrollToPosition);
      } else {
        window.scrollTo({
          top: scrollToPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Efektní načítání sekcí při scrollu
  if (supportsIntersectionObserver) {
    const sectionObserverOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const sectionVisibilityObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, sectionObserverOptions);

    sections.forEach((section) => sectionVisibilityObserver.observe(section));

    const navSectionObserverOptions = {
      root: null,
      rootMargin: '-30% 0px -30% 0px',
      threshold: 0.2
    };

    const navSectionActiveObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('id');
        if (!id) {
          return;
        }

        if (entry.isIntersecting) {
          activateLink(id);
        }
      });
    }, navSectionObserverOptions);

    sections.forEach((section) => navSectionActiveObserver.observe(section));
  } else {
    sections.forEach((section) => section.classList.add('is-visible'));

    const fallbackScrollHandler = () => {
      const scrollPosition = window.scrollY || window.pageYOffset || 0;
      const headerHeight = header ? header.offsetHeight : 0;
      const offset = headerHeight + 30;

      let activeSectionId = sections.length ? sections[0].id : null;

      sections.forEach((section) => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const position = scrollPosition + offset;

        if (position >= top && position < bottom) {
          activeSectionId = section.id;
        }
      });

      activateLink(activeSectionId);
    };

    window.addEventListener('scroll', fallbackScrollHandler, { passive: true });
    fallbackScrollHandler();
  }

  // AJAX odesílání formuláře s fallbackem
  contactForms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      if (!window.fetch) {
        return;
      }

      event.preventDefault();

      const statusElement = form.querySelector('.form-status');
      const formData = new FormData(form);

      if (statusElement) {
        statusElement.textContent = 'Odesílám...';
        statusElement.classList.remove('success', 'error');
        statusElement.style.opacity = '1';
      }

      try {
        const response = await fetch(form.action || 'https://api.web3forms.com/submit', {
          method: form.method || 'POST',
          body: formData,
          headers: {
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
          if (statusElement) {
            statusElement.textContent = data.message || 'Chyba při odeslání formuláře. Zkuste to prosím později.';
            statusElement.classList.add('error');
          }
          console.error('Web3Forms error:', data.message);
        }
      } catch (error) {
        if (statusElement) {
          statusElement.textContent = 'Došlo k chybě připojení k serveru. Zkuste to prosím později.';
          statusElement.classList.add('error');
        }
        console.error('Form submission network error:', error);
      }

      if (statusElement) {
        window.setTimeout(() => {
          statusElement.style.opacity = '0';
          window.setTimeout(() => {
            statusElement.textContent = '';
            statusElement.classList.remove('success', 'error');
          }, 300);
        }, 5000);
      }
    });
  });

  // Jemný parallax efekt v hlavičce
  if (header && !prefersReducedMotion) {
    window.addEventListener(
      'scroll',
      () => {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop || 0;
        header.style.backgroundPositionY = `${-scrollPosition * 0.1}px`;
      },
      { passive: true }
    );
  }

  window.addEventListener(
    'load',
    () => {
      let activeFound = false;
      const headerHeight = header ? header.offsetHeight : 0;
      const offset = headerHeight + 15;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (!activeFound && rect.top <= offset && rect.bottom > offset) {
          activateLink(section.id);
          activeFound = true;
        }
      });

      if (!activeFound && sections.length > 0) {
        activateLink(sections[0].id);
      }
    },
    { once: true }
  );
});
