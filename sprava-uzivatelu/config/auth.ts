/*
|--------------------------------------------------------------------------
| NASTAVENÍ PŘIHLAŠOVÁNÍ
|--------------------------------------------------------------------------
|
| „Guard“ = způsob, jak aplikace pozná přihlášeného uživatele.
| Tady je jediný guard „web“: přihlášení přes session a cookie
| (klasický web, žádné API tokeny).
|
| V kódu se používá přes auth.use('web').login(user) / logout().
|
*/

import { defineConfig } from '@adonisjs/auth'
import { sessionGuard, sessionUserProvider } from '@adonisjs/auth/session'
import type { InferAuthenticators, InferAuthEvents, Authenticators } from '@adonisjs/auth/types'

const authConfig = defineConfig({
  // Guard, který se použije, když se žádný konkrétní nevybere
  default: 'web',

  guards: {
    web: sessionGuard({
      // „Zapamatovat si mě“ (přihlášení i po zavření prohlížeče) nepoužíváme
      useRememberMeTokens: false,

      // Odkud se berou uživatelé: z modelu User (tabulka users)
      provider: sessionUserProvider({
        model: () => import('#models/user'),
      }),
    }),
  },
})

export default authConfig

/**
 * Tohle jen předá TypeScriptu informace o nastavených guardech,
 * aby fungovalo napovídání v editoru (auth.use('web') atd.).
 * Na chod aplikace nemá vliv.
 */
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
