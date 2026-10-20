const YEAR_SELECTOR = '[data-current-year]';

export const applyCurrentYear = () => {
    const year = String(new Date().getFullYear());

    document.querySelectorAll(YEAR_SELECTOR).forEach((element) => {
        element.textContent = year;
    });
};
