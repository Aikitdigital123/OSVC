import '../styles/entries/legal.css';
import { getRoot, setDataAttribute, whenDomReady } from '../scripts/core/dom.js';
import { applyFeatureFlags } from '../scripts/core/features.js';
import { initHeaderController } from '../scripts/core/header-controller.js';
import { applyPageFlags } from '../scripts/core/page-flags.js';
import { applyMediaFlags } from '../scripts/core/media.js';
import { applyCurrentYear } from '../scripts/core/current-year.js';

const initCoreBootstrap = () => {
    const root = getRoot();

    if (!root || root.dataset.jsRuntime === 'vite-core') {
        return;
    }

    applyPageFlags(root);
    applyFeatureFlags(root);
    applyMediaFlags(root);
    initHeaderController();
    applyCurrentYear();
    setDataAttribute(root, 'jsRuntime', 'vite-core');
};

whenDomReady(initCoreBootstrap);
