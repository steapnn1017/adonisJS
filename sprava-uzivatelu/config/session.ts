/*
|--------------------------------------------------------------------------
| SESSION = paměť mezi požadavky
|--------------------------------------------------------------------------
|
| HTTP je „bez paměti“: každý požadavek je pro server nový. Session
| si pamatuje věci mezi nimi, hlavně:
|   • kdo je přihlášený (ukládá auth.use('web').login())
|   • flash hlášky („Změny byly uloženy.“) a chyby formulářů
|
| Prohlížeč dostane cookie „adonis-session“, podle které ho server pozná.
|
*/

import app from '@adonisjs/core/services/app'
import { defineConfig, stores } from '@adonisjs/session'

export default defineConfig({
  enabled: true,

  // Název cookie v prohlížeči
  cookieName: 'adonis-session',

  // false = session přežije zavření prohlížeče (do vypršení „age“)
  clearWithBrowser: false,

  // Po 2 hodinách nečinnosti session vyprší a uživatel se musí přihlásit znovu
  age: '2h',

  // Nastavení session cookie (význam viz config/app.ts → cookie)
  cookie: {
    path: '/',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },

  // Kam se data session ukládají: přímo do cookie (zašifrovaná, viz config/encryption.ts)
  store: 'cookie',

  stores: {
    cookie: stores.cookie(),
  },
})
