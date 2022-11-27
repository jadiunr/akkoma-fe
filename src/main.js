import getStore from './store';
import i18n from './i18n';
import 'custom-event-polyfill'
import './lib/event_target_polyfill.js'
import afterStoreSetup from './boot/after_store.js'

(async () => {
  const store = await getStore();
  return afterStoreSetup({ store, i18n })
})()

// These are inlined by webpack's DefinePlugin
/* eslint-disable */
window.___pleromafe_mode = process.env
window.___pleromafe_commit_hash = COMMIT_HASH
window.___pleromafe_dev_overrides = DEV_OVERRIDES
