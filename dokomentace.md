# AdonisJS: plusy a mínusy

Můj názor po prvním projektu | Štěpán Hajda, 14. 10. 2026

---

## O co šlo

AdonisJS se často popisuje jako „Laravel pro Node.js“. Laravel znám, takže mě zajímalo, jestli to sedí. Abych to nehodnotil jen podle dokumentace, udělal jsem si malou aplikaci na **správu uživatelů**: přihlášení, role admin a uživatel, seznam s hledáním a filtry, zakládání, úpravy, blokování a mazání účtů a k tomu 14 automatických testů. Použil jsem AdonisJS 7, databázi SQLite a šablony Edge.

## Co se mi líbilo

1. **Všechno je v krabici.** Nemusel jsem shánět knihovny na přihlášení, validaci, práci s databází, ochranu formulářů ani testy. Starter kit to měl připravené a fungovalo to spolu hned. U Expressu bych strávil dost času jen vybíráním a propojováním balíčků.
2. **Struktura jako v Laravelu.** Controllery, middleware, migrace, seedery a routy v jednom souboru. Kdo zná Laravel, zorientuje se za pár minut. Jeden řádek `router.resource('users', ...)` mi udělal všech sedm rout pro správu uživatelů.
3. **TypeScript opravdu chytá chyby.** Názvy rout jsou typované. Když jsem v kódu přesměroval na routu, kterou jsem ještě neměl, kontrola typů mi to řekla hned. V Laravelu by se taková chyba ukázala až ve chvíli, kdy na to někdo klikne.
4. **Schéma databáze se generuje samo.** Po každé migraci si Lucid sám vytvoří soubor s typy všech sloupců. Model tak nepíšu dvakrát a nemůže se stát, že bude jiný než tabulka. Tohle je novinka verze 7 a moc se mi líbí.
5. **Testy se píšou příjemně.** Zápis `client.post('/users').loginAs(admin).withCsrfToken()` je skoro čitelný jako věta. Každý test běží v databázové transakci, která se na konci vrátí, takže se data uklidí sama. Všech 14 testů proběhne zhruba za sekundu.
6. **Validace je přehledná.** Pravidla ve VineJS se dobře čtou a všechny chybové hlášky jsem počeštil na jednom místě pro celou aplikaci.

## Co mě štvalo

1. **Start nebyl hladký.** Verze 7 potřebuje Node.js 24 a já měl 22, takže jsem musel doinstalovat novější Node. Instalátor navíc spadl, protože jsem podle starších návodů zadal starý název šablony (`web`, dnes je to `hypermedia`).
2. **Malá komunita.** Když se něco pokazí, odpověď na Stack Overflow většinou není, nebo je pro starou verzi. Pár věcí jsem dohledával přímo ve zdrojovém kódu balíčků. U Laravelu najdu odpověď skoro na všechno během chvilky.
3. **Návody stárnou rychle.** Mezi verzemi 5, 6 a 7 se měnilo API (třeba `vine.compile` se změnilo na `vine.create`). Kód ze starších tutoriálů i rady od AI asistentů proto často nefungují a člověk musí kontrolovat, pro jakou verzi jsou.
4. **Drobné zádrhele.** SQLite vrací ano/ne jako 0 a 1, takže jsem musel do modelu dopsat převod. Vlastní chyba u pole „současné heslo“ se mi napoprvé nezobrazila, protože AdonisJS má dva různé seznamy chyb (`errorsBag` a `inputErrorsBag`) a z dokumentace to není hned jasné. Přišel jsem na to až díky testu.
5. **Edge šablony jsou trochu osamocené.** Fungují dobře, ale skoro nikdo jiný je nepoužívá, takže k nim není moc hotových komponent. Na větší frontend bych stejně sáhl po Reactu přes Inertii, což Adonis umí, jen je to pak další vrstva navíc.

## Srovnání

Krátce, jak to vidím vedle frameworků, které znám:

|  | AdonisJS | Laravel | Express |
|---|---|---|---|
| **Co je v základu** | přihlášení, ORM, validace, testy | to samé a ještě fronty, maily, plánovač | skoro nic, skládám si sám |
| **Jazyk** | TypeScript | PHP | JavaScript / TypeScript |
| **Komunita a návody** | malá, hodně starých verzí | obrovská | velká |
| **Jak rychle začnu** | rychle, když vím co dělám | nejrychleji (znám ho) | pomalu |
| **Kontrola chyb předem** | velmi dobrá (typy, routy) | slabší | záleží na mně |

## Můj verdikt

AdonisJS mě mile překvapil. Opravdu je to takový Laravel v TypeScriptu a na malou nebo středně velkou aplikaci by mi úplně stačil. Nejvíc oceňuju, že všechno do sebe zapadá a že spoustu chyb najde kontrola typů dřív, než je uvidí uživatel.

Pro školní projekt nebo pro klienta bych ho ale zatím nevolil jako první. Laravel umím rychleji, má mnohem větší komunitu a když se zaseknu, najdu pomoc. Adonis bych použil hlavně tam, kde chci mít backend i frontend v jednom jazyce, nebo když tým umí JavaScript a PHP ne.

**Celkově: 7 z 10.** Kdyby měl větší komunitu a stabilnější návody, dal bych víc.
