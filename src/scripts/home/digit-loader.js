export const initDigitLoader = () => {
    const loader = document.querySelector('.right-digit-loader');
    if (!loader) {
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        loader.style.display = 'none';
        return;
    }

    const randomDigit = () => (Math.random() > 0.5 ? '1' : '0');

    loader.querySelectorAll('.digit-column').forEach((column) => {
        const fallStack = column.querySelector('.digit-stack--fall');
        const baseStack = column.querySelector('.digit-stack--base');

        if (!fallStack || !baseStack) {
            return;
        }

        const fallingDigits = Array.from(fallStack.querySelectorAll('span'))
            .filter((span) => span instanceof HTMLElement);
        const baseDigits = Array.from(baseStack.querySelectorAll('span'))
            .filter((span) => span instanceof HTMLElement);

        const randomizeFalling = () => {
            fallingDigits.forEach((span) => {
                span.textContent = randomDigit();
            });
        };

        const syncBaseWithFall = () => {
            fallingDigits.forEach((span, index) => {
                if (baseDigits[index]) {
                    baseDigits[index].textContent = span.textContent;
                }
            });
        };

        randomizeFalling();
        syncBaseWithFall();

        fallStack.addEventListener('animationiteration', () => {
            syncBaseWithFall();
            randomizeFalling();
        });
    });
};