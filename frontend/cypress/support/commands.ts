/// <reference types="cypress" />

Cypress.Commands.add(
  'loginAsCustomer',
  (email = 'customer@artshop.local', password = 'customer123') => {
    cy.session(
      ['customer', email],
      () => {
        cy.visit('/login');
        cy.get('.auth-box form').within(() => {
          cy.get('#login-email').clear().type(email);
          cy.get('#login-password').clear().type(password, { log: false });
          cy.contains('button[type="submit"]', 'Log in').click();
        });
        cy.url({ timeout: 15_000 }).should('match', /\/(account|admin)$/);
        cy.get('.account-nav-greeting', { timeout: 15_000 }).should('contain', 'Hi,');
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
