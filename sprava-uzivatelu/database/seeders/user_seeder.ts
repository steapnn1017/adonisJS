/*
|--------------------------------------------------------------------------
| SEEDER: testovací uživatelé
|--------------------------------------------------------------------------
|
| Seeder naplní databázi ukázkovými daty, aby aplikace nebyla prázdná.
| Spuštění: node ace db:seed
|
| Všechny účty mají heslo „heslo1234“. Důležité účty na vyzkoušení:
|   admin@test.cz      – administrátor
|   uzivatel@test.cz   – běžný uživatel
|   blokovany@test.cz  – zablokovaný účet (nepřihlásí se)
|
| Seeder jde pouštět opakovaně: updateOrCreateMany podle e-mailu
| existující účet jen aktualizuje a nevytvoří duplicitu.
|
*/

import User from '#models/user'
import { DateTime } from 'luxon'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const PASSWORD = 'heslo1234'

/**
 * Seznam lidí. Data jsou zadaná RELATIVNĚ k dnešku (před kolika dny),
 * aby statistika „noví za 7 dní“ dávala smysl, ať se seeder spustí kdykoli.
 *
 *   daysAgo          – před kolika dny byl účet založen
 *   lastLoginDaysAgo – před kolika dny se naposledy přihlásil (chybí = nikdy)
 *   role             – chybí = 'user'
 *   isActive         – chybí = true (aktivní)
 */
const people = [
  {
    fullName: 'Jana Nováková',
    email: 'admin@test.cz',
    role: 'admin',
    daysAgo: 64,
    lastLoginDaysAgo: 0,
  },
  { fullName: 'Petr Svoboda', email: 'uzivatel@test.cz', daysAgo: 41, lastLoginDaysAgo: 2 },
  {
    fullName: 'Tomáš Černý',
    email: 'blokovany@test.cz',
    isActive: false,
    daysAgo: 37,
    lastLoginDaysAgo: 30,
  },
  {
    fullName: 'Lucie Dvořáková',
    email: 'lucie.dvorakova@test.cz',
    role: 'admin',
    daysAgo: 52,
    lastLoginDaysAgo: 1,
  },
  { fullName: 'Martin Kučera', email: 'martin.kucera@test.cz', daysAgo: 29, lastLoginDaysAgo: 6 },
  {
    fullName: 'Kateřina Procházková',
    email: 'katerina.prochazkova@test.cz',
    daysAgo: 23,
    lastLoginDaysAgo: 3,
  },
  { fullName: 'Jakub Horák', email: 'jakub.horak@test.cz', daysAgo: 18 },
  { fullName: 'Tereza Němcová', email: 'tereza.nemcova@test.cz', daysAgo: 15, lastLoginDaysAgo: 9 },
  { fullName: 'Ondřej Marek', email: 'ondrej.marek@test.cz', isActive: false, daysAgo: 12 },
  {
    fullName: 'Barbora Pokorná',
    email: 'barbora.pokorna@test.cz',
    daysAgo: 9,
    lastLoginDaysAgo: 4,
  },
  { fullName: 'Filip Pospíšil', email: 'filip.pospisil@test.cz', daysAgo: 6, lastLoginDaysAgo: 1 },
  { fullName: 'Veronika Hájková', email: 'veronika.hajkova@test.cz', daysAgo: 4 },
  { fullName: 'David Král', email: 'david.kral@test.cz', daysAgo: 2, lastLoginDaysAgo: 2 },
  { fullName: 'Adéla Jelínková', email: 'adela.jelinkova@test.cz', daysAgo: 1 },
]

export default class extends BaseSeeder {
  async run() {
    const now = DateTime.now()

    // Z každého člověka v seznamu udělá řádek pro databázi
    const rows = people.map((person) => ({
      fullName: person.fullName,
      email: person.email,
      password: PASSWORD,
      role: person.role ?? 'user',
      isActive: person.isActive ?? true,
      // now.minus({ days: 3 }) = datum před 3 dny
      createdAt: now.minus({ days: person.daysAgo }),
      lastLoginAt:
        person.lastLoginDaysAgo === undefined ? null : now.minus({ days: person.lastLoginDaysAgo }),
    }))

    // Najde podle e-mailu: existuje → aktualizuje, neexistuje → vytvoří
    await User.updateOrCreateMany('email', rows)
  }
}
