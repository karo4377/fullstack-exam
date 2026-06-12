describe('Shop — requires API', () => {
  beforeEach(() => {
    const api = Cypress.env('API_URL') || 'http://localhost:3001';
    cy.request({
      url: `${api}/products`,
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status !== 200) {
        throw new Error(
          `Backend not reachable at ${api} (status ${res.status}). Start the API and seed data before running shop tests.`,
        );
      }
    });
  });

  it('lists products from the API', () => {
    cy.visit('/products');
    cy.get('article.product-card', { timeout: 20_000 }).should('have.length.at.least', 1);
    cy.get('article.product-card').first().find('a.card-link').first().click();
    cy.location('pathname').should('match', /^\/products\/.+/);
    cy.contains('button', 'Add to cart').should('be.visible');
  });

  it('filters products with search', () => {
    cy.visit('/products');
    cy.get('article.product-card', { timeout: 20_000 }).should('have.length.at.least', 1);
    cy.get('.products-search-input').type('cat');
    cy.get('article.product-card').should('have.length.at.least', 1);
  });
});
