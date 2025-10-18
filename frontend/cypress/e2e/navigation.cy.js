describe('Post-Login Navigation', () => {
  beforeEach(() => {
    // Programmatic login before each test
    cy.login('admin@pa-penajam.go.id', 'password');
  });

  it('should navigate to the Kategori Utama page from the dashboard', () => {
    // Set a larger viewport to ensure the sidebar is visible
    cy.viewport(1920, 1080);

    // Start at the dashboard
    cy.visit('/dashboard');

    // First, assert that the main dashboard content is visible
    cy.contains('Total Rencana Aksi').should('be.visible');

    // Find and click the "Kategori Utama" link using its data-cy attribute
    cy.get('[data-cy=nav-kategori-utama]').click();

    // Assert the URL is correct
    cy.url().should('include', '/master/kategori-utama');

    // Assert that the page heading is visible
    cy.contains('h1', 'Master: Kategori Utama').should('be.visible');
  });
});
