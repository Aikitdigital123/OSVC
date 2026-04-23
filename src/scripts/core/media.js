import { setDataAttribute } from './dom.js';

const getMediaQueryList = (query) => {
    if (typeof window.matchMedia !== 'function') {
        return null;
    }

    return window.matchMedia(query);
};

export const prefersReducedMotion = () =>
    getMediaQueryList('(prefers-reduced-motion: reduce)')?.matches ?? false;

export const hasCoarsePointer = () => getMediaQueryList('(pointer: coarse)')?.matches ?? false;

export const hasHover = () => getMediaQueryList('(hover: hover)')?.matches ?? false;

export const hasTouchInput = () => {
    if (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) {
        return true;
    }

    return 'ontouchstart' in window;
};

export const getMediaFlags = () => ({
    prefersReducedMotion: prefersReducedMotion(),
    coarsePointer: hasCoarsePointer(),
    hover: hasHover(),
    touchInput: hasTouchInput(),
});

export const applyMediaFlags = (target = document.documentElement) => {
    const flags = getMediaFlags();

    setDataAttribute(target, 'reducedMotion', flags.prefersReducedMotion);
    setDataAttribute(target, 'coarsePointer', flags.coarsePointer);
    setDataAttribute(target, 'touchInput', flags.touchInput);
    setDataAttribute(target, 'hoverAvailable', flags.hover);

    return flags;
};
