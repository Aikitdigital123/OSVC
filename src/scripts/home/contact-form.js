import { getRoot, qsa, setDataAttribute } from '../core/dom.js';
import { t } from '../core/i18n.js';

const CONTACT_FORM_SELECTOR = 'form.contact-form';
const REQUEST_TIMEOUT_MS = 15_000;

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
                statusElement.textContent = t('formSending');
                statusElement.classList.remove('success', 'error');
                statusElement.style.opacity = '1';
            }

            if (submitButton) {
                submitButton.disabled = true;
            }

            let response;
            const controller = new AbortController();
            const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

            try {
                response = await fetch(form.action || 'https://api.web3forms.com/submit', {
                    method: form.method || 'POST',
                    body: formData,
                    headers: {
                        Accept: 'application/json',
                    },
                    signal: controller.signal,
                });
            } catch (error) {
                if (statusElement) {
                    statusElement.textContent = t('formNetworkError');
                    statusElement.classList.add('error');
                }

                console.error('Form submission network error:', error);
            } finally {
                window.clearTimeout(timeoutId);
            }

            try {
                if (response) {
                    const data = await response.json().catch(() => null);

                    if (response.ok && data?.success) {
                        if (statusElement) {
                            statusElement.textContent = t('formSuccess');
                            statusElement.classList.add('success');
                        }

                        form.reset();
                    } else {
                        if (statusElement) {
                            statusElement.textContent = t('formError');
                            statusElement.classList.add('error');
                        }

                        console.error('Web3Forms error:', response.status, data?.message);
                    }
                }
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
