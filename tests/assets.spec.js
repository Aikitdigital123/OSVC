import { expect, test } from '@playwright/test';

const PAGES = [
    '/',
    '/privacy.html',
    '/terms.html',
    '/en/',
    '/en/privacy.html',
    '/en/terms.html',
    '/de/',
    '/de/privacy.html',
    '/de/terms.html',
    '/uk/',
    '/uk/privacy.html',
    '/uk/terms.html',
];
const BLOCKED_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'api.qrserver.com'];
const VIEWPORT_WIDTHS = [320, 375, 768, 1440];

const collectRequests = (page) => {
    const urls = [];
    page.on('request', (request) => urls.push(request.url()));
    return urls;
};

const loadFully = async (page, path) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
};

for (const path of PAGES) {
    test(`${path} loads no external resources`, async ({ page, baseURL }) => {
        const urls = collectRequests(page);
        await loadFully(page, path);

        const siteOrigin = new URL(baseURL).origin;
        const external = urls.filter(
            (url) => !url.startsWith(siteOrigin) && !url.startsWith('data:'),
        );

        expect(urls.filter((url) => BLOCKED_HOSTS.includes(new URL(url).host))).toEqual([]);
        expect(external).toEqual([]);
    });

    test(`${path} has no horizontal overflow at common widths`, async ({ page }) => {
        for (const width of VIEWPORT_WIDTHS) {
            await page.setViewportSize({ width, height: 900 });
            await page.goto(path, { waitUntil: 'networkidle' });

            const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth - window.innerWidth,
            );
            expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
        }
    });
}

test('ukrainian page renders cyrillic with the self-hosted fonts', async ({ page, baseURL }) => {
    const urls = collectRequests(page);
    await loadFully(page, '/uk/');

    const fontRequests = urls.filter((url) => url.endsWith('.woff2'));
    expect(fontRequests.length).toBeGreaterThan(0);
    expect(fontRequests.every((url) => url.startsWith(new URL(baseURL).origin))).toBe(true);
    expect(fontRequests.some((url) => url.includes('inter-cyrillic'))).toBe(true);
    expect(fontRequests.some((url) => url.includes('roboto-mono-cyrillic'))).toBe(true);

    const rendering = await page.evaluate(() => ({
        bodyFont: getComputedStyle(document.body).fontFamily,
        interCyrillic: document.fonts.check('400 16px Inter', 'Ґанок, їжак, єнот, Привіт'),
        interBold: document.fonts.check('700 16px Inter', 'Ґанок, їжак, єнот'),
        monoCyrillic: document.fonts.check('400 16px "Roboto Mono"', 'Ґанок, їжак, єнот'),
        loadedCyrillicFaces: [...document.fonts].filter(
            (face) => face.status === 'loaded' && /U\+0?400-0?45F/i.test(face.unicodeRange),
        ).length,
    }));

    expect(rendering.bodyFont).toMatch(/^"?Inter"?/);
    expect(rendering.interCyrillic).toBe(true);
    expect(rendering.interBold).toBe(true);
    expect(rendering.monoCyrillic).toBe(true);
    expect(rendering.loadedCyrillicFaces).toBeGreaterThan(0);
});

test('czech and german pages load the latin extended subset', async ({ page }, testInfo) => {
    test.skip(
        testInfo.project.name === 'webkit',
        'WebKit reports false for document.fonts.check with unicode-range subsets.',
    );

    for (const path of ['/', '/de/']) {
        await loadFully(page, path);
        const latinExtendedReady = await page.evaluate(() =>
            document.fonts.check('400 16px Inter', 'Příliš žluťoučký kůň über Größe'),
        );
        expect(latinExtendedReady).toBe(true);
    }
});

test('QR code is a local image that loads', async ({ page }) => {
    for (const path of ['/', '/en/', '/de/', '/uk/']) {
        await loadFully(page, path);
        const qr = page.locator('.qr-code-img');

        await expect(qr).toHaveAttribute('src', '/images/qr-hyndriuk.svg');
        await qr.scrollIntoViewIfNeeded();
        await expect
            .poll(() => qr.evaluate((image) => image.complete && image.naturalWidth > 0))
            .toBe(true);
    }
});

test('optimized visual assets are present and preferred', async ({ page }) => {
    await page.goto('/');

    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundImage);
    expect(background).toContain('127.webp');

    await expect(page.locator('a[href*="fanuc-tp1"]')).toHaveAttribute('href', /fanuc-tp1\.webp$/);
});
