/*
|--------------------------------------------------------------------------
| JAVASCRIPT V PROHLÍŽEČI
|--------------------------------------------------------------------------
|
| Aplikace je skoro celá na serveru (HTML posílá AdonisJS hotové).
| JavaScript je jen na drobnosti, které bez něj nejdou:
|   1. přepínač světlý/tmavý motiv
|   2. potvrzovací dialog před smazáním uživatele
| (Mizení flash hlášek je napsané přímo v partials/flash_alerts.edge.)
|
| Používáme Alpine.js: malou knihovnu, která se píše přímo do HTML
| přes atributy x-data, x-on:click, x-show… Komponenta zaregistrovaná
| tady přes Alpine.data('jmeno', ...) se v HTML použije jako x-data="jmeno".
|
| Soubor do stránky vkládá @vite v resources/views/components/head.edge.
|
*/

import Alpine from 'alpinejs'

/**
 * 1) PŘEPÍNAČ MOTIVU
 * HTML: resources/views/components/theme_toggle.edge
 *
 * Přepne atribut data-theme na <html> (CSS podle něj změní barvy)
 * a volbu uloží do cookie. Server cookie přečte při dalším načtení
 * (helper currentTheme ve start/view.ts), takže motiv vydrží.
 */
Alpine.data('themeToggle', () => ({
  toggle() {
    const html = document.documentElement
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark'

    html.dataset.theme = next

    // max-age = platnost cookie v sekundách (tady 1 rok)
    const oneYear = 60 * 60 * 24 * 365
    document.cookie = `app_theme=${next}; path=/; max-age=${oneYear}; samesite=lax`
  },
}))

/**
 * 2) POTVRZENÍ SMAZÁNÍ UŽIVATELE
 * HTML: resources/views/pages/users/index.edge (tabulka + <dialog>)
 *
 * Jeden dialog pro celou tabulku. Tlačítko v řádku zavolá open($el)
 * a předá sebe sama. Z jeho data-* atributů vezmeme jméno a adresu
 * pro smazání a dialog otevřeme. (data-* místo psaní jména přímo do JS:
 * uvozovky ve jméně tak nic nerozbijí.)
 */
Alpine.data('confirmDelete', () => ({
  // Proměnné, které dialog zobrazuje (x-text="name", x-bind:action="action")
  name: '',
  action: '',

  open(button) {
    this.name = button.dataset.name
    this.action = button.dataset.action
    // $refs.dialog = prvek s x-ref="dialog", showModal() = vestavěná funkce <dialog>
    this.$refs.dialog.showModal()
  },

  close() {
    this.$refs.dialog.close()
  },
}))

// Spustí Alpine: projde stránku a oživí všechny prvky s x-data
Alpine.start()
