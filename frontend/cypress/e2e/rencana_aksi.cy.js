describe('CRUD Rencana Aksi', () => {
    const uniqueId = Date.now();
    const kategoriNama = `Kategori for Rencana Test ${uniqueId}`;
    const kegiatanNama = `Kegiatan for Rencana Test ${uniqueId}`;
    const rencanaDeskripsi = `Deskripsi Rencana Aksi Test ${uniqueId}`;
    const updatedRencanaDeskripsi = `Deskripsi Rencana Aksi Updated ${uniqueId}`;

    let testKategori;
    let testKegiatan;
    let testUser;
    let authToken;

    before(() => {
        // 1. Login and get token
        cy.request('POST', 'http://localhost:8000/api/login', {
            email: 'admin@pa-penajam.go.id',
            password: 'password',
        }).then(loginResponse => {
            authToken = loginResponse.body.token;
            const headers = { 'Authorization': `Bearer ${authToken}` };

            // 2. Create Kategori Utama
            cy.request({
                method: 'POST',
                url: 'http://localhost:8000/api/kategori-utama',
                headers,
                body: { nomor: uniqueId.toString().slice(-5), nama_kategori: kategoriNama },
            }).then(kategoriResponse => {
                testKategori = kategoriResponse.body.data;

                // 3. Create Kegiatan
                return cy.request({
                    method: 'POST',
                    url: 'http://localhost:8000/api/kegiatan',
                    headers,
                    body: { kategori_id: testKategori.id, nama_kegiatan: kegiatanNama },
                });
            }).then(kegiatanResponse => {
                testKegiatan = kegiatanResponse.body.data;
            });
        });
    });

    beforeEach(() => {
        cy.login('admin@pa-penajam.go.id', 'password');
        cy.visit('/rencana-aksi');
        cy.intercept('GET', '/api/rencana-aksi?kegiatan_id=*').as('getRencana');
        cy.intercept('POST', '/api/rencana-aksi').as('createRencana');
        cy.intercept('PUT', '/api/rencana-aksi/*').as('updateRencana');
        cy.intercept('DELETE', '/api/rencana-aksi/*').as('deleteRencana');
    });

    it('should perform full CRUD on Rencana Aksi', () => {
        cy.get('[data-cy=kategori-select]').select(testKategori.id.toString());
        cy.get('[data-cy=kegiatan-select]').select(testKegiatan.id.toString());
        cy.wait('@getRencana');

        // --- CREATE ---
        cy.get('[data-cy=add-rencana-aksi-button]').click();
        cy.get('[data-cy=rencana-aksi-modal]').should('be.visible');
        cy.get('[data-cy=deskripsi-input]').type(rencanaDeskripsi);
        cy.get('[data-cy=user-radio-button-unassigned]').check();
        cy.get('[data-cy=jadwal-config-insidentil]').find('input[type="checkbox"]').eq(2).check(); // Check March
        cy.get('[data-cy=save-rencana-aksi-button]').click();
        cy.wait('@createRencana').its('response.statusCode').should('eq', 201);
        cy.wait('@getRencana');

        // --- READ, UPDATE, DELETE ---
        cy.get('[data-cy=rencana-aksi-table-body]')
            .contains('td', rencanaDeskripsi)
            .parent('tr')
            .find('button[data-cy*="edit-rencana-aksi-button-"]')
            .invoke('attr', 'data-cy')
            .then(editButtonDataCy => {
                const createdItemId = editButtonDataCy.split('-').pop();

                // --- UPDATE ---
                cy.get(`[data-cy=edit-rencana-aksi-button-${createdItemId}]`).click();
                cy.get('[data-cy=deskripsi-input]').clear().type(updatedRencanaDeskripsi);
                cy.get('[data-cy=save-rencana-aksi-button]').click();
                cy.wait('@updateRencana').its('response.statusCode').should('eq', 200);
                cy.wait('@getRencana');
                cy.get(`[data-cy=rencana-aksi-row-${createdItemId}]`).should('contain', updatedRencanaDeskripsi);

                // --- DELETE ---
                cy.get(`[data-cy=delete-rencana-aksi-button-${createdItemId}]`).click();
                cy.on('window:confirm', () => true);
                cy.wait('@deleteRencana').its('response.statusCode').should('eq', 204);
                cy.wait('@getRencana');
                cy.get(`[data-cy=rencana-aksi-row-${createdItemId}]`).should('not.exist');
            });
    });

    after(() => {
        if (testKategori) {
            const headers = { 'Authorization': `Bearer ${authToken}` };
            cy.request({ method: 'DELETE', url: `http://localhost:8000/api/kategori-utama/${testKategori.id}`, headers });
        }
    });
});
