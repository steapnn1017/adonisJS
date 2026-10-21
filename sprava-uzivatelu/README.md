# Správa uživatelů (AdonisJS 7)

Testovací projekt na vyzkoušení AdonisJS. Admin vidí všechny účty, může je hledat, filtrovat, zakládat, upravovat, blokovat a mazat. Běžný uživatel vidí jen svůj účet a nastavení.

V projektu je jen to, co je potřeba ke spuštění. Každý soubor má nahoře komentář, co dělá a kdo ho volá. Tady je mapa, kde co hledat.

## Spuštění

Potřebuješ **Node.js 24** (přes nvm: `nvm use 24`).

```bash
npm install
cp .env.example .env        # jen poprvé
node ace generate:key       # jen poprvé, vyplní APP_KEY v .env
node ace migration:run      # vytvoří tabulku users
node ace db:seed            # nahraje 14 testovacích uživatelů
npm run dev                 # http://localhost:3333
```

Testovací účty, všechny s heslem `heslo1234`:

| E-mail | Co to je |
| --- | --- |
| admin@test.cz | administrátor, vidí správu uživatelů |
| uzivatel@test.cz | běžný uživatel |
| blokovany@test.cz | zablokovaný účet, nepřihlásí se |

## Kde co najdu

### Podle funkce

| Chci najít… | Soubor |
| --- | --- |
| všechny adresy (URL) aplikace | `start/routes.ts` |
| přihlášení a odhlášení | `app/controllers/session_controller.ts` + `resources/views/pages/login.edge` |
| přehled (statistiky pro admina) | `app/controllers/dashboard_controller.ts` + `resources/views/pages/dashboard.edge` |
| seznam, hledání, filtry, stránkování | `app/controllers/users_controller.ts` → `index()` + `resources/views/pages/users/index.edge` |
| založení / úprava / smazání uživatele | `app/controllers/users_controller.ts` → `store()`, `update()`, `destroy()` |
| formulář uživatele (pole) | `resources/views/partials/user_form.edge` |
| ochrana „admin nesmaže / nezablokuje sám sebe“ | `app/controllers/users_controller.ts` → `update()` a `destroy()` |
| změna vlastního jména a e-mailu | `app/controllers/profile_controller.ts` + `resources/views/pages/settings/profile.edge` |
| změna vlastního hesla | `app/controllers/password_controller.ts` + `resources/views/pages/settings/password.edge` |
| kdo smí kam (přihlášený / admin / host) | `app/middleware/auth_middleware.ts`, `admin_middleware.ts`, `guest_middleware.ts` |
| okamžité odhlášení zablokovaného | `app/middleware/auth_middleware.ts` |
| pravidla formulářů (povinné, délka…) | `app/validators/user.ts` |
| české texty chyb validace | `start/validator.ts` |
| co se stane při chybě | `app/exceptions/handler.ts` |
| model uživatele (isAdmin, iniciály) | `app/models/user.ts` |
| sloupce tabulky users | `database/migrations/1758943358073_create_users_table.ts` |
| testovací data | `database/seeders/user_seeder.ts` |
| datum česky, „před 3 dny“, skloňování | `start/view.ts` |
| hlavička, navigace, layout stránky | `resources/views/components/layouts/app.edge` |
| jedno pole formuláře (popisek + chyba) | `resources/views/components/field.edge` |
| zelené/červené hlášky nahoře | `resources/views/partials/flash_alerts.edge` |
| přepínač motivu, dialog mazání (JS) | `resources/js/app.js` |
| barvy, písmo, všechny styly | `resources/css/app.css` (barvy jsou nahoře v `:root`) |

### Podle složky

| Složka / soubor | Co v ní je |
| --- | --- |
| `app/controllers/` | logika stránek: načte data, zavolá validátor, uloží, vybere šablonu |
| `app/middleware/` | kontroly před controllerem (přihlášení, admin, host) |
| `app/models/` | model `User` (práce s tabulkou users) |
| `app/validators/` | pravidla pro data z formulářů |
| `app/exceptions/` | zpracování chyb (přesměrování, ladicí stránka) |
| `start/` | načte se při startu: routy, middleware, hlášky validace, helpery šablon, `.env` |
| `config/` | nastavení balíčků (databáze, session, hesla, bezpečnost…) |
| `database/migrations/` | popis tabulky users |
| `database/schema.ts` | **generuje se sám** po migraci, needitovat |
| `database/seeders/` | testovací data |
| `resources/views/pages/` | šablony stránek (jedna stránka = jeden soubor) |
| `resources/views/components/` | znovupoužitelné kousky: layouty, pole formuláře, logo… |
| `resources/views/partials/` | kousky vkládané přes `@include` (formulář uživatele, hlášky, štítky) |
| `resources/css/`, `resources/js/` | styly a JavaScript pro prohlížeč |
| `bin/`, `ace.js` | spouštěče serveru a příkazů `node ace` (needitují se) |
| `adonisrc.ts` | co AdonisJS načte při startu |
| `vite.config.ts` | nastavení Vite (zpracování CSS a JS) |
| `tsconfig.json` | nastavení TypeScriptu |
| `.env.example` | vzor souboru `.env` (port, tajný klíč…) |
| `tmp/` | SQLite databáze `db.sqlite3` |
| `.adonisjs/` | typy rout, **generuje se samo** při `npm run dev`, needitovat |

Soubory bez komentářů a proč: `package.json` (formát JSON komentáře nedovoluje), `database/schema.ts` a `.adonisjs/` (generují se, komentáře by se přepsaly), `package-lock.json` (generuje npm).

`package.json` stručně: `scripts` jsou příkazy pro `npm run …` (tabulka dole), `imports` jsou zkratky cest, takže v kódu jde psát `#models/user` místo `../../app/models/user.js`.

## Jak jde jeden požadavek (příklad: admin uloží úpravu)

1. Formulář v `pages/users/edit.edge` pošle `POST /users/5?_method=PUT` (HTML formulář neumí PUT, `?_method` to obejde).
2. `start/routes.ts` najde routu `users.update` → `UsersController.update`.
3. Middleware z `start/kernel.ts`: přečte data, session, zkontroluje CSRF token. Pak `auth` (je přihlášený a aktivní?) a `admin` (je admin?).
4. `UsersController.update` zvaliduje data přes `updateUserValidator`. Když nesedí, AdonisJS sám vrátí formulář s chybami pod poli.
5. Kontrola, že admin neodebírá roli sám sobě, uložení do DB, flash hláška „Změny byly uloženy.“, přesměrování na seznam.

## Příkazy

```bash
npm run dev                       # vývojový server, po změně sám obnoví stránku
npm run typecheck                 # kontrola TypeScriptu
node ace list:routes              # všechny adresy a jejich jména
node ace migration:fresh --seed   # smaže DB a nahraje znovu testovací data
npm run build && npm start        # produkční verze (vytvoří složky build/ a public/)
```

## Známá omezení

- Projekt nemá automatické testy, lint ani formátovač, kvůli co nejmenšímu počtu souborů. Kontrola je `npm run typecheck` a vyzkoušení v prohlížeči.
- Při chybě se ve vývoji ukáže ladicí stránka AdonisJS, v produkci jen krátká anglická hláška (vlastní české chybové stránky nejsou).
- Hledání v SQLite rozlišuje velikost písmen u znaků s diakritikou („č“ a „Č“ bere jako různé znaky).
- Registrace není: účty zakládá admin. Žádné e-maily (reset hesla, pozvánky).
- Statistiky na přehledu se počítají v JavaScriptu z načtených uživatelů. Pro pár desítek účtů to stačí, u tisíců by se počítalo v SQL.
