/*
|--------------------------------------------------------------------------
| VITE – nástroj, který zpracovává CSS a JavaScript
|--------------------------------------------------------------------------
|
| Při vývoji (npm run dev) servíruje resources/css/app.css a
| resources/js/app.js a po uložení změny sám obnoví stránku v prohlížeči.
| Při npm run build je zabalí a zmenší do public/assets/.
|
| Nastavení na straně AdonisJS (kam se build ukládá) je v config/vite.ts.
|
*/

import { defineConfig } from 'vite'
import adonisjs from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [
    adonisjs({
      // Vstupní soubory. Každý se zpracuje zvlášť a do HTML ho vloží @vite.
      entryPoints: ['resources/css/app.css', 'resources/js/app.js'],

      // Po změně šablony .edge obnovit stránku v prohlížeči
      reload: ['resources/views/**/*.edge'],
    }),
  ],

  server: {
    watch: {
      // Změny v tmp/ (databáze) nehlídat, jinak by se stránka obnovovala při každém uložení dat
      ignored: ['**/storage/**', '**/tmp/**'],
    },
  },
})
