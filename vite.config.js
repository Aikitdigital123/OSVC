import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                privacy: resolve(__dirname, 'privacy.html'),
                terms: resolve(__dirname, 'terms.html'),
                mainEn: resolve(__dirname, 'en/index.html'),
                privacyEn: resolve(__dirname, 'en/privacy.html'),
                termsEn: resolve(__dirname, 'en/terms.html'),
                mainDe: resolve(__dirname, 'de/index.html'),
                privacyDe: resolve(__dirname, 'de/privacy.html'),
                termsDe: resolve(__dirname, 'de/terms.html'),
                mainUk: resolve(__dirname, 'uk/index.html'),
                privacyUk: resolve(__dirname, 'uk/privacy.html'),
                termsUk: resolve(__dirname, 'uk/terms.html'),
            },
        },
    },
});
