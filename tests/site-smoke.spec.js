import { expect, test, devices } from '@playwright/test';

const iPhone13 = devices['iPhone 13'];

test('desktop header switches to compact mode after scroll', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    await page.evaluate(() => {
        window.scrollTo(0, 900);
    });

    await expect
        .poll(() => page.evaluate(() => document.documentElement.dataset.headerCompact))
        .toBe('true');
});

test.describe('mobile navigation and loader', () => {
    test.use({
        viewport: iPhone13.viewport,
        userAgent: iPhone13.userAgent,
        deviceScaleFactor: iPhone13.deviceScaleFactor,
        isMobile: iPhone13.isMobile,
        hasTouch: iPhone13.hasTouch,
    });

    test('menu stays usable after scroll and does not lock the page', async ({ page }) => {
        await page.goto('/');

        await page.evaluate(() => {
            window.scrollTo(0, 900);
        });

        const header = page.locator('header');
        const menuButton = page.getByRole('button', { name: 'Menu' });

        await expect(header).toBeVisible();
        await menuButton.click();
        await page.waitForTimeout(150);

        const overflowSnapshot = await page.evaluate(() => ({
            htmlY: getComputedStyle(document.documentElement).overflowY,
            bodyY: getComputedStyle(document.body).overflowY,
        }));

        expect(overflowSnapshot.htmlY).not.toBe('hidden');
        expect(overflowSnapshot.bodyY).not.toBe('hidden');
        await expect(header).toBeVisible();

        const previousScrollPosition = await page.evaluate(() => window.scrollY);

        await page.evaluate(() => {
            window.scrollBy(0, 160);
        });

        await expect
            .poll(() => page.evaluate(() => window.scrollY))
            .toBeGreaterThan(previousScrollPosition);

        await expect
            .poll(() =>
                page.evaluate(() => document.documentElement.dataset.mobileNavOpen ?? 'false'),
            )
            .toBe('false');

        await expect(page.locator('#site-navigation')).toHaveJSProperty('inert', true);
        await expect(header).toBeVisible();
    });

    test('closed menu cannot receive keyboard focus', async ({ page }) => {
        await page.goto('/');

        const navigation = page.locator('#site-navigation');
        const menuButton = page.getByRole('button', { name: 'Menu' });

        await expect(navigation).toHaveJSProperty('inert', true);
        await menuButton.click();
        await expect(navigation).toHaveJSProperty('inert', false);
        await page.keyboard.press('Escape');
        await expect(navigation).toHaveJSProperty('inert', true);
    });

    test('digit loader keeps three visible columns on iPhone portrait', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('.right-digit-loader')).toBeVisible();

        const visibleColumns = await page
            .locator('.digit-column')
            .evaluateAll(
                (elements) =>
                    elements.filter((element) => getComputedStyle(element).display !== 'none')
                        .length,
            );

        expect(visibleColumns).toBe(3);
    });

    test('mobile background safely overlaps every viewport edge', async ({ page }) => {
        await page.goto('/');

        const backgroundLayer = await page.evaluate(() => {
            const body = getComputedStyle(document.body);
            const background = getComputedStyle(document.body, '::before');

            return {
                pageBackground: getComputedStyle(document.documentElement).backgroundColor,
                bodyBackground: body.backgroundColor,
                isolation: body.isolation,
                top: background.top,
                right: background.right,
                bottom: background.bottom,
                left: background.left,
                image: background.backgroundImage,
            };
        });

        expect(backgroundLayer.pageBackground).not.toBe('rgba(0, 0, 0, 0)');
        expect(backgroundLayer.bodyBackground).not.toBe('rgba(0, 0, 0, 0)');
        expect(backgroundLayer.isolation).toBe('isolate');
        expect(backgroundLayer.top).toBe('-2px');
        expect(backgroundLayer.right).toBe('-2px');
        expect(backgroundLayer.bottom).toBe('-2px');
        expect(backgroundLayer.left).toBe('-2px');
        expect(backgroundLayer.image).toContain('127mob');
    });
});

test('generated legal pages keep the shared navigation shell', async ({ page }) => {
    await page.goto('/privacy.html');
    await expect(page.locator('.legal-header .site-nav a')).toHaveCount(2);

    await page.goto('/terms.html');
    await expect(page.locator('.legal-header .site-nav a')).toHaveCount(3);
});

test('homepage exposes social metadata, structured identity and protected contact form', async ({
    page,
}) => {
    await page.goto('/');

    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        'https://hyndriuk.cz/images/og-card.jpg',
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        'content',
        'summary_large_image',
    );

    const structuredData = JSON.parse(
        await page.locator('script[type="application/ld+json"]').textContent(),
    );
    expect(structuredData['@type']).toBe('Person');
    expect(structuredData.name).toBe('Mykhailo Hyndriuk');

    const form = page.locator('.contact-form');
    await expect(form.locator('[name="botcheck"]')).toHaveCount(1);
    await expect(form.locator('.form-privacy-note a')).toHaveAttribute('href', 'privacy.html');
    await expect(form.locator('textarea')).toHaveAttribute('maxlength', '4000');
});

test('english version is linked both ways and uses english interface texts', async ({ page }) => {
    await page.goto('/');
    await page.locator('.lang-switch a[hreflang="en"]').click();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.lang-switch a[aria-current="true"]')).toHaveText('EN');

    const toggle = page.locator('[aria-controls="about-detail-1"]');
    await expect(toggle).toHaveText('More information');
    await toggle.click();
    await expect(toggle).toHaveText('Hide details');

    await page.goto('/en/privacy.html');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.legal-header .site-nav a')).toHaveCount(2);
    await page.locator('.lang-switch a[hreflang="cs"]').click();
    await expect(page).toHaveURL(/\/privacy\.html$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'cs');
});

test('german version uses german interface texts and legal pages', async ({ page }) => {
    await page.goto('/de/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.locator('.lang-switch a')).toHaveCount(4);
    await expect(page.locator('[aria-controls="about-detail-1"]')).toHaveText('Mehr erfahren');

    await page.goto('/de/terms.html');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.locator('.legal-header .site-nav a')).toHaveCount(3);
});

test('ukrainian version uses ukrainian interface texts and legal pages', async ({ page }) => {
    await page.goto('/uk/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await expect(page.locator('.lang-switch a')).toHaveCount(4);
    await expect(page.locator('.lang-switch a[aria-current="true"]')).toHaveText('UA');
    await expect(page.locator('[aria-controls="about-detail-1"]')).toHaveText('Детальніше');

    await page.goto('/uk/privacy.html');
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
    await expect(page.locator('.legal-header .site-nav a')).toHaveCount(2);
});

const LANGUAGES = [
    { code: 'cs', prefix: '/', menu: 'Menu' },
    { code: 'en', prefix: '/en/', menu: 'Menu' },
    { code: 'de', prefix: '/de/', menu: 'Menü' },
    { code: 'uk', prefix: '/uk/', menu: 'Меню' },
];
const DOCUMENTS = ['', 'privacy.html', 'terms.html'];

for (const language of LANGUAGES) {
    for (const documentName of DOCUMENTS) {
        const path = `${language.prefix}${documentName}`;

        test(`${path} has language metadata, canonical and a matching language switch`, async ({
            page,
        }) => {
            await page.goto(path);

            await expect(page.locator('html')).toHaveAttribute('lang', language.code);
            await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
                'href',
                `https://hyndriuk.cz${path}`,
            );
            await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
            await expect(page.locator('header .nav-toggle')).toHaveAttribute(
                'aria-label',
                language.menu,
            );

            const switchLinks = page.locator('.lang-switch a');
            await expect(switchLinks).toHaveCount(LANGUAGES.length);

            for (const target of LANGUAGES) {
                await expect(
                    page.locator(`.lang-switch a[hreflang="${target.code}"]`),
                ).toHaveAttribute('href', `${target.prefix}${documentName}`);
            }

            await expect(page.locator('.lang-switch a[aria-current="true"]')).toHaveAttribute(
                'hreflang',
                language.code,
            );
        });
    }
}
