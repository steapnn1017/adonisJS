/*
|--------------------------------------------------------------------------
| ŠABLONY (Edge) – nastavení a pomocné funkce
|--------------------------------------------------------------------------
|
| Edge je šablonovací jazyk AdonisJS (soubory .edge v resources/views/).
| Funkce zaregistrované přes edge.global() jdou v každé šabloně zavolat
| přímo, např. {{ formatDate(user.createdAt) }}.
|
| Výhoda: formát data apod. je na jednom místě. Když se změní,
| nepřepisuje se každá stránka zvlášť.
|
*/

import edge from 'edge.js'
import type { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import { addCollection, edgeIconify } from 'edge-iconify'
import lucideIcons from '@iconify-json/lucide/icons.json' with { type: 'json' }

/**
 * Ikony. Díky tomuhle jde v šabloně napsat @svg('lucide:users')
 * a vloží se SVG ikona přímo do HTML (žádné stahování z internetu).
 * Seznam ikon: https://lucide.dev/icons
 */
edge.use(edgeIconify)
addCollection(lucideIcons)

/**
 * Datum česky: 14. 10. 2026
 * Prázdné datum (null) vrátí prázdný text, aby šablona nespadla.
 */
edge.global('formatDate', (date: DateTime | null) => {
  if (!date) return ''
  return date.setLocale('cs').toFormat('d. M. yyyy')
})

/**
 * Relativní čas česky: „před 3 dny“, „před 2 hodinami“.
 * Překlad dělá knihovna Luxon sama (přes vestavěné Intl v prohlížeči/Node).
 */
edge.global('fromNow', (date: DateTime | null) => {
  if (!date) return ''

  // Luxon by napsal „před 0 sekundami“, to nikdo neříká
  const secondsAgo = Math.abs(date.diffNow('seconds').seconds)
  if (secondsAgo < 60) return 'právě teď'

  return date.setLocale('cs').toRelative()
})

/**
 * České skloňování podle počtu. Čeština má tři tvary:
 *   plural(1, 'účet', 'účty', 'účtů')  → „1 účet“
 *   plural(3, 'účet', 'účty', 'účtů')  → „3 účty“
 *   plural(14, 'účet', 'účty', 'účtů') → „14 účtů“
 */
edge.global('plural', (count: number, one: string, few: string, many: string) => {
  let word = many
  if (count === 1) word = one
  else if (count >= 2 && count <= 4) word = few

  return `${count} ${word}`
})

/**
 * Barevný motiv (tmavý/světlý). Přepínač v prohlížeči (resources/js/app.js)
 * uloží volbu do cookie „app_theme“ a server ji tady přečte.
 * Motiv se tak nastaví už v HTML a stránka při načtení nebliká.
 * Výchozí je tmavý.
 */
edge.global('currentTheme', (request: HttpContext['request']) => {
  const theme = request.plainCookie('app_theme', { encoded: false })
  return theme === 'light' ? 'light' : 'dark'
})
