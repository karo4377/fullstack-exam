import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'nj41qj',
  // Cypress 15+: allow reading env.API_URL in specs via Cypress.env()
  allowCypressEnv: true,
  env: {
    API_URL: process.env.CYPRESS_API_URL || 'http://localhost:3001',
  },
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: false,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 12_000,
    pageLoadTimeout: 30_000,
    retries: { runMode: 1, openMode: 0 },
    setupNodeEvents(_on, config) {
      return config;
    },
  },
});
