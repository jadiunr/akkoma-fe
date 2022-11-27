import { createStore } from 'vuex'

import 'custom-event-polyfill'
import './lib/event_target_polyfill.js'

import interfaceModule from './modules/interface.js'
import instanceModule from './modules/instance.js'
import statusesModule from './modules/statuses.js'
import listsModule from './modules/lists.js'
import usersModule from './modules/users.js'
import apiModule from './modules/api.js'
import configModule from './modules/config.js'
import serverSideConfigModule from './modules/serverSideConfig.js'
import oauthModule from './modules/oauth.js'
import authFlowModule from './modules/auth_flow.js'
import mediaViewerModule from './modules/media_viewer.js'
import oauthTokensModule from './modules/oauth_tokens.js'
import reportsModule from './modules/reports.js'
import pollsModule from './modules/polls.js'
import postStatusModule from './modules/postStatus.js'
import announcementsModule from './modules/announcements.js'
import editStatusModule from './modules/editStatus.js'
import statusHistoryModule from './modules/statusHistory.js'
import i18n from './i18n';

import createPersistedState from './lib/persisted_state.js'
import pushNotifications from './lib/push_notifications_plugin.js'

const persistedStateOptions = {
  paths: [
    'config',
    'users.lastLoginName',
    'oauth'
  ]
};

const getStore = async () => {
  let storageError = false
  const plugins = [pushNotifications]
  try {
    const persistedState = await createPersistedState(persistedStateOptions)
    plugins.push(persistedState)
  } catch (e) {
    console.error(e)
    storageError = true
  }
  const store = createStore({
    modules: {
      i18n: {
        getters: {
          i18n: () => i18n.global
        }
      },
      interface: interfaceModule,
      instance: instanceModule,
      // TODO refactor users/statuses modules, they depend on each other
      users: usersModule,
      statuses: statusesModule,
      lists: listsModule,
      api: apiModule,
      config: configModule,
      serverSideConfig: serverSideConfigModule,
      oauth: oauthModule,
      authFlow: authFlowModule,
      mediaViewer: mediaViewerModule,
      oauthTokens: oauthTokensModule,
      reports: reportsModule,
      polls: pollsModule,
      postStatus: postStatusModule,
      announcements: announcementsModule,
      editStatus: editStatusModule,
      statusHistory: statusHistoryModule
    },
    plugins,
    strict: false // Socket modifies itself, let's ignore this for now.
  })
  if (storageError) {
    store.dispatch('pushGlobalNotice', { messageKey: 'errors.storage_unavailable', level: 'error' })
  }

  return store;
};

export default getStore;
