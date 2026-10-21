/*
|--------------------------------------------------------------------------
| START PŘÍKAZOVÉ ŘÁDKY „ACE“
|--------------------------------------------------------------------------
|
| Ace = příkazy AdonisJS v terminálu, např.:
|   node ace migration:run   node ace db:seed   node ace list:routes
|
| `node ace ...` spustí ace.js v kořeni projektu a ten spustí tenhle soubor.
| Běžně se needituje. Vysvětlení jednotlivých řádků je v bin/server.ts,
| liší se jen poslední částí (.ace() místo .httpServer()).
|
*/

await import('reflect-metadata')
const { Ignitor, prettyPrintError } = await import('@adonisjs/core/ignitor')

// Kořen projektu (o složku výš než bin/)
const APP_ROOT = new URL('../', import.meta.url)

// Načítání souborů aplikace: relativní cesty od kořene projektu, ostatní jako balíčky
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  // Spusť příkaz napsaný v terminálu (argumenty za `node ace`)
  .ace()
  .handle(process.argv.splice(2))
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
