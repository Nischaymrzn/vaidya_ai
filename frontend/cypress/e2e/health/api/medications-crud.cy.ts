describe("Medications API CRUD", () => {
  before(() => {
    cy.loginByApi({
      email: "api_crud_medications@example.com",
      name: "API CRUD Medications User",
    });
  });

  it("performs medications CRUD", () => {
    const apiUrl = String(Cypress.env("apiUrl"));
    let token = "";
    let medicationId = "";

    cy.then(() => {
      token = String(Cypress.env("authToken"));
      expect(token).to.be.a("string").and.not.empty;
    });

    cy.then(() =>
      cy.request({
        method: "POST",
        url: `${apiUrl}/medications`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          medicineName: "Paracetamol",
          dosage: "500mg",
          frequency: "Twice daily",
          durationDays: 5,
        },
      }),
    ).then((createRes) => {
      expect([200, 201]).to.include(createRes.status);
      expect(createRes.body?.success).to.eq(true);
      medicationId = String(createRes.body?.data?._id ?? "");
      expect(medicationId).to.not.eq("");
    });

    cy.then(() =>
      cy.request({
        method: "PATCH",
        url: `${apiUrl}/medications/${medicationId}`,
        headers: { Authorization: `Bearer ${token}` },
        body: { dosage: "650mg" },
      }),
    ).then((updateRes) => {
      expect(updateRes.status).to.eq(200);
      expect(updateRes.body?.success).to.eq(true);
      expect(updateRes.body?.data?.dosage).to.eq("650mg");
    });

    cy.then(() =>
      cy.request({
        method: "GET",
        url: `${apiUrl}/medications/${medicationId}`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    ).then((getRes) => {
      expect(getRes.status).to.eq(200);
      expect(String(getRes.body?.data?._id)).to.eq(medicationId);
    });

    cy.then(() =>
      cy.request({
        method: "DELETE",
        url: `${apiUrl}/medications/${medicationId}`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    ).then((deleteRes) => {
      expect(deleteRes.status).to.eq(200);
      expect(deleteRes.body?.success).to.eq(true);
    });
  });
});

