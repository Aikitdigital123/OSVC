# hyndriuk.cz - IT & Digital Solutions

Osobni prezencni web pro hyndriuk.cz. Projekt je staticky web postaveny na Vite,
vanilla HTML, CSS a JavaScriptu. Obsah je v cestine a zameruje se na IT podporu,
digitalni transformaci, automatizaci procesu, robotiku FANUC, webovy vyvoj a
datovou analyzu.

## Lokální spuštění

Vyžadován je Node.js a npm.

```powershell
npm install
npm run dev
```

Produkční build:

```powershell
npm run build
```

Kompletní kontrola projektu:

```powershell
npm run check
```

`npm run check` spouští lint, kontrolu formátování, produkční build a Playwright
smoke testy.

## Důležité příkazy

- `npm run sync:pages` - vygeneruje `privacy.html` a `terms.html` ze šablon.
- `npm run dev` - vygeneruje právní stránky a spustí Vite dev server.
- `npm run build` - vygeneruje právní stránky a vytvoří produkční build do
  `dist/`.
- `npm run test` - spustí Playwright testy.
- `npm run format` - zformátuje zdrojové soubory přes Prettier.

## Struktura projektu

- `index.html` - hlavní stránka webu, včetně sekcí O mně, Služby, Certifikáty,
  kontaktní formulář a kontakt.
- `privacy.html`, `terms.html` - generované právní stránky. Ruční změny v těchto
  souborech se mohou přepsat.
- `src/entries/` - vstupní JavaScript soubory pro hlavní a právní stránky.
- `src/scripts/` - modulární JavaScript pro navigaci, formulář, accordion, loader
  a další chování stránky.
- `src/styles/` - CSS rozdělené na base, layout, komponenty, stránky a entry
  soubory.
- `src/templates/legal/` - zdrojové šablony pro právní stránky.
- `public/` - statické soubory kopírované do buildu beze změny.
- `public/images/backgrounds/` - obrázky pozadí webu.
- `public/images/certificates/` - veřejné soubory certifikátů používané v sekci
  Certifikáty.
- `tools/` - pomocné skripty, aktuálně generování právních stránek.
- `tests/` - Playwright smoke testy.
- `NEW CERIFIKATY/` - dočasná vstupní složka pro nové certifikáty před
  zapracováním do webu.

## Certifikáty

Sekce Certifikáty je v `index.html`. Každá kategorie je samostatná karta
`<div class="card">` s nadpisem `<h4>` a seznamem položek.

Formát položky:

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

Při přidání nového lokálního certifikátu:

1. Vlož zdrojový PDF/JPG soubor do `NEW CERIFIKATY/`.
2. Zkopíruj nebo přesuň finální soubor do `public/images/certificates/`.
3. Použij jednoduchý název souboru bez mezer a diakritiky, například
   `claude-code-in-action.pdf`.
4. Přidej položku do odpovídající kategorie v `index.html`.
5. Spusť `npm run format` a `npm run check`.

Pokud existuje oficiální ověřovací URL certifikátu, preferuj ji jako odkaz.
Lokální PDF nebo obrázek použij tehdy, když ověřovací URL není dostupná nebo má
být certifikát hostovaný přímo na webu.

## Nasazení

Projekt obsahuje GitHub Pages workflow v `.github/workflows/deploy-pages.yml`.
Workflow spouští `npm run check` a publikuje obsah `dist/`.

## Poznámky pro údržbu

- Obsah webu je česky; nové texty drž ve stejném tónu a délce jako okolní obsah.
- U existujících certifikátů neměň odkazy bez ověření.
- Layout a CSS komponenty upravuj jen při skutečné změně vizuálního chování.
- Kontaktní údaje a integrační klíče ve formuláři neměň bez zadání.
