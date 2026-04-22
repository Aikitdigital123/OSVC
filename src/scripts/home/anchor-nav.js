import { getRoot, qsa, setDataAttribute } from '../core/dom.js';
import { getScrollTargetPosition } from '../core/header-offset.js';
import { prefersReducedMotion } from '../core/media.js';

const ANCHOR_SELECTOR = 'nav a[href^="#"]';

export const initAnchorNav = () => {
    const root = getRoot();

    if (!root || root.dataset.anchorNavBound === 'true') {
        return false;
    }

    const navLinks = qsa(ANCHOR_SELECTOR);
    const header = document.querySelector('header');
    const reducedMotion = prefersReducedMotion();

    if (navLinks.length === 0) {
        return false;
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (!targetElement) {
                return;
            }

            const scrollToPosition = getScrollTargetPosition(targetElement, header);

            if (reducedMotion) {
                window.scrollTo(0, scrollToPosition);
            } else {
                window.scrollTo({
                    top: scrollToPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    setDataAttribute(root, 'anchorNavBound', true);
    return true;
};
