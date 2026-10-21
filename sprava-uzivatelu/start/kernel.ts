/*
|--------------------------------------------------------------------------
| KERNEL = registrace middleware
|--------------------------------------------------------------------------
|
| Middleware je funkce, která běží PŘED controllerem. Může požadavek pustit
| dál (next()), nebo ho zastavit a třeba přesměrovat jinam.
|
| Tady jsou tři druhy:
|   server.use()   – běží úplně na každém požadavku (i na neexistující adresu)
|   router.use()   – běží na každém požadavku, pro který existuje routa
|   router.named() – běží jen tam, kde si ho routa sama vyžádá (start/routes.ts)
|
*/

import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

/**
 * Když kdekoli v aplikaci vznikne chyba (chyba validace, nepřihlášený,
 * 404…), převede ji na odpověď tahle třída (app/exceptions/handler.ts).
 */
server.errorHandler(() => import('#exceptions/handler'))

/**
 * Middleware pro úplně všechny požadavky.
 */
server.use([
  // Posílá soubory ze složky public/ (obrázky, favicon…)
  () => import('@adonisjs/static/static_middleware'),
  // Napojí Vite, který při vývoji servíruje CSS a JS z resources/
  () => import('@adonisjs/vite/vite_middleware'),
])

/**
 * Middleware pro všechny existující routy. Pořadí je důležité,
 * každý další počítá s tím, co připravil ten předchozí.
 */
router.use([
  // 1. Přečte tělo požadavku (data z formuláře) → request.input('email')
  () => import('@adonisjs/core/bodyparser_middleware'),
  // 2. Session = paměť mezi požadavky (kdo je přihlášený, flash hlášky)
  () => import('@adonisjs/session/session_middleware'),
  // 3. Shield = bezpečnost, hlavně CSRF ochrana formulářů (viz config/shield.ts)
  () => import('@adonisjs/shield/shield_middleware'),
  // 4. Připraví objekt ctx.auth (ještě nikoho neověřuje, jen ho vytvoří)
  () => import('@adonisjs/auth/initialize_auth_middleware'),
])

/**
 * Pojmenované middleware. Routa si je vyžádá přes .use(middleware.auth()).
 * Kód každého je v app/middleware/<nazev>_middleware.ts.
 */
export const middleware = router.named({
  // Pustí jen NEpřihlášené (přihlašovací stránka)
  guest: () => import('#middleware/guest_middleware'),
  // Pustí jen přihlášené a aktivní (nezablokované) uživatele
  auth: () => import('#middleware/auth_middleware'),
  // Pustí jen adminy, musí běžet až po auth
  admin: () => import('#middleware/admin_middleware'),
})
