/*
|--------------------------------------------------------------------------
| ROUTY = seznam všech adres aplikace
|--------------------------------------------------------------------------
|
| Každý řádek říká: „když přijde požadavek METODA /adresa, zavolej tuhle
| metodu v tomhle controlleru“. Například:
|
|   router.get('login', [SessionController, 'create'])
|     → GET /login zavolá SessionController.create()
|
| Routy jsou rozdělené do tří skupin podle toho, KDO na ně smí:
|
|   1. guest – jen NEpřihlášení (přihlašovací formulář)
|   2. auth  – každý přihlášený (přehled, vlastní nastavení, odhlášení)
|   3. admin – jen přihlášení administrátoři (správa uživatelů)
|
| Kdo smí dál, nehlídá controller, ale middleware (složka app/middleware/).
| Middleware se k routám přidává přes .use(...) na konci každé skupiny.
|
| .as('nazev') = jméno routy. V šablonách se pak odkaz píše přes jméno,
| např. urlFor('dashboard'), takže když se změní adresa, odkazy se nerozbijí.
|
| Výpis všech rout i s jejich jmény v terminálu: node ace list:routes
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

/**
 * Controllery se načítají „líně“ (až když je routa poprvé potřeba),
 * proto () => import(...). Aplikace tak startuje rychleji.
 */
const SessionController = () => import('#controllers/session_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const ProfileController = () => import('#controllers/profile_controller')
const PasswordController = () => import('#controllers/password_controller')
const UsersController = () => import('#controllers/users_controller')

/**
 * Úvodní adresa „/“ nic nezobrazuje, jen přesměruje na přehled.
 * Nepřihlášeného pak middleware auth z přehledu pošle dál na /login.
 */
router.on('/').redirect('dashboard')

/*
|--------------------------------------------------------------------------
| 1) Jen pro nepřihlášené (middleware guest)
|--------------------------------------------------------------------------
| Přihlášeného uživatele middleware guest pošle rovnou na přehled,
| přihlašovací formulář už nepotřebuje.
*/
router
  .group(() => {
    // GET = zobraz formulář, POST = zpracuj odeslaný formulář
    router.get('login', [SessionController, 'create']).as('login')
    router.post('login', [SessionController, 'store']).as('login.store')
  })
  .use(middleware.guest())

/*
|--------------------------------------------------------------------------
| 2) Pro každého přihlášeného (middleware auth)
|--------------------------------------------------------------------------
| Nepřihlášeného middleware auth přesměruje na /login.
*/
router
  .group(() => {
    router.get('dashboard', [DashboardController, 'index']).as('dashboard')

    // Odhlášení je POST (ne odkaz), aby tě nešlo odhlásit podvrženým odkazem
    router.post('logout', [SessionController, 'destroy']).as('logout')

    // Nastavení vlastního účtu. PUT = „uprav existující věc“.
    router.get('settings/profile', [ProfileController, 'edit']).as('profile.edit')
    router.put('settings/profile', [ProfileController, 'update']).as('profile.update')
    router.get('settings/password', [PasswordController, 'edit']).as('password.edit')
    router.put('settings/password', [PasswordController, 'update']).as('password.update')
  })
  .use(middleware.auth())

/*
|--------------------------------------------------------------------------
| 3) Jen pro adminy (middleware auth + admin)
|--------------------------------------------------------------------------
| router.resource() vytvoří najednou celou sadu rout pro „CRUD“
| (Create, Read, Update, Delete):
|
|   GET    /users           → index    (seznam)            jméno users.index
|   GET    /users/create    → create   (formulář nový)     jméno users.create
|   POST   /users           → store    (uložení nového)    jméno users.store
|   GET    /users/:id/edit  → edit     (formulář úpravy)   jméno users.edit
|   PUT    /users/:id       → update   (uložení úprav)     jméno users.update
|   DELETE /users/:id       → destroy  (smazání)           jméno users.destroy
|
| .except(['show']) = detail uživatele nepotřebujeme, detail = formulář úprav.
| .where('id', number) = :id musí být číslo, /users/abc vrátí 404.
| Pořadí middleware je důležité: nejdřív auth (kdo jsi), pak admin (smíš sem?).
*/
router
  .resource('users', UsersController)
  .except(['show'])
  .where('id', router.matchers.number())
  .use('*', [middleware.auth(), middleware.admin()])
