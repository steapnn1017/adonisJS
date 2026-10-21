/*
|--------------------------------------------------------------------------
| NASTAVENÍ HTTP SERVERU A COOKIES
|--------------------------------------------------------------------------
*/

import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/core/http'

export const http = defineConfig({
  /**
   * Každý požadavek dostane unikátní ID, které se objeví v logu.
   * Pomáhá dohledat, který řádek logu patří ke kterému požadavku.
   */
  generateRequestId: true,

  /**
   * HTML formulář umí jen GET a POST. Díky tomuhle jde poslat PUT/DELETE
   * jako POST s ?_method=PUT v adrese formuláře, např.:
   *   <form method="POST" action="/users/5?_method=PUT">
   */
  allowMethodSpoofing: true,

  /**
   * Přístup k aktuálnímu požadavku odkudkoli v kódu.
   * Nepotřebujeme, ctx se předává do controllerů přímo.
   */
  useAsyncLocalStorage: false,

  /**
   * Algoritmus, kterým router hledá routu podle adresy.
   * 'tree' je rychlý strom, nic se tu měnit nemusí.
   */
  router: {
    matcher: 'tree',
  },

  /**
   * Při přesměrování NEpřenášet ?parametry automaticky. Kam se má
   * přesměrovat, říká vždy přesně controller. Kde je chceme zachovat
   * (seznam po smazání uživatele), přidá je controller sám přes withQs().
   */
  redirect: {
    forwardQueryString: false,
  },

  /**
   * Výchozí nastavení cookies (cookie session je zvlášť v config/session.ts).
   */
  cookie: {
    // Prázdné = cookie platí jen pro tuhle doménu
    domain: '',
    // '/' = cookie platí pro všechny adresy aplikace
    path: '/',
    // Jak dlouho cookie vydrží
    maxAge: '2h',
    // JavaScript v prohlížeči cookie nepřečte (ochrana proti krádeži přes XSS)
    httpOnly: true,
    // Na produkci posílat cookie jen přes HTTPS
    secure: app.inProduction,
    // Cookie se nepošle s požadavky z cizích webů (část ochrany proti CSRF)
    sameSite: 'lax',
  },
})
