// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.request('POST', 'http://localhost:8000/api/login', {
    email,
    password,
  }).then((response) => {
    // Ensure the request was successful and we got a token
    expect(response.status).to.eq(200);
    expect(response.body.token).to.exist;

    // Set the token in localStorage
    cy.window().its('localStorage').invoke('setItem', 'authToken', response.body.token);
  });
});;
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })