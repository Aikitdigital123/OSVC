# AI Brief pro hyndriuk.cz

Tento soubor slouží jako krátký kontext pro AI asistenty pracující na projektu
OSVC-main / hyndriuk.cz.

## Projekt

- Statický osobní web `hyndriuk.cz - IT & Digital Solutions`.
- Stack: Vite, vanilla HTML, CSS a JavaScript, bez frontend frameworku.
- Jazyk veřejného obsahu: čeština (hlavní) a angličtina (`en/`).
- Hlavní stránka: `index.html`.
- Právní stránky: `privacy.html` a `terms.html`, generované z
  `src/templates/legal/` přes `tools/sync-pages.mjs`.

## Jazykové verze

- Čeština je v kořeni (`index.html`, `privacy.html`, `terms.html`), další jazyky v
  podsložkách: angličtina `en/` (`en/index.html`, `en/privacy.html`, `en/terms.html`).
- Změnu obsahu hlavní stránky proveď ve všech jazykových verzích `index.html`.
- Právní stránky všech jazyků generuje `tools/sync-pages.mjs` (seznam `languages` a `legalPages`);
  obsah je v `src/templates/legal/*-content.html` (čeština) a `*-content.<jazyk>.html`.
  Závazná je česká verze, překlady to uvádějí na začátku.
- Texty v JavaScriptu (formulář, rozbalovací bloky) jsou v `src/scripts/core/i18n.js`.
- Přepínač jazyků `.lang-switch` je v hlavičce každé stránky; při přidání jazyka doplň odkaz do
  všech stránek, `hreflang` odkazy v `<head>`, `public/sitemap.xml` a vstupy ve `vite.config.js`.
- Na stránkách v podsložkách používej absolutní cesty k souborům (`/images/...`).

## Důležité soubory

- `index.html` - hlavní obsah webu. Sekce Certifikáty je zde.
- `src/styles/` - CSS rozdělené podle účelu; drž existující členění.
- `src/scripts/` - JavaScript moduly pro interakce na stránce.
- `public/images/backgrounds/` - obrázky pozadí.
- `public/images/certificates/` - certifikáty dostupné z webu.
- `NEW CERIFIKATY/` - dočasná vstupní složka pro nové certifikáty před
  přesunutím nebo zkopírováním do `public/images/certificates/`.
- `tests/` - Playwright smoke testy.

## Pravidla úprav

- Zachovej existující layout, strukturu sekcí a vizuální styl, pokud zadání
  výslovně nepožaduje redesign.
- Texty piš česky, věcně a konzistentně s okolním obsahem.
- Nepřepisuj kontaktní údaje, formulářové klíče ani externí odkazy bez jasného
  zadání.
- Neměň generované `privacy.html` a `terms.html` ručně, pokud změna patří do
  šablon v `src/templates/legal/`.
- Pro lokální soubory používej názvy bez mezer a diakritiky.
- Po úpravě HTML/CSS/JS spusť `npm run format` a ideálně `npm run check`.

## Certifikáty

Certifikáty jsou v `index.html` v sekci `#certificates`. Každá kategorie má:

- `<div class="card">`
- `<h4>Název kategorie</h4>`
- `<ul>` s položkami `<li>`

Formát položky drž takto:

```html
<li>
    <b>Název kurzu</b> (Vydavatel)
    <br />
    Obsah: Krátký popis certifikátu.
    <br />
    <a href="..." target="_blank" rel="noopener noreferrer" class="certificate-verify-link">
        Otevřít certifikát
    </a>
</li>
```

Kategorie používané v projektu:

- AI a automatizace vývoje
- Průmyslová automatizace a robotika
- Webový vývoj a programování
- Datová analýza a IT systémy

U existujících certifikátů neměň odkazy, pokud zadání neříká jinak. U nových
certifikátů preferuj oficiální ověřovací URL; pokud není dostupná, použij
lokální soubor v `public/images/certificates/`.
