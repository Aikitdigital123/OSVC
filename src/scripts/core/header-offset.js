import { qs } from './dom.js';

export const HEADER_OFFSET_MARGIN = 15;

export const getHeaderElement = () => qs('header');

export const getHeaderOffset = (header = getHeaderElement()) => {
    const offset = (header ? header.offsetHeight : 0) + HEADER_OFFSET_MARGIN;
    const root = document.documentElement;
    if (root) {
        root.style.setProperty('--header-offset', `${offset}px`);
    }
    return offset;
};

export const getScrollTargetPosition = (targetElement, header = getHeaderElement()) => {
    if (!targetElement) {
        return 0;
    }

    return Math.max(0, targetElement.offsetTop - getHeaderOffset(header));
};
