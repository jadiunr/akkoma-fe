// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')
Cypress.Commands.add('defaultIntercepts', () => {
  const notAuthorized = {
    body: { error: "not_authorized" },
    statusCode: 403
  }
  cy.intercept('/api/pleroma/frontend_configurations', { fixture: 'frontend_configurations.json' });
  cy.intercept('/instance/panel.html', { fixture: 'instance_panel.html' })
  cy.intercept('/api/v1/instance', { fixture: 'instance.json' }).as('getInstance')
  cy.intercept('/nodeinfo/2.0.json', { fixture: 'nodeinfo.json' })
  cy.intercept('/api/v1/timelines/public*', { fixture: 'public_timeline.json' })
  cy.intercept('/static/stickers.json', { body: {} })

  cy.intercept('POST', 'http://cypress.example.com/oauth/token', notAuthorized);
  cy.intercept('/api/v1/mutes', notAuthorized);
  cy.intercept('/api/v1/announcements', notAuthorized);
  cy.intercept('POST', 'http://cypress.example.com/api/v1/apps', { fixture: 'oauth_app.json' }).as('createApp');

});

Cypress.Commands.add('authenticatedIntercepts', () => {
  cy.intercept('POST', '/oauth/token', { fixture: 'oauth_token.json'})
  cy.intercept('/api/v1/announcements', { body: [] })
  cy.intercept('/api/v1/mutes', { body: [] })
});

Cypress.Commands.add('expectHtmlFormEntryToBe', (form, key, value) => {
  expect(form.find((line) => line.includes(`name="${key}"`))).to.include(value)
});
