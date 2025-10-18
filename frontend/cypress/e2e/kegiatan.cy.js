describe('CRUD Kegiatan', () => {
    const uniqueId = Date.now();
    const kategoriNama = `Kategori for Kegiatan Test ${uniqueId}`;
    const kegiatanNama = `Kegiatan Test ${uniqueId}`;
    const updatedKegiatanNama = `Kegiatan Test Updated ${uniqueId}`;

    let testKategori;

    // Before all tests, create a prerequisite Kategori Utama
    before(() => {
        cy.request('POST', 'http://localhost:8000/api/login', {
            email: 'admin@pa-penajam.go.id',
            password: 'password',
        }).then(loginResponse => {
            const token = loginResponse.body.token;
            cy.request({
                method: 'POST',
                url: 'http://localhost:8000/api/kategori-utama',
                headers: { 'Authorization': `Bearer ${token}` },
                body: {
                    nomor: uniqueId.toString().slice(-5),
                    nama_kategori: kategoriNama,
                }
            }).then(kategoriResponse => {
                expect(kategoriResponse.status).to.eq(201);
                testKategori = kategoriResponse.body.data;
            });
        });
    });

    beforeEach(() => {
        cy.login('admin@pa-penajam.go.id', 'password');
        cy.visit('/master/kegiatan');

        // Intercept API calls
        cy.intercept('GET', '/api/kegiatan?kategori_id=*').as('getKegiatan');
        cy.intercept('POST', '/api/kegiatan').as('createKegiatan');
        cy.intercept('PUT', '/api/kegiatan/*').as('updateKegiatan');
        cy.intercept('DELETE', '/api/kegiatan/*').as('deleteKegiatan');
    });

    it('should perform full CRUD on Kegiatan under a specific Kategori', () => {
        // Select the Kategori we created
        cy.get('[data-cy=kategori-select]').select(testKategori.id.toString());
        cy.wait('@getKegiatan');

        // --- CREATE ---
        cy.get('[data-cy=add-kegiatan-button]').should('not.be.disabled').click();
        cy.get('[data-cy=kegiatan-modal]').should('be.visible');
        cy.get('[data-cy=nama-kegiatan-input]').type(kegiatanNama);
        cy.get('[data-cy=save-kegiatan-button]').click();
        cy.wait('@createKegiatan').its('response.statusCode').should('eq', 201);
        cy.wait('@getKegiatan');

        // --- READ, UPDATE, DELETE ---
        cy.get('[data-cy=kegiatan-table-body]')
            .contains('td', kegiatanNama)
            .parent('tr')
            .find('button[data-cy*="edit-kegiatan-button-"]')
            .invoke('attr', 'data-cy')
            .then(editButtonDataCy => {
                const createdItemId = editButtonDataCy.split('-').pop();

                // --- UPDATE ---
                cy.get(`[data-cy=edit-kegiatan-button-${createdItemId}]`).click();
                cy.get('[data-cy=kegiatan-modal]').should('be.visible');
                cy.get('[data-cy=nama-kegiatan-input]').clear().type(updatedKegiatanNama);
                cy.get('[data-cy=save-kegiatan-button]').click();
                cy.wait('@updateKegiatan').its('response.statusCode').should('eq', 200);
                cy.wait('@getKegiatan');
                cy.get(`[data-cy=kegiatan-row-${createdItemId}]`).should('contain', updatedKegiatanNama);

                // --- DELETE ---
                cy.get(`[data-cy=delete-kegiatan-button-${createdItemId}]`).click();
                cy.on('window:confirm', () => true);
                cy.wait('@deleteKegiatan').its('response.statusCode').should('eq', 204);
                cy.wait('@getKegiatan');
                cy.get(`[data-cy=kegiatan-row-${createdItemId}]`).should('not.exist');
            });
    });

    // After all tests, clean up the created Kategori Utama
    after(() => {
        if (testKategori) {
            cy.request('POST', 'http://localhost:8000/api/login', {
                email: 'admin@pa-penajam.go.id',
                password: 'password',
            }).then(loginResponse => {
                const token = loginResponse.body.token;
                cy.request({
                    method: 'DELETE',
                    url: `http://localhost:8000/api/kategori-utama/${testKategori.id}`,
                    headers: { 'Authorization': `Bearer ${token}` },
                });
            });
        }
    });
});
