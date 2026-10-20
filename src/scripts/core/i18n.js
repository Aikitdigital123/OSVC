const MESSAGES = {
    cs: {
        moreInfo: 'Více informací',
        lessInfo: 'Skrýt detail',
        formSending: 'Odesílám...',
        formSuccess: 'Zpráva byla úspěšně odeslána. Ozvu se vám co nejdříve.',
        formError: 'Chyba při odeslání formuláře. Zkuste to prosím později.',
        formNetworkError: 'Došlo k chybě připojení k serveru. Zkuste to prosím později.',
    },
    en: {
        moreInfo: 'More information',
        lessInfo: 'Hide details',
        formSending: 'Sending...',
        formSuccess: 'Your message has been sent. I will get back to you as soon as possible.',
        formError: 'The form could not be sent. Please try again later.',
        formNetworkError: 'Could not connect to the server. Please try again later.',
    },
};

const DEFAULT_LANGUAGE = 'cs';

export const getLanguage = () => {
    const language = (document.documentElement.lang || DEFAULT_LANGUAGE).slice(0, 2);

    return MESSAGES[language] ? language : DEFAULT_LANGUAGE;
};

export const t = (key) => MESSAGES[getLanguage()][key] ?? MESSAGES[DEFAULT_LANGUAGE][key];
