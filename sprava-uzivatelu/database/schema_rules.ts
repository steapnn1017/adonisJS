import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

/**
 * Pravidla pro generátor database/schema.ts.
 * Soubor schema.ts se přegeneruje po každé migraci, takže typy,
 * které nejdou vyčíst z databáze, se upravují tady – ne ručně v schema.ts.
 */
export default {
  tables: {
    users: {
      columns: {
        // V DB je role obyčejný string, v TypeScriptu chceme jen povolené hodnoty
        role: { tsType: `'admin' | 'user'`, decorators: [{ name: '@column' }] },
      },
    },
  },
} satisfies SchemaRules
