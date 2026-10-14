/*
|--------------------------------------------------------------------------
| Routy aplikace
|--------------------------------------------------------------------------
|
| Tři skupiny podle toho, kdo na stránku smí:
|   1. guest  – jen nepřihlášení (login, registrace)
|   2. auth   – každý přihlášený (přehled, vlastní nastavení)
|   3. admin  – jen administrátoři (správa uživatelů)
|
| Výpis všech rout i s jejich názvy: node ace list:routes
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

// Úvodní adresa nic nezobrazuje – přihlášeného pošle na přehled, ostatní auth middleware na login
router.on('/').redirect('dashboard')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.get('dashboard', [controllers.Dashboard, 'index']).as('dashboard')
    router.post('logout', [controllers.Session, 'destroy'])

    router.get('settings/profile', [controllers.Profile, 'edit']).as('profile.edit')
    router.put('settings/profile', [controllers.Profile, 'update']).as('profile.update')
    router.get('settings/password', [controllers.Password, 'edit']).as('password.edit')
    router.put('settings/password', [controllers.Password, 'update']).as('password.update')
  })
  .use(middleware.auth())

/**
 * resource() vytvoří najednou všech 7 REST rout (index, create, store, show, edit, update, destroy).
 * show nepotřebujeme, detail = formulář úprav. where() zajistí, že :id je číslo.
 */
router
  .resource('users', controllers.Users)
  .except(['show'])
  .where('id', router.matchers.number())
  .use('*', [middleware.auth(), middleware.admin()])
