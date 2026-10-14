import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'

export const USER_ROLES = ['admin', 'user'] as const
export type UserRole = (typeof USER_ROLES)[number]

/**
 * Model uživatele. Sloupce se generují automaticky do database/schema.ts
 * (z migrací), tady jen doplňujeme chování navíc.
 * withAuthFinder přidává User.verifyCredentials() a hashování hesla při uložení.
 */
export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  /**
   * SQLite neumí skutečný boolean a vrací 0/1.
   * consume() převede hodnotu z DB na true/false, aby šablony a testy
   * nemusely řešit, jestli je to číslo nebo boolean.
   */
  @column({ consume: (value) => Boolean(value) })
  declare isActive: boolean

  get isAdmin() {
    return this.role === 'admin'
  }

  /**
   * Jméno pro zobrazení – fullName je v DB nepovinné, tak padáme na e-mail.
   */
  get displayName() {
    return this.fullName || this.email
  }

  /**
   * Iniciály do avataru: z celého jména (první + poslední slovo),
   * jinak první dvě písmena e-mailu.
   */
  get initials() {
    const parts = this.fullName?.trim().split(/\s+/) ?? []
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
    }
    return (parts[0] ?? this.email).slice(0, 2).toUpperCase()
  }
}
