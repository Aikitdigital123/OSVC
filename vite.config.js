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
            },
        },
    },
});
