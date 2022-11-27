import 'custom-event-polyfill'
import './lib/event_target_polyfill.js'
import { createI18n } from 'vue-i18n'
import messages from './i18n/messages.js'

const currentLocale = (window.navigator.language || 'en').split('-')[0]

const i18n = createI18n({
  // By default, use the browser locale, we will update it if neccessary
  locale: 'en',
  fallbackLocale: 'en',
  messages: messages.default
})

messages.setLanguage(i18n, currentLocale)

export default i18n;
