import { profileValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Nastavení vlastního profilu (jméno, e-mail). Dostupné pro každého přihlášeného.
 */
export default class ProfileController {
  async edit({ view }: HttpContext) {
    return view.render('pages/settings/profile')
  }

  async update({ auth, request, response, session }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(profileValidator, { meta: { userId: user.id } })

    await user.merge(payload).save()

    session.flash('success', 'Profil byl uložen.')
    return response.redirect().toRoute('profile.edit')
  }
}
