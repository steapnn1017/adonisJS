/*
|--------------------------------------------------------------------------
| ČTENÍ DAT Z FORMULÁŘŮ (bodyparser)
|--------------------------------------------------------------------------
|
| Bodyparser přečte data odeslaná formulářem, aby šla v controlleru
| získat přes request.input('email') nebo request.validateUsing(...).
|
| Výchozí nastavení AdonisJS nám stačí, proto je objekt prázdný.
| Výchozí chování, se kterým aplikace počítá:
|   • mezery na začátku a konci textu se oříznou
|   • prázdné pole ('') se změní na null
|     (proto prázdné heslo při úpravě uživatele = „heslo neměnit“)
|
*/

import { defineConfig } from '@adonisjs/core/bodyparser'

export default defineConfig({})
