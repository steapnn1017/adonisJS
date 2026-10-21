/*
|--------------------------------------------------------------------------
| MIDDLEWARE GUEST – pustí dál jen NEpřihlášené
|--------------------------------------------------------------------------
|
| Použití v start/routes.ts: .use(middleware.guest())  (stránka /login)
| Registrace jména „guest“: start/kernel.ts
|
| Přihlášený uživatel nemá na přihlašovací stránce co dělat,
| tak ho rovnou pošleme na přehled.
|
*/

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class GuestMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    // check() = „je někdo přihlášený?“ Na rozdíl od authenticate nic nepřesměruje.
    if (await auth.check()) {
      return response.redirect().toRoute('dashboard')
    }

    // Nikdo přihlášený není, ukaž přihlašovací stránku
    return next()
  }
}
