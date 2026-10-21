/*
|--------------------------------------------------------------------------
| ZMĚNA VLASTNÍHO HESLA
|--------------------------------------------------------------------------
|
| Routy:
|   GET /settings/password  → edit()    zobrazí formulář
|   PUT /settings/password  → update()  uloží nové heslo
|
| Šablona: resources/views/pages/settings/password.edge
|
*/

import { errors } from '@vinejs/vine'
import hash from '@adonisjs/core/services/hash'
import { passwordValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class PasswordController {
  /**
   * Formulář pro změnu hesla.
   */
  async edit({ view }: HttpContext) {
    return view.render('pages/settings/password')
  }

  /**
   * Ověří současné heslo a uloží nové.
   */
  async update({ auth, request, response, session }: HttpContext) {
    const me = auth.user!

    // 1. Základní kontrola: vyplněno, nové heslo má 8+ znaků, obě nová se shodují
    const { currentPassword, password } = await request.validateUsing(passwordValidator)

    // 2. Sedí současné heslo? V DB je jen hash, proto hash.verify(), ne porovnání ===
    const isCorrect = await hash.verify(me.password, currentPassword)

    if (!isCorrect) {
      /**
       * Vyhodíme stejný typ chyby, jaký vyhazuje validátor. AdonisJS ji pak
       * zpracuje úplně stejně: vrátí uživatele na formulář a hlášku ukáže
       * přímo pod polem „Současné heslo“.
       */
      throw new errors.E_VALIDATION_ERROR([
        {
          field: 'currentPassword',
          rule: 'currentPassword',
          message: 'Současné heslo není správné.',
        },
      ])
    }

    // 3. Ulož nové heslo. Model ho před uložením sám zahashuje.
    me.password = password
    await me.save()

    session.flash('success', 'Heslo bylo změněno.')
    return response.redirect().toRoute('password.edit')
  }
}
