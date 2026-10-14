import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Testy správy uživatelů. Každý test běží v transakci, která se na konci
 * vrátí (withGlobalTransaction), takže testy se navzájem neovlivňují.
 *
 * .redirects(0) = nesledovat přesměrování, chceme vidět přímo 302 a kam vede.
 */
const PASSWORD = 'heslo1234'

function makeUser(overrides: Partial<User> = {}) {
  return User.create({
    fullName: 'Petr Svoboda',
    email: `user${Math.random().toString(36).slice(2, 8)}@test.cz`,
    password: PASSWORD,
    role: 'user',
    isActive: true,
    ...overrides,
  })
}

test.group('Správa uživatelů: přístup', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('nepřihlášeného pošle na login', async ({ client }) => {
    const response = await client.get('/users').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('běžného uživatele nepustí a vrátí na přehled', async ({ client }) => {
    const user = await makeUser()
    const response = await client.get('/users').loginAs(user).redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/dashboard')
    response.assertFlashMessage('error', 'Na tuhle stránku nemáš oprávnění.')
  })

  test('admin vidí seznam uživatelů', async ({ client }) => {
    const admin = await makeUser({ role: 'admin', fullName: 'Jana Nováková' })
    await makeUser({ fullName: 'Lucie Dvořáková' })

    const response = await client.get('/users').loginAs(admin)
    response.assertStatus(200)
    response.assertTextIncludes('Lucie Dvořáková')
  })

  test('hledání a filtr role zúží výsledky', async ({ client }) => {
    const admin = await makeUser({ role: 'admin', fullName: 'Jana Nováková' })
    await makeUser({ fullName: 'Lucie Dvořáková' })
    await makeUser({ fullName: 'Martin Kučera' })

    const search = await client.get('/users').qs({ q: 'Kučera' }).loginAs(admin)
    search.assertTextIncludes('Martin Kučera')
    search.assert!.notInclude(search.text(), 'Lucie Dvořáková')

    const admins = await client.get('/users').qs({ role: 'admin' }).loginAs(admin)
    admins.assertTextIncludes('Jana Nováková')
    admins.assert!.notInclude(admins.text(), 'Martin Kučera')
  })
})

test.group('Správa uživatelů: úpravy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('admin založí uživatele a heslo se uloží jako hash', async ({ client, assert }) => {
    const admin = await makeUser({ role: 'admin' })

    const response = await client
      .post('/users')
      .form({
        fullName: 'Tereza Němcová',
        email: 'tereza@test.cz',
        role: 'user',
        isActive: '1',
        password: 'tajneheslo',
      })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/users')

    const created = await User.findByOrFail('email', 'tereza@test.cz')
    assert.isTrue(created.isActive)
    assert.notEqual(created.password, 'tajneheslo')
  })

  test('duplicitní e-mail neprojde validací', async ({ client }) => {
    const admin = await makeUser({ role: 'admin' })
    const existing = await makeUser()

    const response = await client
      .post('/users')
      .form({ fullName: 'Kopie', email: existing.email, role: 'user', password: 'tajneheslo' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    response.assertStatus(302)
    response.assertFlashMessage('inputErrorsBag', {
      email: ['Tento e-mail už používá jiný účet.'],
    })
  })

  test('úprava bez hesla heslo nezmění, nezaškrtnutý checkbox účet zablokuje', async ({
    client,
    assert,
  }) => {
    const admin = await makeUser({ role: 'admin' })
    const user = await makeUser()
    const oldHash = user.password

    await client
      .put(`/users/${user.id}`)
      .form({ fullName: 'Petr Nový', email: user.email, role: 'user', password: '' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)

    await user.refresh()
    assert.equal(user.fullName, 'Petr Nový')
    assert.isFalse(user.isActive)
    assert.equal(user.password, oldHash)
  })

  test('admin nesmaže sám sebe ani si neodebere roli', async ({ client, assert }) => {
    const admin = await makeUser({ role: 'admin' })

    const del = await client
      .delete(`/users/${admin.id}`)
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    del.assertFlashMessage('error', 'Svůj vlastní účet smazat nemůžeš.')

    const demote = await client
      .put(`/users/${admin.id}`)
      .form({ fullName: 'Admin', email: admin.email, role: 'user', isActive: '1' })
      .loginAs(admin)
      .withCsrfToken()
      .redirects(0)
    demote.assertFlashMessage('error', 'Sám sobě nemůžeš odebrat roli admina ani zablokovat účet.')

    await admin.refresh()
    assert.equal(admin.role, 'admin')
  })

  test('admin smaže jiného uživatele', async ({ client, assert }) => {
    const admin = await makeUser({ role: 'admin' })
    const user = await makeUser()

    await client.delete(`/users/${user.id}`).loginAs(admin).withCsrfToken().redirects(0)

    assert.isNull(await User.find(user.id))
  })
})
