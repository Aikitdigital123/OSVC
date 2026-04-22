import '../styles/entries/legal.css';
import { getRoot, setDataAttribute, whenDomReady } from '../scripts/core/dom.js';
import { applyFeatureFlags } from '../scripts/core/features.js';
import { applyPageFlags } from '../scripts/core/page-flags.js';
import { applyMediaFlags } from '../scripts/core/media.js';
import { initStickyHeader } from '../scripts/core/sticky-header.js';

const initCoreBootstrap = () => {
    const root = getRoot();

    if (!root || root.dataset.jsRuntime === 'vite-core') {
        return;
    }

    applyPageFlags(root);
    applyFeatureFlags(root);
    applyMediaFlags(root);
    initStickyHeader();
    setDataAttribute(root, 'jsRuntime', 'vite-core');
};

whenDomReady(initCoreBootstrap);
