describe('Login Flow', () => {
  it('should log in a user and redirect to the dashboard', () => {
    // Visit the root URL, which should redirect to login
    cy.visit('/');

    // Find the email input, type the email
    // Using data-cy attributes is a best practice for stable selectors
    cy.get('[data-cy=email-input]').type('admin@pa-penajam.go.id');

    // Find the password input, type the password
    cy.get('[data-cy=password-input]').type('password');

    // Find the login button and click it
    cy.get('[data-cy=login-button]').click();

    // After login, the URL should include /dashboard
    cy.url().should('include', '/dashboard');

    // We can also assert that a dashboard-specific element is visible
    cy.contains('Total Rencana Aksi').should('be.visible');
  });
});
