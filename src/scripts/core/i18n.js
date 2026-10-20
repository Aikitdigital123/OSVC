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
    de: {
        moreInfo: 'Mehr erfahren',
        lessInfo: 'Details ausblenden',
        formSending: 'Wird gesendet...',
        formSuccess: 'Ihre Nachricht wurde gesendet. Ich melde mich so schnell wie möglich.',
        formError:
            'Das Formular konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.',
        formNetworkError: 'Keine Verbindung zum Server. Bitte versuchen Sie es später erneut.',
    },
    uk: {
        moreInfo: 'Детальніше',
        lessInfo: 'Приховати деталі',
        formSending: 'Надсилаю...',
        formSuccess: 'Повідомлення успішно надіслано. Я зв’яжуся з вами якнайшвидше.',
        formError: 'Не вдалося надіслати форму. Спробуйте, будь ласка, пізніше.',
        formNetworkError: 'Помилка з’єднання із сервером. Спробуйте, будь ласка, пізніше.',
    },
};

const DEFAULT_LANGUAGE = 'cs';

export const getLanguage = () => {
    const language = (document.documentElement.lang || DEFAULT_LANGUAGE).slice(0, 2);

    return MESSAGES[language] ? language : DEFAULT_LANGUAGE;
};

export const t = (key) => MESSAGES[getLanguage()][key] ?? MESSAGES[DEFAULT_LANGUAGE][key];
