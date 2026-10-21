/*
|--------------------------------------------------------------------------
| LOGOVÁNÍ (výpisy do terminálu)
|--------------------------------------------------------------------------
|
| Co se má vypisovat při běhu serveru (požadavky, chyby, SQL dotazy…).
| Kolik toho bude, určuje LOG_LEVEL v .env (info, debug, warn, error…).
|
*/

import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, syncDestination, targets } from '@adonisjs/core/logger'

const loggerConfig = defineConfig({
  default: 'app',

  loggers: {
    app: {
      enabled: true,
      // Jméno, které se objeví u každého řádku logu
      name: env.get('APP_NAME'),
      // Nejnižší úroveň, která se ještě vypíše
      level: env.get('LOG_LEVEL'),
      // Při vývoji psát hned (synchronně), aby se log nezpožďoval za chybou
      destination: !app.inProduction ? await syncDestination() : undefined,
      // Kam logy jdou: destination 1 = standardní výstup (terminál)
      transport: {
        targets: [targets.file({ destination: 1 })],
      },
    },
  },
})

export default loggerConfig

/**
 * Jen pro TypeScript (napovídání v editoru), na chod aplikace nemá vliv.
 */
declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
