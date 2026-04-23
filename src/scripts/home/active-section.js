import { getRoot, qsa, setDataAttribute } from '../core/dom.js';
import { getHeaderOffset } from '../core/header-offset.js';

const NAV_LINK_SELECTOR = '.site-nav a[href^="#"]';
const SECTION_SELECTOR = '.section';

const activateLink = (navLinks, sectionId) => {
    if (!sectionId) {
        return;
    }

    navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
    });
};

export const initActiveSection = () => {
    const root = getRoot();

    if (!root || root.dataset.activeSectionBound === 'true') {
        return false;
    }

    const navLinks = qsa(NAV_LINK_SELECTOR);
    const sections = qsa(SECTION_SELECTOR);
    const supportsIntersectionObserver = typeof window.IntersectionObserver !== 'undefined';

    if (supportsIntersectionObserver) {
        const navSectionActiveObserver = new IntersectionObserver(
            (entries) => {
                let activeId = null;

                entries
                    .filter((entry) => entry.isIntersecting)
                    .forEach((entry) => {
                        activeId = entry.target.id;
                    });

                if (activeId) {
                    activateLink(navLinks, activeId);
                }
            },
            {
                root: null,
                rootMargin: '-30% 0px -30% 0px',
                threshold: 0.01,
            },
        );

        sections.forEach((section) => {
            navSectionActiveObserver.observe(section);
        });
    } else {
        const fallbackScrollHandler = () => {
            const scrollPosition = window.scrollY || window.pageYOffset || 0;
            const offset = getHeaderOffset();

            let activeSectionId = null;

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                const top = section.offsetTop;

                if (scrollPosition + offset >= top) {
                    activeSectionId = section.id;
                    break;
                }
            }

            if (!activeSectionId && sections.length > 0) {
                activeSectionId = sections[0].id;
            }

            activateLink(navLinks, activeSectionId);
        };

        window.addEventListener('scroll', fallbackScrollHandler, { passive: true });
        fallbackScrollHandler();
    }

    window.addEventListener(
        'load',
        () => {
            let activeFound = false;
            const offset = getHeaderOffset();

            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();

                if (!activeFound && rect.top <= offset && rect.bottom > offset) {
                    activateLink(navLinks, section.id);
                    activeFound = true;
                }
            });

            if (!activeFound && sections.length > 0) {
                activateLink(navLinks, sections[0].id);
            }
        },
        { once: true },
    );

    setDataAttribute(root, 'activeSectionBound', true);
    return true;
};
