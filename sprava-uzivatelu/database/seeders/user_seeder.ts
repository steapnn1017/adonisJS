import User from '#models/user'
import { DateTime } from 'luxon'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

/**
 * Testovací data. Spuštění: node ace db:seed
 * Seeder je idempotentní – updateOrCreateMany podle e-mailu, takže ho jde pouštět opakovaně
 * bez duplicit. Všechny účty mají heslo "heslo1234".
 *
 * Data jsou relativní k dnešku (daysAgo), aby statistika "noví za 7 dní"
 * dávala smysl, ať se seeder spustí kdykoli.
 */
const PASSWORD = 'heslo1234'

const people: Array<{
  fullName: string
  email: string
  role?: 'admin' | 'user'
  isActive?: boolean
  daysAgo: number
  lastLoginDaysAgo?: number
}> = [
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

    await User.updateOrCreateMany(
      'email',
      people.map(({ daysAgo, lastLoginDaysAgo, role = 'user', isActive = true, ...person }) => ({
        ...person,
        role,
        isActive,
        password: PASSWORD,
        createdAt: now.minus({ days: daysAgo, hours: daysAgo % 5 }),
        lastLoginAt:
          lastLoginDaysAgo === undefined ? null : now.minus({ days: lastLoginDaysAgo, hours: 3 }),
      }))
    )
  }
}
