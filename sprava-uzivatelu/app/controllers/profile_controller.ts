/*
|--------------------------------------------------------------------------
| NASTAVENÍ PROFILU (jméno a e-mail)
|--------------------------------------------------------------------------
|
| Routy:
|   GET /settings/profile  → edit()    zobrazí formulář
|   PUT /settings/profile  → update()  uloží změny
|
| Šablona: resources/views/pages/settings/profile.edge
| Dostupné pro každého přihlášeného, mění vždy jen SVŮJ vlastní účet.
|
*/

import { profileValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfileController {
  /**
   * Formulář. Data přihlášeného uživatele si šablona vezme sama z auth.user,
   * proto controller nic dalšího neposílá.
   */
  async edit({ view }: HttpContext) {
    return view.render('pages/settings/profile')
  }

  /**
   * Uloží nové jméno a e-mail.
   */
  async update({ auth, request, response, session }: HttpContext) {
    const me = auth.user!

    // meta.userId = vlastní e-mail se nemá hlásit jako „už použitý“
    const data = await request.validateUsing(profileValidator, { meta: { userId: me.id } })

    // merge() přepíše jen pole, která jsou v data (fullName, email), save() uloží do DB
    await me.merge(data).save()

    session.flash('success', 'Profil byl uložen.')
    return response.redirect().toRoute('profile.edit')
  }
}
