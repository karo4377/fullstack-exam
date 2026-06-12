describe('Admin navigation', () => {
  it('shows greeting and dashboard link after admin login', () => {
    const api = Cypress.expose('API_URL') || 'http://localhost:3001';
    cy.request('GET', `${api}/auth/csrf`);
    cy.visit('/login');
    cy.get('.auth-box form').within(() => {
      cy.get('#login-email').clear().type('admin@artshop.local');
      cy.get('#login-password').clear().type('admin123', { log: false });
      cy.contains('button[type="submit"]', 'Log in').click();
    });
    cy.url({ timeout: 15_000 }).should('eq', `${Cypress.config('baseUrl')}/admin`);
    cy.get('.account-nav-trigger', { timeout: 15_000 }).should('be.visible').click();
    cy.get('.account-nav-panel').should('be.visible').contains('a', 'Owner dashboard').click();
    cy.url().should('eq', `${Cypress.config('baseUrl')}/admin`);
    cy.contains('h1', 'Dashboard').should('be.visible');
  });
});
