/*
|--------------------------------------------------------------------------
| VALIDACE – české chybové hlášky
|--------------------------------------------------------------------------
|
| Samotná pravidla (co je povinné, jak dlouhé…) jsou v app/validators/user.ts.
| Tady jsou jen texty chyb, které se ukážou pod polem formuláře.
|
| Jak se hláška vybírá:
|   1. nejdřív se hledá přesná kombinace „pole.pravidlo“
|      (např. 'passwordConfirmation.sameAs')
|   2. když není, použije se obecná hláška podle pravidla (např. 'required')
|
| {{ field }} se nahradí českým názvem pole z druhého objektu dole,
| {{ min }} / {{ max }} se nahradí číslem z pravidla.
|
*/

import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider(
  // Texty chyb: klíč = název pravidla (nebo pole.pravidlo)
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
  // České názvy polí: klíč = name="" ve formuláři
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
