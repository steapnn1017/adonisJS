/*
|--------------------------------------------------------------------------
| START HTTP SERVERU
|--------------------------------------------------------------------------
|
| Vstupní bod webové aplikace. Spouští se:
|   npm run dev    – přes `node ace serve`, který navíc hlídá změny v souborech
|   npm start      – na produkci po `npm run build` (spustí build/bin/server.js)
|
| Tenhle soubor se běžně needituje, je stejný v každé AdonisJS aplikaci.
| (bin/console.ts je skoro stejný, jen místo serveru startuje příkazy ace.)
|
*/

// Knihovna nutná pro dekorátory (@column v modelu)
await import('reflect-metadata')
const { Ignitor, prettyPrintError } = await import('@adonisjs/core/ignitor')

/**
 * Cesta ke kořeni projektu (o složku výš než bin/).
 * Podle ní AdonisJS najde config/, app/, start/…
 */
const APP_ROOT = new URL('../', import.meta.url)

/**
 * Funkce, kterou AdonisJS načítá soubory aplikace.
 * Relativní cesty (./, ../) bere od kořene projektu, ostatní jako balíčky.
 */
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

/**
 * Ignitor = „zapalovač“, který aplikaci nastartuje.
 */
new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    // Při startu nejdřív načti a zkontroluj .env (start/env.ts)
    app.booting(async () => {
      await import('#start/env')
    })
    // Při ukončení procesu (Ctrl+C, restart serveru) aplikaci slušně vypni
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .httpServer()
  .start()
  .catch((error) => {
    // Když start selže, vypiš chybu čitelně a skonči s chybovým kódem
    process.exitCode = 1
    prettyPrintError(error)
  })
