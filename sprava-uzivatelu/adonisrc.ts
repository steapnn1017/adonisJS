/*
|--------------------------------------------------------------------------
| HLAVNÍ NASTAVENÍ AdonisJS (adonisrc = „AdonisJS run commands“)
|--------------------------------------------------------------------------
|
| Říká frameworku, co má při startu načíst: balíčky (providers),
| soubory ze start/ (preloads) a příkazy pro `node ace`.
|
*/

import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  // Pokusné funkce budoucích verzí AdonisJS – žádné nezapínáme
  experimental: {},

  /**
   * Příkazy pro `node ace ...` z nainstalovaných balíčků
   *   core  = serve (npm run dev), build, list:routes, generate:key…
   *   lucid = migration:run, migration:fresh, db:seed…
   */
  commands: [() => import('@adonisjs/core/commands'), () => import('@adonisjs/lucid/commands')],

  /**
   * Providers = balíčky, které se při startu zapojí do aplikace.
   * Každý přidá jednu schopnost.
   */
  providers: [
    () => import('@adonisjs/core/providers/app_provider'), // základ aplikace
    () => import('@adonisjs/core/providers/hash_provider'), // hashování hesel
    () => import('@adonisjs/core/providers/vinejs_provider'), // validace formulářů
    () => import('@adonisjs/core/providers/edge_provider'), // šablony .edge
    () => import('@adonisjs/session/session_provider'), // session a flash hlášky
    () => import('@adonisjs/vite/vite_provider'), // CSS a JS přes Vite
    () => import('@adonisjs/shield/shield_provider'), // CSRF a bezpečnostní hlavičky
    () => import('@adonisjs/static/static_provider'), // soubory z public/ (po buildu), výchozí nastavení stačí, proto nemá config
    () => import('@adonisjs/lucid/database_provider'), // databáze a modely
    () => import('@adonisjs/auth/auth_provider'), // přihlašování
  ],

  /**
   * Preloads = soubory ze start/, které se načtou hned při startu.
   */
  preloads: [
    () => import('#start/routes'), // adresy aplikace
    () => import('#start/kernel'), // middleware
    () => import('#start/validator'), // české hlášky validace
    () => import('#start/view'), // pomocné funkce pro šablony
  ],

  /**
   * Soubory, které nejsou TypeScript, ale musí se zkopírovat
   * do složky build/ při `npm run build` (šablony a public/).
   * reloadServer: false = při jejich změně se dev server nerestartuje.
   */
  metaFiles: [
    {
      pattern: 'resources/views/**/*.edge',
      reloadServer: false,
    },
    {
      pattern: 'public/**',
      reloadServer: false,
    },
  ],

  /**
   * Při `npm run build` nejdřív zkompiluj CSS a JS přes Vite.
   */
  hooks: {
    buildStarting: [() => import('@adonisjs/vite/build_hook')],
  },
})
