import { getRoot, setDataAttribute } from './dom.js';
import { getHeaderElement, getHeaderOffset } from './header-offset.js';

const COMPACT_SCROLL_THRESHOLD = 24;
const MOBILE_MAX_WIDTH = 768;

const shouldUseCompactHeader = () =>
    window.innerWidth > MOBILE_MAX_WIDTH && window.scrollY > COMPACT_SCROLL_THRESHOLD;

export const initStickyHeader = () => {
    const root = getRoot();
    const header = getHeaderElement();

    if (!root || !header || root.dataset.stickyHeaderBound === 'true') {
        return false;
    }

    let ticking = false;

    const syncHeaderState = () => {
        setDataAttribute(root, 'headerCompact', shouldUseCompactHeader());
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

    syncHeaderState();

    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync, { passive: true });
    window.addEventListener('orientationchange', requestSync);
    window.addEventListener('load', requestSync, { once: true });

    if ('ResizeObserver' in window) {
        const headerResizeObserver = new ResizeObserver(() => {
            getHeaderOffset(header);
        });

        headerResizeObserver.observe(header);
    }

    setDataAttribute(root, 'stickyHeaderBound', true);
    return true;
};
