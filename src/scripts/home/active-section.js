import { getRoot, qsa, setDataAttribute } from '../core/dom.js';
import { getHeaderOffset } from '../core/header-offset.js';

const NAV_LINK_SELECTOR = '.site-nav a[href^="#"]';
const SECTION_SELECTOR = '.section';

const activateLink = (navLinks, sectionId) => {
    if (!sectionId) {
        return;
    }

    navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${sectionId}`;

        link.classList.toggle('active', isActive);

        if (isActive) {
            link.setAttribute('aria-current', 'location');
        } else {
            link.removeAttribute('aria-current');
        }
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
        const visibleSections = new Set();
        const navSectionActiveObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        visibleSections.add(entry.target);
                    } else {
                        visibleSections.delete(entry.target);
                    }
                });

                const activationLine = window.innerHeight * 0.45;
                const activeSection = [...visibleSections].sort(
                    (first, second) =>
                        Math.abs(first.getBoundingClientRect().top - activationLine) -
                        Math.abs(second.getBoundingClientRect().top - activationLine),
                )[0];

                if (activeSection) {
                    activateLink(navLinks, activeSection.id);
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
