import '../styles/entries/home.css';
import { getRoot, setDataAttribute, whenDomReady } from '../scripts/core/dom.js';
import { applyFeatureFlags } from '../scripts/core/features.js';
import { applyPageFlags } from '../scripts/core/page-flags.js';
import { applyMediaFlags } from '../scripts/core/media.js';
import { initStickyHeader } from '../scripts/core/sticky-header.js';
import { initAnchorNav } from '../scripts/home/anchor-nav.js';
import { initSectionReveal } from '../scripts/home/section-reveal.js';
import { initActiveSection } from '../scripts/home/active-section.js';
import { initContactForms } from '../scripts/home/contact-form.js';
import { initDigitLoader } from '../scripts/home/digit-loader.js';
import { initAboutAccordion } from '../scripts/home/about-accordion.js';

const root = getRoot();

if (root) {
    setDataAttribute(root, 'anchorNavRuntime', 'vite');
    setDataAttribute(root, 'sectionRevealRuntime', 'vite');
    setDataAttribute(root, 'activeSectionRuntime', 'vite');
    setDataAttribute(root, 'contactFormRuntime', 'vite');
    setDataAttribute(root, 'digitLoaderRuntime', 'vite');
}

const initCoreBootstrap = () => {
    if (!root || root.dataset.jsRuntime === 'vite-core') {
        return;
    }

    applyPageFlags(root);
    applyFeatureFlags(root);
    applyMediaFlags(root);
    setDataAttribute(root, 'jsRuntime', 'vite-core');
};

const initHomeEntry = () => {
    initCoreBootstrap();
    initStickyHeader();
    initAnchorNav();
    initSectionReveal();
    initActiveSection();
    initContactForms();
    initDigitLoader();
    initAboutAccordion();
};

whenDomReady(initHomeEntry);
