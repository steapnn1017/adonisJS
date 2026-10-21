/*
|--------------------------------------------------------------------------
| HASHOVÁNÍ HESEL
|--------------------------------------------------------------------------
|
| Hesla se do databáze nikdy neukládají čitelně, ale jako „hash“:
| jednosměrný otisk, ze kterého heslo nejde zpátky zjistit.
| Při přihlášení se zadané heslo zahashuje znovu a porovnají se otisky.
|
| Hashuje se samo při user.save() (díky withAuthFinder v app/models/user.ts).
|
*/

import { defineConfig, drivers } from '@adonisjs/core/hash'

const hashConfig = defineConfig({
  default: 'scrypt',

  list: {
    /**
     * Scrypt je záměrně pomalý a náročný na paměť. Pro uživatele je
     * to pár milisekund, ale útočník, který zkouší miliony hesel,
     * by čekal neúnosně dlouho.
     */
    scrypt: drivers.scrypt({
      // Hlavní „obtížnost“ (musí být mocnina 2). Vyšší = bezpečnější, ale pomalejší.
      cost: 16384,
      // Kolik paměti jeden výpočet zabere (lineárně). Doporučeno nechat 8.
      blockSize: 8,
      // Kolik výpočtů běží souběžně. Doporučeno nechat 1.
      parallelization: 1,
      // Pojistka: maximální paměť na jeden výpočet v bajtech (32 MB)
      maxMemory: 33554432,
    }),
  },
})

export default hashConfig

/**
 * Jen pro TypeScript (napovídání v editoru), na chod aplikace nemá vliv.
 */
declare module '@adonisjs/core/types' {
  export interface HashersList extends InferHashers<typeof hashConfig> {}
}
