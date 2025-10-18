describe('CRUD Kategori Utama', () => {
    const uniqueId = Date.now();
    const initialNomor = uniqueId.toString().slice(-5);
    const initialNama = `Kategori Test ${uniqueId}`;
    const updatedNama = `Kategori Test Updated ${uniqueId}`;

    let createdItemId;

    beforeEach(() => {
        // Login programmatically before each test
        cy.login('admin@pa-penajam.go.id', 'password');
        // Visit the page
        cy.visit('/master/kategori-utama');
        // Intercept API calls
        cy.intercept('GET', '/api/kategori-utama').as('getKategori');
        cy.intercept('POST', '/api/kategori-utama').as('createKategori');
        cy.intercept('PUT', '/api/kategori-utama/*').as('updateKategori');
        cy.intercept('DELETE', '/api/kategori-utama/*').as('deleteKategori');

        // Wait for the initial data to load
        cy.wait('@getKategori');
    });

    it('should allow creating, updating, and deleting a Kategori Utama', () => {
        // --- CREATE ---
        cy.get('[data-cy=add-kategori-button]').click();
        cy.get('[data-cy=kategori-modal]').should('be.visible');

        cy.get('[data-cy=nomor-input]').type(initialNomor);
        cy.get('[data-cy=nama-kategori-input]').type(initialNama);
        cy.get('[data-cy=save-kategori-button]').click();

        cy.wait('@createKategori').its('response.statusCode').should('eq', 201);
        cy.wait('@getKategori');

        // --- READ, UPDATE, and DELETE chained together ---
        cy.get('[data-cy=kategori-table-body]')
            .contains('td', initialNama)
            .parent('tr')
            .find('button[data-cy*="edit-kategori-button-"]') // Find the button in the row
            .invoke('attr', 'data-cy') // Get the attribute from the button
            .then(editButtonDataCy => {
                const createdItemId = editButtonDataCy.split('-').pop();

                // --- UPDATE ---
                cy.get(`[data-cy=edit-kategori-button-${createdItemId}]`).click();
                cy.get('[data-cy=kategori-modal]').should('be.visible');

                cy.get('[data-cy=nama-kategori-input]').clear().type(updatedNama);
                cy.get('[data-cy=save-kategori-button]').click();

                cy.wait('@updateKategori').its('response.statusCode').should('eq', 200);
                cy.wait('@getKategori');

                cy.get(`[data-cy=kategori-row-${createdItemId}]`).should('contain', updatedNama);

                // --- DELETE ---
                cy.get(`[data-cy=delete-kategori-button-${createdItemId}]`).click();
                cy.on('window:confirm', () => true);

                cy.wait('@deleteKategori').its('response.statusCode').should('eq', 204);
                cy.wait('@getKategori');

                cy.get(`[data-cy=kategori-row-${createdItemId}]`).should('not.exist');
            });
    });
});
