import vine from '@vinejs/vine'
import { USER_ROLES } from '#models/user'

/**
 * Sdílená pravidla – každé pole je definované jen jednou
 * a jednotlivé validátory je jen skládají dohromady.
 */
const fullName = () => vine.string().trim().minLength(2).maxLength(100)
const email = () => vine.string().trim().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Unikátní e-mail s výjimkou uživatele, kterého právě upravujeme.
 * Bez filtru by úprava vlastního profilu selhala, protože "e-mail už existuje" (je to ten jeho).
 */
const uniqueEmailExcept = () =>
  email().unique({
    table: 'users',
    column: 'email',
    filter: (db, _value, field) => {
      db.whereNot('id', field.meta.userId)
    },
  })

/**
 * Registrace přes formulář /signup
 */
export const signupValidator = vine.create({
  fullName: fullName(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

/**
 * Přihlášení – tady záměrně nekontrolujeme délku hesla,
 * jen že něco přišlo. Správnost ověří User.verifyCredentials().
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

/**
 * Admin zakládá nového uživatele
 */
export const createUserValidator = vine.create({
  fullName: fullName(),
  email: email().unique({ table: 'users', column: 'email' }),
  role: vine.enum(USER_ROLES),
  // Nezaškrtnutý checkbox se v požadavku vůbec neposílá, proto optional()
  isActive: vine.boolean().optional(),
  password: password(),
})

/**
 * Admin upravuje existujícího uživatele.
 * Heslo je nepovinné – prázdné pole = heslo se nemění.
 */
export const updateUserValidator = vine.withMetaData<{ userId: number }>().create({
  fullName: fullName(),
  email: uniqueEmailExcept(),
  role: vine.enum(USER_ROLES),
  isActive: vine.boolean().optional(),
  password: password().optional(),
})

/**
 * Uživatel mění svůj vlastní profil (bez role a stavu – ty smí měnit jen admin)
 */
export const profileValidator = vine.withMetaData<{ userId: number }>().create({
  fullName: fullName(),
  email: uniqueEmailExcept(),
})

/**
 * Změna vlastního hesla – vyžaduje současné heslo,
 * aby účet nešel převzít jen z odemčeného počítače.
 */
export const passwordValidator = vine.create({
  currentPassword: vine.string(),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})
