/*
|--------------------------------------------------------------------------
| VALIDÁTORY = pravidla pro data z formulářů
|--------------------------------------------------------------------------
|
| Data z formuláře nikdy nejdou rovnou do databáze. Nejdřív projdou
| validátorem, který zkontroluje, že jsou v pořádku (povinná pole,
| délka, platný e-mail…).
|
| Použití v controlleru:
|   const data = await request.validateUsing(loginValidator)
|
| Když data neprojdou, AdonisJS SÁM vrátí uživatele zpět na formulář
| a chyby ukáže pod jednotlivými poli. Controller dál vůbec nepokračuje.
|
| Knihovna se jmenuje VineJS. České texty chyb jsou v start/validator.ts.
|
*/

import vine from '@vinejs/vine'

/*
|--------------------------------------------------------------------------
| Sdílená pravidla pro jednotlivá pole
|--------------------------------------------------------------------------
| Každé pravidlo je napsané jen jednou a validátory dole je skládají.
| Jsou to funkce (() => …), protože každý validátor potřebuje vlastní
| čerstvou kopii pravidla. Kdyby se sdílela jedna, úprava v jednom
| validátoru (např. .sameAs()) by se projevila i ve všech ostatních.
*/

// Jméno: text, mezery na krajích se oříznou, 2 až 100 znaků
const fullName = () => vine.string().trim().minLength(2).maxLength(100)

// E-mail: platný formát, max. 254 znaků (víc e-mail podle normy mít nemůže)
const email = () => vine.string().trim().email().maxLength(254)

// Heslo: 8 až 32 znaků
const password = () => vine.string().minLength(8).maxLength(32)

// Role: jen jedna z těchto dvou hodnot, nic jiného neprojde
const role = () => vine.enum(['admin', 'user'])

/**
 * Unikátní e-mail (nesmí ho mít jiný účet), ALE s výjimkou uživatele,
 * kterého právě upravujeme. Bez té výjimky by úprava selhala hláškou
 * „e-mail už existuje“, protože v DB už je – je to přece jeho vlastní.
 *
 * ID upravovaného uživatele posílá controller jako „meta“:
 *   request.validateUsing(validator, { meta: { userId: user.id } })
 */
const uniqueEmailExceptUser = () =>
  email().unique({
    table: 'users',
    column: 'email',
    filter: (query, _value, field) => {
      query.whereNot('id', field.meta.userId)
    },
  })

/*
|--------------------------------------------------------------------------
| Validátory pro jednotlivé formuláře
|--------------------------------------------------------------------------
*/

/**
 * Přihlášení (/login).
 * U hesla se záměrně nekontroluje délka, jen že něco přišlo.
 * Jestli je správné, ověří až User.verifyCredentials() v SessionControlleru.
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

/**
 * Admin zakládá nového uživatele (/users/create).
 */
export const createUserValidator = vine.create({
  fullName: fullName(),
  email: email().unique({ table: 'users', column: 'email' }),
  role: role(),
  // Nezaškrtnutý checkbox prohlížeč vůbec neodešle, proto .optional()
  isActive: vine.boolean().optional(),
  password: password(),
})

/**
 * Admin upravuje existujícího uživatele (/users/5/edit).
 * withMetaData<…>() říká, že validátor dostane navíc userId (viz výše).
 * Heslo je nepovinné: prázdné pole = heslo se nemění.
 */
export const updateUserValidator = vine.withMetaData<{ userId: number }>().create({
  fullName: fullName(),
  email: uniqueEmailExceptUser(),
  role: role(),
  isActive: vine.boolean().optional(),
  password: password().optional(),
})

/**
 * Uživatel mění svůj vlastní profil (/settings/profile).
 * Jen jméno a e-mail. Roli a blokaci smí měnit jen admin.
 */
export const profileValidator = vine.withMetaData<{ userId: number }>().create({
  fullName: fullName(),
  email: uniqueEmailExceptUser(),
})

/**
 * Uživatel mění své heslo (/settings/password).
 * Chce i současné heslo, aby účet nešel převzít jen z cizího odemčeného
 * počítače. Jestli je současné heslo správné, ověřuje PasswordController.
 * sameAs('password') = „Heslo znovu“ se musí shodovat s polem „Nové heslo“.
 */
export const passwordValidator = vine.create({
  currentPassword: vine.string(),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})
