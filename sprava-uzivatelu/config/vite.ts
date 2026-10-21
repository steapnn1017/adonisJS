/*
|--------------------------------------------------------------------------
| VITE – napojení CSS a JS na šablony (strana serveru)
|--------------------------------------------------------------------------
|
| Vite zpracovává resources/css/app.css a resources/js/app.js.
| V šabloně se vkládají přes @vite([...]) (viz components/head.edge).
|
|   vývoj (npm run dev)    – Vite je servíruje živě a po změně obnoví stránku
|   produkce (npm run build) – zkompiluje je do public/assets/
|
| Nastavení pro samotný Vite je ve vite.config.ts v kořeni projektu.
|
*/

import { defineConfig } from '@adonisjs/vite'

export default defineConfig({
  // Kam npm run build uloží hotové soubory
  buildDirectory: 'public/assets',

  // Seznam vygenerovaných souborů (podle něj @vite najde správný název)
  manifestFile: 'public/assets/.vite/manifest.json',

  // Adresa, na které jsou soubory dostupné v prohlížeči
  assetsUrl: '/assets',

  // defer = JS se spustí až po načtení celého HTML (stránka se nezdrží)
  scriptAttributes: {
    defer: true,
  },
})
