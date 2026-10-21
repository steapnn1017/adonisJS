/*
|--------------------------------------------------------------------------
| ZPRACOVÁNÍ CHYB
|--------------------------------------------------------------------------
|
| Když v aplikaci vznikne chyba, skončí tady. Registrace: start/kernel.ts
| → server.errorHandler(...)
|
| Prázdná třída stačí, všechno potřebné dědí od ExceptionHandler z AdonisJS:
|   • chyba validace      → vrátí uživatele na formulář, chyby ukáže pod poli
|   • nepřihlášený        → přesměruje na /login
|   • jiná chyba (vývoj)  → detailní ladicí stránka (kde chyba vznikla, výpis kódu)
|   • jiná chyba (produkce) → jen krátká hláška, bez detailů kódu
|
| Proč soubor nesmazat: bez něj by AdonisJS použil úplně holý handler,
| který jen vypíše text chyby. Nepřihlášeného by pak nepřesměroval na
| přihlášení a formulář s chybou by se nevrátil s hláškami.
|
*/

import { ExceptionHandler } from '@adonisjs/core/http'

export default class HttpExceptionHandler extends ExceptionHandler {}
