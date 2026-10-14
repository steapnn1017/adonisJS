import Alpine from 'alpinejs'

/**
 * Flash hláška: objeví se chvilku po načtení stránky a po 5 s sama zmizí.
 */
Alpine.data('alert', function () {
  return {
    isVisible: false,
    dismiss() {
      this.isVisible = false
    },
    init() {
      setTimeout(() => (this.isVisible = true), 80)
      setTimeout(() => this.dismiss(), 5000)
    },
  }
})

/**
 * Přepínač motivu. Volbu ukládá do cookie, aby ji server znal hned
 * při dalším načtení (helper currentTheme v start/view.ts).
 */
Alpine.data('themeToggle', function () {
  return {
    theme: 'dark',
    init() {
      this.theme = this.$el.dataset.initialTheme || 'dark'
    },
    toggle() {
      const next = this.theme === 'dark' ? 'light' : 'dark'
      this.theme = next
      document.documentElement.setAttribute('data-theme', next)
      document.cookie = `app_theme=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    },
  }
})

/**
 * Potvrzení mazání v seznamu uživatelů. Jeden <dialog> pro celou tabulku:
 * tlačítko v řádku předá jméno a adresu přes data-* atributy (ne přes JS řetězec,
 * takže uvozovky ve jméně nic nerozbijí) a dialog se otevře nativně přes showModal().
 */
Alpine.data('confirmDelete', function () {
  return {
    name: '',
    action: '',
    open(button) {
      this.name = button.dataset.name
      this.action = button.dataset.action
      this.$refs.dialog.showModal()
    },
    close() {
      this.$refs.dialog.close()
    },
  }
})

Alpine.start()
