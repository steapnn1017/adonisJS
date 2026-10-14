import { errors } from '@vinejs/vine'
import hash from '@adonisjs/core/services/hash'
import { passwordValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Změna vlastního hesla.
 */
export default class PasswordController {
  async edit({ view }: HttpContext) {
    return view.render('pages/settings/password')
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const { currentPassword, password } = await request.validateUsing(passwordValidator)

    /**
     * Současné heslo ověřujeme proti hashi v DB. Při neshodě vyhodíme stejnou
     * chybu, jakou vyhazuje validátor – AdonisJS ji pak zpracuje úplně stejně
     * (přesměruje zpět a hlášku ukáže přímo pod polem).
     */
    if (!(await hash.verify(user.password, currentPassword))) {
      throw new errors.E_VALIDATION_ERROR([
        {
          field: 'currentPassword',
          rule: 'currentPassword',
          message: 'Současné heslo není správné.',
        },
      ])
    }

    user.password = password
    await user.save()

    session.flash('success', 'Heslo bylo změněno.')
    return response.redirect().toRoute('password.edit')
  }
}
