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
