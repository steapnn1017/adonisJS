/*
|--------------------------------------------------------------------------
| MIDDLEWARE AUTH – pustí dál jen přihlášené a nezablokované
|--------------------------------------------------------------------------
|
| Použití v start/routes.ts: .use(middleware.auth())
| Registrace jména „auth“: start/kernel.ts
|
*/

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  /**
   * handle() se spustí před controllerem.
   *   ctx  = vše o požadavku (stejné jako v controlleru)
   *   next = „pokračuj dál“ (na další middleware nebo controller)
   */
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * 1. Je někdo přihlášený? AdonisJS se podívá do session.
     *    Když ne, rovnou přesměruje na /login a sem se kód už nevrátí.
     *    Když ano, načte uživatele z DB do ctx.auth.user.
     */
    await ctx.auth.authenticateUsing(['web'], { loginRoute: '/login' })

    /**
     * 2. Není mezitím zablokovaný? Když admin zablokuje někoho, kdo je
     *    zrovna přihlášený, jeho session by jinak platila dál. Uživatel
     *    se ale načítá z DB při každém požadavku, takže blokace platí
     *    okamžitě: při dalším kliknutí ho odhlásíme.
     */
    if (!ctx.auth.user!.isActive) {
      await ctx.auth.use('web').logout()
      ctx.session.flash('error', 'Tvůj účet byl zablokován.')
      return ctx.response.redirect('/login')
    }

    // 3. Všechno v pořádku, pokračuj na controller
    return next()
  }
}
