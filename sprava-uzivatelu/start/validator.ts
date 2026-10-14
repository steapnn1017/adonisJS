/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import vine, { VineDate, SimpleMessagesProvider } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

/**
 * České chybové hlášky pro všechny validátory najednou.
 * Klíč = název pravidla, {{ field }} se nahradí českým názvem pole z druhého objektu.
 * Konkrétní kombinace pole + pravidlo (např. 'passwordConfirmation.sameAs') má přednost.
 */
vine.messagesProvider = new SimpleMessagesProvider(
  {
    'required': 'Pole {{ field }} je povinné.',
    'string': 'Pole {{ field }} musí být text.',
    'email': 'Zadej platnou e-mailovou adresu.',
    'minLength': 'Pole {{ field }} je příliš krátké (min. {{ min }} zn.).',
    'maxLength': 'Pole {{ field }} je příliš dlouhé (max. {{ max }} zn.).',
    'enum': 'Vyber jednu z nabízených možností.',
    'boolean': 'Neplatná hodnota pole {{ field }}.',
    'database.unique': 'Tento e-mail už používá jiný účet.',
    'passwordConfirmation.sameAs': 'Hesla se neshodují.',
  },
  {
    fullName: 'jméno',
    email: 'e-mail',
    password: 'heslo',
    passwordConfirmation: 'potvrzení hesla',
    currentPassword: 'současné heslo',
    role: 'role',
    isActive: 'aktivní účet',
  }
)
