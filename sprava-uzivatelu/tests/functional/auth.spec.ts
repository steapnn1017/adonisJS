import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

const PASSWORD = 'heslo1234'

test.group('Přihlášení a vlastní účet', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('správné údaje přihlásí a uloží čas posledního přihlášení', async ({ client, assert }) => {
    const user = await User.create({
      fullName: 'Eva Veselá',
      email: 'eva@test.cz',
      password: PASSWORD,
    })

    const response = await client
      .post('/login')
      .form({ email: 'eva@test.cz', password: PASSWORD })
      .withCsrfToken()
      .redirects(0)

    response.assertHeader('location', '/dashboard')
    await user.refresh()
    assert.isNotNull(user.lastLoginAt)
  })

  test('špatné heslo vrátí českou chybu', async ({ client }) => {
    await User.create({ email: 'eva@test.cz', password: PASSWORD })

    const response = await client
      .post('/login')
      .form({ email: 'eva@test.cz', password: 'spatne-heslo' })
      .withCsrfToken()
      .redirects(0)

    response.assertFlashMessage('error', 'Nesprávný e-mail nebo heslo.')
  })

  test('zablokovaný účet se nepřihlásí', async ({ client }) => {
    await User.create({ email: 'blok@test.cz', password: PASSWORD, isActive: false })

    const response = await client
      .post('/login')
      .form({ email: 'blok@test.cz', password: PASSWORD })
      .withCsrfToken()
      .redirects(0)

    response.assertFlashMessage('error', 'Tvůj účet je zablokovaný. Obrať se na administrátora.')
  })

  test('zablokování platí hned i pro už přihlášeného', async ({ client }) => {
    const user = await User.create({ email: 'blok@test.cz', password: PASSWORD, isActive: false })

    const response = await client.get('/dashboard').loginAs(user).redirects(0)
    response.assertHeader('location', '/login')
  })

  test('změna hesla vyžaduje správné současné heslo', async ({ client, assert }) => {
    const user = await User.create({ email: 'eva@test.cz', password: PASSWORD })

    const wrong = await client
      .put('/settings/password')
      .form({
        currentPassword: 'nevim',
        password: 'noveheslo1',
        passwordConfirmation: 'noveheslo1',
      })
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
    wrong.assertFlashMessage('inputErrorsBag', {
      currentPassword: ['Současné heslo není správné.'],
    })

    await client
      .put('/settings/password')
      .form({
        currentPassword: PASSWORD,
        password: 'noveheslo1',
        passwordConfirmation: 'noveheslo1',
      })
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)

    const verified = await User.verifyCredentials('eva@test.cz', 'noveheslo1')
    assert.equal(verified.id, user.id)
  })
})
