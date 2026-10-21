/*
|--------------------------------------------------------------------------
| NASTAVENÍ DATABÁZE
|--------------------------------------------------------------------------
|
| Aplikace používá SQLite: celá databáze je jeden soubor tmp/db.sqlite3.
| Není potřeba instalovat žádný databázový server.
|
*/

import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'

export default defineConfig({
  // Které připojení se použije (je jen jedno)
  connection: 'sqlite',

  // SQL dotazy v terminálu hezky naformátované (jen při vývoji, viz debug níže)
  prettyPrintDebugQueries: true,

  connections: {
    sqlite: {
      // Ovladač pro SQLite v Node.js
      client: 'better-sqlite3',
      connection: {
        // app.tmpPath() = cesta do složky tmp/ v projektu
        filename: app.tmpPath('db.sqlite3'),
      },
      // SQLite neumí výchozí hodnoty jako ostatní databáze, tohle je povinné
      useNullAsDefault: true,

      migrations: {
        // Řadit migrace podle čísla v názvu „přirozeně“ (2 před 10)
        naturalSort: true,
        // Kde migrace leží
        paths: ['database/migrations'],
      },

      // Po každé migraci vygenerovat database/schema.ts (sloupce pro model User)
      schemaGeneration: {
        enabled: true,
      },

      // Při vývoji vypisovat každý SQL dotaz do terminálu
      debug: app.inDev,
    },
  },
})
