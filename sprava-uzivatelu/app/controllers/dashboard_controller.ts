import User from '#models/user'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Úvodní stránka po přihlášení.
 * Admin vidí přehled všech účtů, běžný uživatel jen ten svůj.
 */
export default class DashboardController {
  async index({ auth, view }: HttpContext) {
    const user = auth.getUserOrFail()
    if (!user.isAdmin) {
      return view.render('pages/dashboard', { stats: null, recentUsers: [] })
    }

    const weekAgo = DateTime.now().minus({ days: 7 }).toSQL()!

    /**
     * Všechna čísla jedním dotazem – každý SUM(CASE…) spočítá jednu dlaždici.
     * Je to rychlejší než čtyři samostatné COUNT dotazy.
     */
    const row = await User.query()
      .count('* as total')
      .select(
        User.query().client.raw('SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active'),
        User.query().client.raw("SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins"),
        User.query().client.raw('SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as newThisWeek', [
          weekAgo,
        ])
      )
      .firstOrFail()

    const stats = {
      total: Number(row.$extras.total),
      active: Number(row.$extras.active),
      admins: Number(row.$extras.admins),
      newThisWeek: Number(row.$extras.newThisWeek),
    }

    const recentUsers = await User.query().orderBy('created_at', 'desc').limit(5)

    return view.render('pages/dashboard', { stats, recentUsers })
  }
}
