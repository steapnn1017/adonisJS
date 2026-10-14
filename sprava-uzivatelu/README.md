# Správa uživatelů (AdonisJS 7)

Testovací projekt, na kterém si zkouším AdonisJS. Admin vidí všechny účty, může je hledat, filtrovat, zakládat, upravovat, blokovat a mazat. Běžný uživatel vidí jen svůj účet a nastavení.

## Co je uvnitř

| Část | Technologie |
|---|---|
| Framework | AdonisJS 7 (TypeScript, Node.js 24) |
| Šablony | Edge + Alpine.js (malé interakce: dialog, přepínač motivu) |
| Databáze | SQLite přes Lucid ORM (soubor `tmp/db.sqlite3`) |
| Validace | VineJS, české hlášky v `start/validator.ts` |
| Přihlášení | `@adonisjs/auth` (session + cookie), CSRF ochrana přes Shield |
| Testy | Japa (14 funkčních testů přes HTTP) |
| Styl | čisté CSS s tokeny, písmo Geist (bez Google Fonts) |

## Spuštění

Potřebuješ **Node.js 24** (AdonisJS 7 na starším nejede). Přes nvm: `nvm use` (verze je v `.nvmrc`).

```bash
cd sprava-uzivatelu
npm install
node ace migration:run   # vytvoří tabulky
node ace db:seed         # nahraje 14 testovacích uživatelů
npm run dev              # http://localhost:3333
```

## Testovací účty

Všechny mají heslo `heslo1234`.

| E-mail | Co to je |
|---|---|
| admin@test.cz | administrátor, vidí správu uživatelů |
| uzivatel@test.cz | běžný uživatel |
| blokovany@test.cz | zablokovaný účet, nepřihlásí se |

## Funkce

- **Přehled**: admin vidí počty účtů (všechny, aktivní, admini, noví za 7 dní) a 5 nejnovějších. Běžný uživatel vidí kartu svého účtu.
- **Uživatelé** (jen admin): hledání podle jména/e-mailu, filtr role a stavu, stránkování po 10. Filtry jsou v URL, takže jde odkaz poslat dál.
- **Nový / úprava uživatele**: jméno, e-mail, role, aktivní účet, heslo (při úpravě nepovinné).
- **Mazání** přes potvrzovací dialog.
- **Ochrana**: admin si nemůže smazat vlastní účet, odebrat si roli ani se zablokovat.
- **Blokace** platí okamžitě. Zablokovaný se nepřihlásí a kdo už přihlášený je, toho to při dalším kliknutí odhlásí.
- **Nastavení**: změna jména, e-mailu a hesla (vyžaduje současné heslo).
- Světlý/tmavý motiv, funguje na mobilu.

## Užitečné příkazy

```bash
npm run dev               # vývojový server s HMR
node ace test             # testy (vlastní DB tmp/db.test.sqlite3, vývojová data nesmaže)
npm run typecheck         # kontrola TypeScriptu
npm run lint              # ESLint + Prettier
node ace list:routes      # všechny routy a jejich názvy
node ace migration:fresh --seed   # smaže DB a nahraje znovu testovací data
```

## Struktura (to podstatné)

| Kde | Co tam je |
|---|---|
| `start/routes.ts` | všechny routy, rozdělené na guest / auth / admin |
| `start/kernel.ts` | middleware (`auth`, `guest`, `admin`) |
| `start/validator.ts` | české chybové hlášky validace |
| `start/view.ts` | helpery do šablon: `formatDate`, `fromNow`, `plural`, `currentTheme` |
| `app/controllers/users_controller.ts` | správa uživatelů (výpis, filtry, CRUD, ochrana sebe sama) |
| `app/controllers/dashboard_controller.ts` | přehled se statistikami |
| `app/controllers/session_controller.ts` | přihlášení/odhlášení, kontrola blokace |
| `app/controllers/profile_controller.ts`, `password_controller.ts` | vlastní nastavení |
| `app/middleware/admin_middleware.ts` | pustí dál jen admina |
| `app/middleware/auth_middleware.ts` | přihlášení + okamžité odhlášení zablokovaného |
| `app/models/user.ts` | model (role, `isAdmin`, iniciály) |
| `app/validators/user.ts` | pravidla pro všechny formuláře |
| `database/migrations/` | tabulka users + rozšíření o roli, stav, poslední přihlášení |
| `database/schema.ts` | **generuje se samo** po migraci, needitovat ručně |
| `database/seeders/user_seeder.ts` | testovací data |
| `resources/views/pages/` | stránky (Edge šablony) |
| `resources/views/partials/user_form.edge` | sdílený formulář pro nový i upravovaný účet |
| `resources/css/app.css` | všechny styly, barvy jsou v tokenech nahoře |
| `resources/js/app.js` | Alpine komponenty (flash hlášky, motiv, mazací dialog) |
| `tests/functional/` | testy přístupu, CRUD, přihlášení a blokace |

## Jak jde požadavek (příklad: admin uloží úpravu)

1. Formulář pošle `POST /users/5?_method=PUT` (HTML formulář neumí PUT, AdonisJS to přeloží).
2. Middleware `auth` ověří přihlášení, `admin` ověří roli.
3. `UsersController.update` zvaliduje data (`updateUserValidator`). Když něco nesedí, vrátí formulář s chybami u polí.
4. Kontrola, že admin neupravuje sám sebe nebezpečně.
5. Uloží se do DB, flash hláška „Změny byly uloženy.“, přesměrování na seznam.

## Známá omezení

- České chybové stránky (404, 500) se ukazují jen v produkci. Ve vývoji AdonisJS schválně ukazuje detailní ladicí stránku.
- Hledání v SQLite rozlišuje velikost písmen u znaků s diakritikou („č“ a „Č“ bere jako různé znaky).
- Žádné posílání e-mailů (reset hesla, pozvánky). Na test to není potřeba.
