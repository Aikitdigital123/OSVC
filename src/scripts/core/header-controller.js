import { getRoot, qs, qsa, setDataAttribute } from './dom.js';
import { getHeaderElement, getHeaderOffset } from './header-offset.js';

const COMPACT_SCROLL_THRESHOLD = 24;
const MOBILE_BREAKPOINT = 768;
const HEADER_NAV_SELECTOR = 'header > .site-nav';
const HEADER_TOGGLE_SELECTOR = 'header > .nav-toggle';
const MOBILE_NAV_OPEN_VALUE = 'true';

const getHeaderNav = () => qs(HEADER_NAV_SELECTOR);
const getHeaderToggle = () => qs(HEADER_TOGGLE_SELECTOR);

const isMobileViewport = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;

const shouldUseCompactHeader = () =>
    window.innerWidth > MOBILE_BREAKPOINT && window.scrollY > COMPACT_SCROLL_THRESHOLD;

export const isHeaderNavOpen = () => getRoot()?.dataset.mobileNavOpen === MOBILE_NAV_OPEN_VALUE;

export const setHeaderNavOpen = (open) => {
    const root = getRoot();
    const nav = getHeaderNav();
    const toggle = getHeaderToggle();

    if (!root || !nav || !toggle) {
        return false;
    }

    const isOpen = Boolean(open) && isMobileViewport();

    setDataAttribute(root, 'mobileNavOpen', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    nav.setAttribute('aria-hidden', String(!isOpen));
    nav.classList.toggle('is-open', isOpen);
    return isOpen;
};

export const closeHeaderNav = () => setHeaderNavOpen(false);

export const initHeaderController = () => {
    const root = getRoot();
    const header = getHeaderElement();
    const nav = getHeaderNav();
    const toggle = getHeaderToggle();

    if (!root || !header || !nav || !toggle || root.dataset.headerControllerBound === 'true') {
        return false;
    }

    if (!nav.id) {
        nav.id = 'site-navigation';
    }

    toggle.setAttribute('aria-controls', nav.id);
    toggle.setAttribute('aria-expanded', 'false');

    let ticking = false;

    const syncHeaderState = () => {
        const mobile = isMobileViewport();

        setDataAttribute(root, 'headerCompact', shouldUseCompactHeader());

        if (!mobile && isHeaderNavOpen()) {
            closeHeaderNav();
        }

        nav.setAttribute('aria-hidden', String(mobile ? !isHeaderNavOpen() : false));
        getHeaderOffset(header);
    };

    const requestSync = () => {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(() => {
            syncHeaderState();
            ticking = false;
        });
    };

    toggle.addEventListener('click', (event) => {
        event.preventDefault();
        setHeaderNavOpen(!isHeaderNavOpen());
        requestSync();
    });

    qsa('a', nav).forEach((link) => {
        link.addEventListener('click', () => {
            closeHeaderNav();
            requestSync();
        });
    });

    document.addEventListener('click', (event) => {
        if (!isMobileViewport() || !isHeaderNavOpen()) {
            return;
        }

        const target = event.target;
        if (!(target instanceof Node)) {
            return;
        }

        if (nav.contains(target) || toggle.contains(target)) {
            return;
        }

        closeHeaderNav();
        requestSync();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !isHeaderNavOpen()) {
            return;
        }

        closeHeaderNav();
        toggle.focus();
        requestSync();
    });

    window.addEventListener(
        'scroll',
        () => {
            if (isMobileViewport() && isHeaderNavOpen()) {
                closeHeaderNav();
            }

            requestSync();
        },
        { passive: true },
    );

    window.addEventListener('resize', requestSync, { passive: true });
    window.addEventListener('orientationchange', requestSync);
    window.addEventListener('load', requestSync, { once: true });

    if ('ResizeObserver' in window) {
        const headerResizeObserver = new ResizeObserver(() => {
            getHeaderOffset(header);
        });

        headerResizeObserver.observe(header);
    }

    syncHeaderState();
    setDataAttribute(root, 'headerControllerBound', true);
    return true;
};
