/// <reference types="cypress" />

Cypress.Commands.add(
  'loginAsCustomer',
  (email = 'customer@artshop.local', password = 'customer123') => {
    cy.session(
      ['customer', email],
      () => {
        cy.visit('/login');
        cy.get('#login-email').clear().type(email);
        cy.get('#login-password').clear().type(password, { log: false });
        cy.get('form').submit();
        cy.contains('button', 'Log out', { timeout: 15_000 }).should('be.visible');
      },
      { cacheAcrossSpecs: true },
    );
  },
);

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsCustomer(email?: string, password?: string): Chainable<void>;
    }
  }
}

export {};
