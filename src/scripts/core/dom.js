export const getRoot = () => document.documentElement;

export const getBody = () => document.body;

export const qs = (selector, scope = document) => scope.querySelector(selector);

export const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

export const whenDomReady = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback, { once: true });
        return;
    }

    callback();
};

export const setDataAttribute = (element, name, value) => {
    if (!element) {
        return null;
    }

    const normalizedValue = String(value);
    element.dataset[name] = normalizedValue;
    return normalizedValue;
};
