/*
|--------------------------------------------------------------------------
| MIGRACE: vytvoření tabulky users
|--------------------------------------------------------------------------
|
| Migrace = popis změny databáze v kódu. Místo ručního klikání v databázi
| se tabulka popíše tady a příkaz ji vytvoří:
|
|   node ace migration:run        → spustí up()   (vytvoří tabulku)
|   node ace migration:rollback   → spustí down() (tabulku zase smaže)
|   node ace migration:fresh      → smaže všechno a spustí migrace znovu
|
| Číslo na začátku názvu souboru je čas vytvoření, podle něj se migrace
| spouštějí ve správném pořadí.
|
| Po každé migraci AdonisJS sám přegeneruje database/schema.ts
| (seznam sloupců pro model User), ten soubor se needituje ručně.
|
*/

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  /**
   * up() = co se má stát při spuštění migrace
   */
  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // Číselné ID, které se samo zvyšuje (1, 2, 3…), primární klíč
      table.increments('id').notNullable()

      // Celé jméno, nepovinné (nullable)
      table.string('full_name').nullable()

      // E-mail, povinný a unikátní (dva účty nemůžou mít stejný)
      table.string('email', 254).notNullable().unique()

      // Heslo – v DB je vždy jen HASH, nikdy čitelné heslo
      table.string('password').notNullable()

      // Role: 'admin' (vidí správu uživatelů) nebo 'user' (jen svůj účet)
      table.string('role', 20).notNullable().defaultTo('user')

      // Aktivní účet. false = zablokovaný: nepřihlásí se, ale data zůstanou
      table.boolean('is_active').notNullable().defaultTo(true)

      // Kdy se naposledy přihlásil (null = ještě nikdy)
      table.timestamp('last_login_at').nullable()

      // Kdy byl účet založen a naposledy upraven (vyplňuje se samo)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  /**
   * down() = jak migraci vrátit zpět (přesný opak up())
   */
  async down() {
    this.schema.dropTable(this.tableName)
  }
}
