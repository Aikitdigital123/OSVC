import { setDataAttribute } from './dom.js';

const supportsCssRule = (rule) => {
    if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
        return false;
    }

    return CSS.supports(rule);
};

export const getFeatureFlags = () => ({
    intersectionObserver: typeof window.IntersectionObserver !== 'undefined',
    fetch: typeof window.fetch === 'function',
    matchMedia: typeof window.matchMedia === 'function',
    backdropFilter:
        supportsCssRule('backdrop-filter: blur(1px)') ||
        supportsCssRule('-webkit-backdrop-filter: blur(1px)')
});

export const applyFeatureFlags = (target = document.documentElement) => {
    const flags = getFeatureFlags();

    setDataAttribute(target, 'hasIntersectionObserver', flags.intersectionObserver);
    setDataAttribute(target, 'hasFetch', flags.fetch);
    setDataAttribute(target, 'hasMatchMedia', flags.matchMedia);
    setDataAttribute(target, 'hasBackdropFilter', flags.backdropFilter);

    return flags;
};
