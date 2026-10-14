import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

/**
 * Pustí dál jen přihlášené uživatele, ostatní pošle na /login.
 */
export default class AuthMiddleware {
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })

    /**
     * Když admin zablokuje někoho, kdo je zrovna přihlášený, jeho session
     * by jinak platila dál. Uživatele načítáme z DB při každém requestu,
     * takže blokace platí okamžitě a při dalším kliknutí ho odhlásíme.
     */
    if (!ctx.auth.user!.isActive) {
      await ctx.auth.use('web').logout()
      ctx.session.flash('error', 'Tvůj účet byl zablokován.')
      return ctx.response.redirect(this.redirectTo)
    }

    return next()
  }
}
