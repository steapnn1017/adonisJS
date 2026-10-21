/*
|--------------------------------------------------------------------------
| PŘEHLED (úvodní stránka po přihlášení)
|--------------------------------------------------------------------------
|
| Routa: GET /dashboard → index()
| Šablona: resources/views/pages/dashboard.edge
|
| Admin vidí čísla o všech účtech a 5 nejnovějších uživatelů.
| Běžný uživatel vidí jen kartu svého účtu.
|
*/

import User from '#models/user'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  async index({ auth, view }: HttpContext) {
    // auth.user = přihlášený uživatel (middleware auth zaručí, že existuje)
    const me = auth.user!

    // Běžný uživatel žádné statistiky nedostane, šablona mu ukáže jen jeho účet
    if (!me.isAdmin) {
      return view.render('pages/dashboard', { stats: null, recentUsers: [] })
    }

    /**
     * Načteme všechny uživatele a spočítáme čísla v JavaScriptu.
     * Pro testovací aplikaci s pár desítkami účtů je to nejjednodušší
     * a nejčitelnější řešení. U tisíců účtů by se počítalo přímo
     * v databázi (SQL COUNT), aby se nemusely načítat všechny řádky.
     */
    const allUsers = await User.all()
    const weekAgo = DateTime.now().minus({ days: 7 })

    // filter() vrátí jen ty, pro které platí podmínka, .length = kolik jich je
    const stats = {
      total: allUsers.length,
      active: allUsers.filter((user) => user.isActive).length,
      admins: allUsers.filter((user) => user.isAdmin).length,
      newThisWeek: allUsers.filter((user) => user.createdAt >= weekAgo).length,
    }

    // 5 nejnovějších účtů (seřazeno podle data založení, od nejnovějšího)
    const recentUsers = await User.query().orderBy('created_at', 'desc').limit(5)

    // Druhý parametr render() = proměnné, které budou dostupné v šabloně
    return view.render('pages/dashboard', { stats, recentUsers })
  }
}
