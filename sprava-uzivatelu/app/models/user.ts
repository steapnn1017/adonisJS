/*
|--------------------------------------------------------------------------
| MODEL UŽIVATELE
|--------------------------------------------------------------------------
|
| Model = JavaScriptová třída, přes kterou se pracuje s tabulkou „users“
| v databázi. Místo psaní SQL se píše třeba:
|
|   await User.find(5)                    → SELECT * FROM users WHERE id = 5
|   await User.create({ email: '…' })     → INSERT INTO users …
|   user.fullName = 'Jana'; await user.save()   → UPDATE users …
|
| Sloupce tabulky (id, email, role…) se tu nepíšou ručně. AdonisJS je po
| každé migraci sám vygeneruje do database/schema.ts (třída UserSchema)
| a tenhle model od ní dědí. Tady je jen chování NAVÍC.
|
*/

import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

/**
 * compose() spojí několik tříd dohromady:
 *   UserSchema               – sloupce z databáze
 *   withAuthFinder(hash)     – přidá přihlašování:
 *       • User.verifyCredentials(email, heslo) – najde uživatele a ověří heslo
 *       • heslo se před uložením do DB samo zahashuje (v DB nikdy není čitelně)
 */
export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  /**
   * SQLite nemá skutečný typ boolean, ukládá 1/0.
   * consume() převede hodnotu načtenou z DB na true/false,
   * aby šablony a controllery pracovaly s opravdovým booleanem.
   */
  @column({ consume: (value) => Boolean(value) })
  declare isActive: boolean

  /**
   * Je uživatel administrátor? V šabloně: @if(user.isAdmin)
   * (get = „getter“, volá se bez závorek jako obyčejná vlastnost)
   */
  get isAdmin() {
    return this.role === 'admin'
  }

  /**
   * Jméno pro zobrazení. Jméno je v DB nepovinné, takže když chybí,
   * ukáže se místo něj e-mail.
   */
  get displayName() {
    return this.fullName || this.email
  }

  /**
   * Iniciály do kolečka (avataru):
   *   „Jana Nováková“ → „JN“  (první písmeno prvního a posledního slova)
   *   „jana@test.cz“  → „JA“  (bez jména první dvě písmena)
   */
  get initials() {
    const words = this.displayName.trim().split(/\s+/)

    if (words.length >= 2) {
      const first = words[0].charAt(0)
      const last = words[words.length - 1].charAt(0)
      return (first + last).toUpperCase()
    }

    return this.displayName.slice(0, 2).toUpperCase()
  }
}
