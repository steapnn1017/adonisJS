/*
|--------------------------------------------------------------------------
| PŘIHLÁŠENÍ A ODHLÁŠENÍ
|--------------------------------------------------------------------------
|
| Routy (start/routes.ts):
|   GET  /login   → create()   zobrazí formulář
|   POST /login   → store()    zpracuje odeslaný formulář
|   POST /logout  → destroy()  odhlásí
|
| Přihlášení funguje přes session: po přihlášení si server zapamatuje
| ID uživatele a prohlížeč dostane cookie. Při každém dalším požadavku
| podle cookie pozná, kdo to je.
|
*/

import User from '#models/user'
import { DateTime } from 'luxon'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  /**
   * Zobrazí přihlašovací stránku (resources/views/pages/login.edge).
   *
   * Každá metoda controlleru dostane „ctx“ (HttpContext) = vše o aktuálním
   * požadavku. Píšeme { view } = vytáhni si z ctx jen to, co potřebuju.
   */
  async create({ view }: HttpContext) {
    return view.render('pages/login')
  }

  /**
   * Zpracuje odeslaný přihlašovací formulář.
   */
  async store({ request, auth, response, session }: HttpContext) {
    // 1. Zkontroluj, že přišel e-mail a heslo (jinak se vrátí na formulář samo)
    const { email, password } = await request.validateUsing(loginValidator)

    // 2. Najdi uživatele podle e-mailu a ověř heslo proti hashi v DB.
    //    Při špatném e-mailu i špatném hesle vyhodí verifyCredentials STEJNOU
    //    chybu, takže útočník nepozná, jestli účet s tím e-mailem existuje.
    //    .catch(() => null) = chybu chytíme a místo ní dostaneme null.
    const user = await User.verifyCredentials(email, password).catch(() => null)

    if (!user) {
      // flashExcept = vrať do formuláře vyplněná pole KROMĚ hesla
      session.flashExcept(['password'])
      // flash = hláška, která přežije jedno přesměrování (zobrazí ji layout)
      session.flash('error', 'Nesprávný e-mail nebo heslo.')
      return response.redirect().back()
    }

    // 3. Zablokovaný účet se nepřihlásí, i když má správné heslo
    if (!user.isActive) {
      session.flashExcept(['password'])
      session.flash('error', 'Tvůj účet je zablokovaný. Obrať se na administrátora.')
      return response.redirect().back()
    }

    // 4. Zapiš čas přihlášení (ukazuje se v seznamu uživatelů)
    user.lastLoginAt = DateTime.now()
    await user.save()

    // 5. Přihlas: uloží ID uživatele do session
    await auth.use('web').login(user)
    return response.redirect().toRoute('dashboard')
  }

  /**
   * Odhlásí uživatele (smaže ho ze session) a pošle ho na přihlášení.
   */
  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('login')
  }
}
