/*
|--------------------------------------------------------------------------
| SHIELD = bezpečnostní ochrany
|--------------------------------------------------------------------------
*/

import { defineConfig } from '@adonisjs/shield'

export default defineConfig({
  /**
   * CSP (Content Security Policy) = seznam, odkud smí stránka načítat
   * skripty a styly. Vypnuto, aplikace nic z cizích serverů nenačítá.
   */
  csp: {
    enabled: false,
    directives: {},
    reportOnly: false,
  },

  /**
   * CSRF ochrana. Útok CSRF: cizí web by tvým prohlížečem (kde jsi
   * přihlášený) potají odeslal formulář, třeba „smaž uživatele“.
   *
   * Obrana: každý formulář musí obsahovat tajný token, který zná jen
   * naše stránka. V šabloně se vloží přes {{ csrfField() }}.
   * Formulář bez tokenu server odmítne.
   */
  csrf: {
    enabled: true,
    // Adresy bez CSRF kontroly (např. webhooky). Žádné nemáme.
    exceptRoutes: [],
    // Token i v cookie pro JS frameworky – nepotřebujeme
    enableXsrfCookie: false,
    // GET jen čte, kontroluje se jen to, co něco mění
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },

  /**
   * Zakáže vložit aplikaci do <iframe> na cizím webu
   * (ochrana proti „clickjackingu“ – podstrčení kliknutí).
   */
  xFrame: {
    enabled: true,
    action: 'DENY',
  },

  /**
   * HSTS: prohlížeč si zapamatuje, že web chodí jen přes HTTPS.
   */
  hsts: {
    enabled: true,
    maxAge: '180 days',
  },

  /**
   * Prohlížeč nemá „hádat“ typ souboru, má věřit hlavičce Content-Type.
   */
  contentTypeSniffing: {
    enabled: true,
  },
})
