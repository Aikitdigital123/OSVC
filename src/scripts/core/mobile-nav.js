import { getRoot, qs, qsa, setDataAttribute } from './dom.js';

const MOBILE_BREAKPOINT = 768;
const OPEN_STATE_VALUE = 'true';

const getHeaderNav = () => qs('header > .site-nav');
const getNavToggle = () => qs('.nav-toggle');

const isMobileViewport = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;

export const isMobileNavOpen = () => getRoot()?.dataset.mobileNavOpen === OPEN_STATE_VALUE;

export const setMobileNavOpen = (open) => {
    const root = getRoot();
    const nav = getHeaderNav();
    const toggle = getNavToggle();

    if (!root || !nav || !toggle) {
        return false;
    }

    const isOpen = Boolean(open) && isMobileViewport();

    setDataAttribute(root, 'mobileNavOpen', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    nav.setAttribute('aria-hidden', String(!isOpen));
    nav.classList.toggle('is-open', isOpen);
    root.classList.toggle('menu-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    return isOpen;
};

export const closeMobileNav = () => setMobileNavOpen(false);

export const initMobileNav = () => {
    const root = getRoot();
    const nav = getHeaderNav();
    const toggle = getNavToggle();

    if (!root || !nav || !toggle || root.dataset.mobileNavBound === 'true') {
        return false;
    }

    if (!nav.id) {
        nav.id = 'site-navigation';
    }

    toggle.setAttribute('aria-controls', nav.id);
    toggle.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', String(isMobileViewport()));

    const syncViewportState = () => {
        if (isMobileViewport()) {
            nav.setAttribute('aria-hidden', String(!isMobileNavOpen()));
            return;
        }

        closeMobileNav();
        nav.setAttribute('aria-hidden', 'false');
    };

    toggle.addEventListener('click', (event) => {
        event.preventDefault();
        setMobileNavOpen(!isMobileNavOpen());
    });

    qsa('a', nav).forEach((link) => {
        link.addEventListener('click', () => {
            closeMobileNav();
        });
    });

    document.addEventListener('click', (event) => {
        if (!isMobileViewport() || !isMobileNavOpen()) {
            return;
        }

        const target = event.target;
        if (!(target instanceof Node)) {
            return;
        }

        if (nav.contains(target) || toggle.contains(target)) {
            return;
        }

        closeMobileNav();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !isMobileNavOpen()) {
            return;
        }

        closeMobileNav();
        toggle.focus();
    });

    window.addEventListener('resize', syncViewportState, { passive: true });
    window.addEventListener('orientationchange', syncViewportState);

    syncViewportState();
    setDataAttribute(root, 'mobileNavBound', true);
    return true;
};
