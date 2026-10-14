import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Rozšíření tabulky users o pole pro správu uživatelů.
 * Původní tabulku necháváme tak, jak ji vytvořil starter kit,
 * a změny děláme novou migrací – takhle se to dělá i v reálném projektu,
 * kde už starou migraci nemůžeš přepsat (běží na produkci).
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Role určuje, jestli uživatel vidí administraci (admin) nebo jen svůj profil (user)
      table.string('role', 20).notNullable().defaultTo('user')
      // Zablokovaný účet se nemůže přihlásit, ale data zůstanou zachována
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('last_login_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
      table.dropColumn('is_active')
      table.dropColumn('last_login_at')
    })
  }
}
