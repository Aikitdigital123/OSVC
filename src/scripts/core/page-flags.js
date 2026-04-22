import { getBody, setDataAttribute } from './dom.js';

const LEGAL_PAGES = new Set(['privacy', 'terms']);

export const readPageId = (body = getBody()) => {
    const pageId = body?.dataset.page?.trim();
    return pageId || 'unknown';
};

export const getPageKind = (pageId = readPageId()) => {
    if (pageId === 'home') {
        return 'home';
    }

    if (LEGAL_PAGES.has(pageId)) {
        return 'legal';
    }

    return 'unknown';
};

export const getPageFlags = (body = getBody()) => {
    const pageId = readPageId(body);
    const pageKind = getPageKind(pageId);

    return {
        pageId,
        pageKind,
        isHome: pageId === 'home',
        isLegal: pageKind === 'legal'
    };
};

export const applyPageFlags = (target = document.documentElement, body = getBody()) => {
    const flags = getPageFlags(body);

    setDataAttribute(target, 'currentPage', flags.pageId);
    setDataAttribute(target, 'pageKind', flags.pageKind);

    return flags;
};
