/// <reference types="cypress" />

describe('signing in', () => {
  beforeEach(async () => {
    cy.clearLocalStorage()
    await indexedDB.deleteDatabase('localforage')
  })

  it('registers an oauth application', async () => {
    cy.defaultIntercepts();
    cy.intercept('POST', '/oauth/token', { fixture: 'oauth_token.json'}).as('createToken')
    cy.intercept('/api/v1/accounts/verify_credentials', { fixture: 'user.json' }).as('verifyCredentials')
    cy.visit('/')
    cy.wait('@getInstance')
    cy.get('input#username').type('testuser');
    cy.get('input#password').type('testpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@createApp')
    cy.wait('@createToken').then((interception) => {
      console.log(interception.request)
      const form = interception.request.body.split('\r\n---')
      cy.expectHtmlFormEntryToBe(form, 'grant_type', 'client_credentials')
    });
    cy.wait('@createToken').then((interception) => {
      console.log(interception.request)
      const form = interception.request.body.split('\r\n---')
      cy.expectHtmlFormEntryToBe(form, 'grant_type', 'password')
      cy.expectHtmlFormEntryToBe(form, 'username', 'testuser')
      cy.expectHtmlFormEntryToBe(form, 'password', 'testpassword')
    });
    cy.wait('@verifyCredentials')
  });
})
