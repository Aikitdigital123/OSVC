export const initAboutAccordion = () => {
    const toggles = document.querySelectorAll('.accordion-toggle');

    toggles.forEach((toggle) => {
        toggle.addEventListener('click', () => {
            const controlsId = toggle.getAttribute('aria-controls');
            const content = document.getElementById(controlsId);
            const textSpan = toggle.querySelector('.toggle-text');

            if (!content) return;

            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

            if (isExpanded) {
                toggle.setAttribute('aria-expanded', 'false');
                if (textSpan) textSpan.textContent = 'Více informací';
                content.classList.remove('is-open');

                const handleTransitionEnd = (e) => {
                    if (e.target === content && e.propertyName === 'grid-template-rows') {
                        if (!content.classList.contains('is-open')) {
                            content.hidden = true;
                        }
                        content.removeEventListener('transitionend', handleTransitionEnd);
                    }
                };
                content.addEventListener('transitionend', handleTransitionEnd);
            } else {
                content.hidden = false;
                // Vynucení reflow pro správné spuštění CSS animace
                void content.offsetHeight;
                toggle.setAttribute('aria-expanded', 'true');
                if (textSpan) textSpan.textContent = 'Skrýt detail';
                content.classList.add('is-open');
            }
        });
    });
};
