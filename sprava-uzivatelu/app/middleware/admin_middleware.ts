/*
|--------------------------------------------------------------------------
| MIDDLEWARE ADMIN – pustí dál jen administrátory
|--------------------------------------------------------------------------
|
| Použití v start/routes.ts: .use('*', [middleware.auth(), middleware.admin()])
| Registrace jména „admin“: start/kernel.ts
|
| Musí běžet AŽ PO middleware auth, protože počítá s tím, že auth.user
| je už načtený (auth ověří KDO jsi, admin ověří, jestli SMÍŠ sem).
|
*/

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle({ auth, session, response }: HttpContext, next: NextFn) {
    // Běžného uživatele vrátíme na přehled s chybovou hláškou
    if (!auth.user?.isAdmin) {
      session.flash('error', 'Na tuhle stránku nemáš oprávnění.')
      return response.redirect().toRoute('dashboard')
    }

    // Je to admin, pokračuj na controller
    return next()
  }
}
