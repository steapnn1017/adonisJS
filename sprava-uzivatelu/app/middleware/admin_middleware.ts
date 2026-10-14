import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Pustí dál jen adminy. Musí běžet až po middleware.auth(),
 * protože počítá s tím, že auth.user je už načtený.
 */
export default class AdminMiddleware {
  async handle({ auth, session, response }: HttpContext, next: NextFn) {
    if (!auth.user?.isAdmin) {
      session.flash('error', 'Na tuhle stránku nemáš oprávnění.')
      return response.redirect().toRoute('dashboard')
    }
    return next()
  }
}
