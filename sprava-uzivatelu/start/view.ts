import edge from 'edge.js'
import type { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import { addCollection, edgeIconify } from 'edge-iconify'
import lucideIcons from '@iconify-json/lucide/icons.json' with { type: 'json' }

edge.use(edgeIconify)
addCollection(lucideIcons)

/**
 * Globální helpery pro šablony – v každém .edge souboru jdou volat přímo,
 * např. {{ formatDate(user.createdAt) }}. Formát je na jednom místě,
 * takže když se změní, nemusí se přepisovat každá stránka.
 */
edge.global('formatDate', (date: DateTime | null) => {
  return date ? date.setLocale('cs').toFormat('d. M. yyyy') : ''
})

// "před 3 dny", "před 2 hodinami" – Luxon umí češtinu přes Intl, nic se nepřekládá ručně
edge.global('fromNow', (date: DateTime | null) => {
  if (!date) return ''
  // Luxon by napsal "před 0 sekundami", to nikdo neříká
  if (Math.abs(date.diffNow('seconds').seconds) < 60) return 'právě teď'
  return date.setLocale('cs').toRelative()
})

/**
 * České skloňování podle počtu: plural(1, 'účet', 'účty', 'účtů') → "1 účet",
 * 3 → "3 účty", 14 → "14 účtů". Čeština má tři tvary, angličtina jen dva.
 */
edge.global('plural', (count: number, one: string, few: string, many: string) => {
  const word = count === 1 ? one : count >= 2 && count <= 4 ? few : many
  return `${count} ${word}`
})

/**
 * Barevný motiv z cookie, kterou nastavuje přepínač v resources/js/app.js.
 * Výchozí je tmavý. Čte se na serveru, takže stránka nebliká při načtení.
 */
edge.global('currentTheme', (request: HttpContext['request']) => {
  const theme = request.plainCookie('app_theme', { encoded: false })
  return theme === 'light' ? 'light' : 'dark'
})
