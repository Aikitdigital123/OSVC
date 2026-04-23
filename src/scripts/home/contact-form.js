import { getRoot, qsa, setDataAttribute } from '../core/dom.js';

const CONTACT_FORM_SELECTOR = 'form.contact-form';

export const initContactForms = () => {
    const root = getRoot();

    if (!root || root.dataset.contactFormBound === 'true') {
        return false;
    }

    const contactForms = qsa(CONTACT_FORM_SELECTOR);

    if (contactForms.length === 0) {
        return false;
    }

    contactForms.forEach((form) => {
        form.addEventListener('submit', async (event) => {
            if (!window.fetch) {
                return;
            }

            event.preventDefault();

            const statusElement = form.querySelector('.form-status');
            const submitButton = form.querySelector('.form-submit-btn');
            const formData = new FormData(form);

            if (statusElement) {
                statusElement.textContent = 'Odesílám...';
                statusElement.classList.remove('success', 'error');
                statusElement.style.opacity = '1';
            }

            if (submitButton) {
                submitButton.disabled = true;
            }

            try {
                const response = await fetch(form.action || 'https://api.web3forms.com/submit', {
                    method: form.method || 'POST',
                    body: formData,
                    headers: {
                        Accept: 'application/json',
                    },
                });

                const data = await response.json();

                if (data.success) {
                    if (statusElement) {
                        statusElement.textContent =
                            'Zpráva byla úspěšně odeslána. Ozvu se vám co nejdříve.';
                        statusElement.classList.add('success');
                    }

                    form.reset();
                } else {
                    const errorMessage =
                        data.message || 'Chyba při odeslání formuláře. Zkuste to prosím později.';

                    if (statusElement) {
                        statusElement.textContent = errorMessage;
                        statusElement.classList.add('error');
                    }

                    console.error('Web3Forms error:', errorMessage);
                }
            } catch (error) {
                if (statusElement) {
                    statusElement.textContent =
                        'Došlo k chybě připojení k serveru. Zkuste to prosím později.';
                    statusElement.classList.add('error');
                }

                console.error('Form submission network error:', error);
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                }

                if (statusElement) {
                    window.setTimeout(() => {
                        statusElement.style.opacity = '0';
                        window.setTimeout(() => {
                            statusElement.textContent = '';
                            statusElement.classList.remove('success', 'error');
                        }, 300);
                    }, 5000);
                }
            }
        });
    });

    setDataAttribute(root, 'contactFormBound', true);
    return true;
};
