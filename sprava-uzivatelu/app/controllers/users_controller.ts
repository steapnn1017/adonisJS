/*
|--------------------------------------------------------------------------
| SPRÁVA UŽIVATELŮ (jen pro adminy)
|--------------------------------------------------------------------------
|
| Routy vytváří router.resource('users') v start/routes.ts:
|   GET    /users           → index()    seznam s hledáním a filtry
|   GET    /users/create    → create()   formulář pro nového uživatele
|   POST   /users           → store()    uloží nového uživatele
|   GET    /users/:id/edit  → edit()     formulář úpravy
|   PUT    /users/:id       → update()   uloží úpravy
|   DELETE /users/:id       → destroy()  smaže uživatele
|
| Že sem smí jen admin, hlídá middleware admin (app/middleware/), ne tenhle soubor.
| Šablony: resources/views/pages/users/
|
*/

import User from '#models/user'
import { createUserValidator, updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

// Kolik uživatelů se ukáže na jedné stránce seznamu
const PER_PAGE = 10

export default class UsersController {
  /**
   * Seznam uživatelů s hledáním, filtry a stránkováním.
   *
   * Filtry chodí v adrese (query string), např. /users?q=jana&role=admin&page=2.
   * Díky tomu jde vyfiltrovaný seznam poslat odkazem nebo dát do záložek.
   */
  async index({ request, view }: HttpContext) {
    // request.input('q', '') = hodnota ?q= z adresy, když chybí, tak ''
    const q = String(request.input('q', '')).trim()
    const role = request.input('role', '')
    const status = request.input('status', '')
    const page = Number(request.input('page', 1)) || 1

    // Začneme dotaz: všichni uživatelé, nejnovější nahoře.
    // Dotaz se zatím NEspustí, jen se skládá. Spustí ho až paginate() dole.
    const query = User.query().orderBy('created_at', 'desc').orderBy('id', 'desc')

    // Hledání ve jméně NEBO e-mailu. % = „cokoli“, takže %jana% najde i „Jana Nová“.
    // Podmínky jsou v závorce (funkce uvnitř where), jinak by se OR
    // pobilo s dalšími filtry a vracelo by špatné výsledky.
    if (q) {
      query.where((sub) => {
        sub.whereLike('full_name', `%${q}%`).orWhereLike('email', `%${q}%`)
      })
    }

    // Filtr role. Do dotazu pustíme jen hodnoty, které známe,
    // nikdy ne cokoli, co někdo napíše do adresy.
    if (role === 'admin' || role === 'user') {
      query.where('role', role)
    }

    // Filtr stavu účtu
    if (status === 'active') query.where('is_active', true)
    if (status === 'blocked') query.where('is_active', false)

    // Spustí dotaz a vrátí jen jednu stránku výsledků (+ celkový počet)
    const users = await query.paginate(page, PER_PAGE)

    // Odkazy „Další / Předchozí“ musí v adrese nést i aktivní filtry,
    // jinak by se na druhé stránce filtr ztratil
    users.baseUrl('/users').queryString({ q, role, status })

    return view.render('pages/users/index', {
      users,
      filters: { q, role, status },
      hasFilters: Boolean(q || role || status),
    })
  }

  /**
   * Formulář pro nového uživatele.
   */
  async create({ view }: HttpContext) {
    return view.render('pages/users/create')
  }

  /**
   * Uloží nového uživatele.
   */
  async store({ request, response, session }: HttpContext) {
    // Zvaliduj data. Při chybě se uživatel SÁM vrátí na formulář s hláškami.
    const data = await request.validateUsing(createUserValidator)

    // Nezaškrtnutý checkbox nepřijde vůbec (undefined) → uložíme false.
    // ?? = „když vlevo nic není, použij hodnotu vpravo“
    const user = await User.create({ ...data, isActive: data.isActive ?? false })

    session.flash('success', `Uživatel ${user.displayName} byl vytvořen.`)
    return response.redirect().toRoute('users.index')
  }

  /**
   * Formulář úpravy.
   * findOrFail = najdi podle ID, a když neexistuje, vrať stránku 404.
   * params.id = číslo z adresy /users/:id/edit
   */
  async edit({ params, view }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return view.render('pages/users/edit', { user })
  }

  /**
   * Uloží úpravy uživatele.
   */
  async update({ params, request, response, session, auth }: HttpContext) {
    const user = await User.findOrFail(params.id)

    // meta.userId = validátor ví, čí e-mail nemá hlásit jako „už použitý“
    const data = await request.validateUsing(updateUserValidator, {
      meta: { userId: user.id },
    })
    const isActive = data.isActive ?? false

    /**
     * Ochrana: admin si nesmí sám sobě odebrat roli admina ani zablokovat
     * účet. Jinak by se mohl odříznout od administrace a v aplikaci by
     * nakonec nemusel zůstat žádný admin.
     */
    const isMe = user.id === auth.user!.id
    if (isMe && (data.role !== 'admin' || !isActive)) {
      session.flash('error', 'Sám sobě nemůžeš odebrat roli admina ani zablokovat účet.')
      return response.redirect().back()
    }

    user.fullName = data.fullName
    user.email = data.email
    user.role = data.role
    user.isActive = isActive

    // Prázdné heslo = nechat to staré. Nové heslo se při save() samo
    // zahashuje (zařizuje to withAuthFinder v modelu User).
    if (data.password) {
      user.password = data.password
    }

    await user.save()

    session.flash('success', 'Změny byly uloženy.')
    return response.redirect().toRoute('users.index')
  }

  /**
   * Smaže uživatele.
   */
  async destroy({ params, response, session, auth }: HttpContext) {
    const user = await User.findOrFail(params.id)

    // Ochrana: admin nesmí smazat sám sebe (tlačítko se mu ani neukáže,
    // tohle hlídá i případ, kdy by někdo poslal požadavek ručně)
    if (user.id === auth.user!.id) {
      session.flash('error', 'Svůj vlastní účet smazat nemůžeš.')
      return response.redirect().withQs().back()
    }

    await user.delete()

    session.flash('success', `Uživatel ${user.displayName} byl smazán.`)
    // back() = zpět na stránku, odkud požadavek přišel (seznam uživatelů).
    // withQs() = i s jejími ?parametry, takže zůstanou filtry a číslo stránky.
    return response.redirect().withQs().back()
  }
}
