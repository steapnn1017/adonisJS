/*
|--------------------------------------------------------------------------
| SPOUŠTĚČ PŘÍKAZŮ `node ace ...`
|--------------------------------------------------------------------------
|
| NEUPRAVOVAT – AdonisJS tenhle soubor při buildu přepisuje.
|
| Node.js sám neumí spustit TypeScript. Tenhle malý JavaScriptový soubor
| proto nejdřív zapne překlad TypeScriptu za běhu (@poppinss/ts-exec)
| a pak spustí skutečný vstupní bod bin/console.ts.
|
*/

// Zapne spouštění .ts souborů přímo v Node.js
import '@poppinss/ts-exec'

// Spustí příkazovou řádku ace (bin/console.ts, po překladu .js)
await import('./bin/console.js')
