/*
|--------------------------------------------------------------------------
| ŠIFROVÁNÍ
|--------------------------------------------------------------------------
|
| AdonisJS šifruje cookies (hlavně session), aby si je nikdo nemohl
| přečíst ani podvrhnout. Klíčem je APP_KEY z .env – když unikne,
| útočník by mohl cookies padělat, proto .env nepatří do gitu.
|
*/

import env from '#start/env'
import { defineConfig, drivers } from '@adonisjs/core/encryption'

const encryptionConfig = defineConfig({
  // Který šifrovač se použije (je jen jeden)
  default: 'gcm',

  list: {
    /**
     * AES-256-GCM: standardní šifra, která zároveň pozná,
     * jestli někdo zašifrovaná data změnil.
     */
    gcm: drivers.aes256gcm({
      // Klíč z .env. Víc klíčů = možnost klíč vyměnit a staré cookies dočíst.
      keys: [env.get('APP_KEY')],
      id: 'gcm',
    }),
  },
})

export default encryptionConfig

/**
 * Jen pro TypeScript (napovídání v editoru), na chod aplikace nemá vliv.
 */
declare module '@adonisjs/core/types' {
  export interface EncryptorsList extends InferEncryptors<typeof encryptionConfig> {}
}
