import User, { USER_ROLES, type UserRole } from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

const PER_PAGE = 10
const STATUSES = ['active', 'blocked'] as const

/**
 * Správa uživatelů – dostupná jen pro adminy (hlídá middleware.admin() v routes.ts).
 * Klasický CRUD: výpis s hledáním a filtry, vytvoření, úprava, smazání.
 */
export default class UsersController {
  /**
   * Seznam uživatelů. Filtry chodí v query stringu (?q=&role=&status=&page=),
   * takže jde odkaz na vyfiltrovaný seznam poslat dál nebo dát do záložek.
   */
  async index({ request, view }: HttpContext) {
    const q = String(request.input('q', '')).trim()
    // Hodnoty z URL nikdy nepouštíme do dotazu napřímo – jen ty, které známe
    const role = pick(request.input('role'), USER_ROLES)
    const status = pick(request.input('status'), STATUSES)
    const page = Math.max(1, Number(request.input('page', 1)) || 1)

    const users = await User.query()
      .if(q, (query) => {
        // Závorka kolem OR, jinak by se rozbila kombinace s dalšími filtry
        query.where((sub) => sub.whereLike('full_name', `%${q}%`).orWhereLike('email', `%${q}%`))
      })
      .if(role, (query) => query.where('role', role!))
      .if(status, (query) => query.where('is_active', status === 'active'))
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .paginate(page, PER_PAGE)

    // Stránkovací odkazy si musí pamatovat aktivní filtry
    users.baseUrl(request.url()).queryString({ q, role, status })

    return view.render('pages/users/index', {
      users,
      filters: { q, role, status },
      hasFilters: Boolean(q || role || status),
    })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/users/create')
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const user = await User.create({ ...payload, isActive: payload.isActive ?? false })

    session.flash('success', `Uživatel ${user.displayName} byl vytvořen.`)
    return response.redirect().withQs(false).toRoute('users.index')
  }

  async edit({ params, view }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return view.render('pages/users/edit', { user })
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const {
      password,
      isActive = false,
      ...payload
    } = await request.validateUsing(updateUserValidator, { meta: { userId: user.id } })

    const lockout = selfLockoutError(auth.getUserOrFail(), user, { role: payload.role, isActive })
    if (lockout) {
      session.flash('error', lockout)
      return response.redirect().back()
    }

    user.merge({ ...payload, isActive })
    // Prázdné heslo = beze změny. Nové heslo se zahashuje samo díky withAuthFinder.
    if (password) user.password = password
    await user.save()

    session.flash('success', 'Změny byly uloženy.')
    return response.redirect().withQs(false).toRoute('users.index')
  }

  async destroy({ params, response, session, auth }: HttpContext) {
    const user = await User.findOrFail(params.id)

    const lockout = selfLockoutError(auth.getUserOrFail(), user, 'delete')
    if (lockout) {
      session.flash('error', lockout)
      return response.redirect().back()
    }

    await user.delete()
    session.flash('success', `Uživatel ${user.displayName} byl smazán.`)
    return response.redirect().back()
  }
}

/**
 * Ochrana proti tomu, aby se admin sám odřízl od administrace.
 * Stačí hlídat vlastní účet: kdo tuhle akci provádí, je aktivní admin,
 * takže v systému vždy zůstane aspoň jeden (on sám).
 */
function selfLockoutError(
  actor: User,
  target: User,
  change: 'delete' | { role: UserRole; isActive: boolean }
) {
  if (actor.id !== target.id) return null
  if (change === 'delete') return 'Svůj vlastní účet smazat nemůžeš.'
  if (change.role !== 'admin' || !change.isActive) {
    return 'Sám sobě nemůžeš odebrat roli admina ani zablokovat účet.'
  }
  return null
}

/**
 * Vrátí hodnotu jen tehdy, když patří mezi povolené – jinak undefined (= filtr se nepoužije).
 */
function pick<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined
}
