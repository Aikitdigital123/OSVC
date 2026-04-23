import { getRoot, qsa, setDataAttribute } from '../core/dom.js';

const SECTION_SELECTOR = '.section';

export const initSectionReveal = () => {
    const root = getRoot();

    if (!root || root.dataset.sectionRevealBound === 'true') {
        return false;
    }

    const sections = qsa(SECTION_SELECTOR);
    const supportsIntersectionObserver = typeof window.IntersectionObserver !== 'undefined';

    if (supportsIntersectionObserver) {
        const sectionVisibilityObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1,
            },
        );

        sections.forEach((section) => {
            sectionVisibilityObserver.observe(section);
        });
    } else {
        sections.forEach((section) => section.classList.add('is-visible'));
    }

    setDataAttribute(root, 'sectionRevealBound', true);
    return true;
};
