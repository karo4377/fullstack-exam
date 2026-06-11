describe('Smoke — static pages', () => {
  it('shows the home hero and shop link', () => {
    cy.visit('/');
    cy.get('.site-brand img').should('have.attr', 'alt', 'Tiny Frames');
    cy.contains('h1', 'Art for little walls').should('be.visible');
    cy.contains('a', 'Shop prints').should('have.attr', 'href', '/products');
  });

  it('navigates to the product list', () => {
    cy.visit('/');
    cy.contains('a', 'Shop prints').click();
    cy.location('pathname').should('eq', '/products');
    cy.contains('h1', 'Products').should('be.visible');
  });

  it('shows the custom 404 page', () => {
    cy.visit('/this-route-does-not-exist', { failOnStatusCode: false });
    cy.contains('h1', 'Page not found').should('be.visible');
    cy.contains('a', 'Back to home').click();
    cy.location('pathname').should('eq', '/');
  });
});
