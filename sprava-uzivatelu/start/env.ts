/*
|--------------------------------------------------------------------------
| PROMĚNNÉ PROSTŘEDÍ (.env)
|--------------------------------------------------------------------------
|
| Hodnoty jako port nebo tajný klíč nejsou v kódu, ale v souboru .env
| (ten se do gitu nedává, vzor je v .env.example).
|
| Tady se při startu zkontroluje, že v .env je všechno, co aplikace
| potřebuje, a ve správném tvaru. Když něco chybí, aplikace vůbec
| nenastartuje a rovnou napíše, co je špatně.
|
| V kódu se hodnota čte přes env.get('PORT').
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Režim běhu: vývoj (npm run dev), nebo produkce (npm start)
  NODE_ENV: Env.schema.enum(['development', 'production'] as const),
  // Port a adresa, na které server poslouchá (výchozí localhost:3333)
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  // Kolik toho logovat do terminálu (info, debug, warn, error…)
  LOG_LEVEL: Env.schema.string(),

  // Tajný klíč pro šifrování cookies a session. Vygeneruje: node ace generate:key
  APP_KEY: Env.schema.secret(),
})
