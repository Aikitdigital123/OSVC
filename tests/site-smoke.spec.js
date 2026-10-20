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

        await expect(header).toBeVisible();
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
});

test('generated legal pages keep the shared navigation shell', async ({ page }) => {
    await page.goto('/privacy.html');
    await expect(page.locator('.legal-header .site-nav a')).toHaveCount(2);

    await page.goto('/terms.html');
    await expect(page.locator('.legal-header .site-nav a')).toHaveCount(3);
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
