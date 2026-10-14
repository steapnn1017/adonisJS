import User from '#models/user'
import { DateTime } from 'luxon'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Přihlášení a odhlášení (session + cookie).
 */
export default class SessionController {
  async create({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    /**
     * verifyCredentials při špatném e-mailu i heslu vyhodí stejnou chybu
     * a trvá stejně dlouho – útočník tak nepozná, jestli účet existuje.
     * Chybu chytáme jen kvůli české hlášce.
     */
    const user = await User.verifyCredentials(email, password).catch(() => null)
    if (!user) {
      session.flashExcept(['password'])
      session.flash('error', 'Nesprávný e-mail nebo heslo.')
      return response.redirect().back()
    }

    if (!user.isActive) {
      session.flashExcept(['password'])
      session.flash('error', 'Tvůj účet je zablokovaný. Obrať se na administrátora.')
      return response.redirect().back()
    }

    user.lastLoginAt = DateTime.now()
    await user.save()

    await auth.use('web').login(user)
    return response.redirect().toRoute('dashboard')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('session.create')
  }
}
