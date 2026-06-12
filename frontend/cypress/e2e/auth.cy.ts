describe('Auth — requires API', () => {
  beforeEach(() => {
    const api = Cypress.expose('API_URL') || 'http://localhost:3001';
    cy.request({
      url: `${api}/products`,
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status !== 200) {
        throw new Error(
          `Backend not reachable at ${api}. Run: cd backend && npm run start:dev (and npm run seed).`,
        );
      }
    });
  });

  it('logs in as the seeded customer', () => {
    cy.fixture('users').then(({ customer }) => {
      cy.loginAsCustomer(customer.email, customer.password);
    });
    cy.visit('/account');
    cy.contains('h1', /^Hi, /).should('be.visible');
    cy.get('.account-nav-greeting').should('contain', 'Hi,');
  });

  it('adds a product to the cart when logged in', () => {
    cy.loginAsCustomer();
    cy.visit('/products');
    cy.get('article.product-card', { timeout: 20_000 }).first().find('a.card-link').first().click();
    cy.contains('button', 'Add to cart').click();
    cy.contains('button', /Added|Adding/).should('be.visible');
    cy.visit('/cart');
    cy.get('main').should('contain.text', 'kr');
  });
});
