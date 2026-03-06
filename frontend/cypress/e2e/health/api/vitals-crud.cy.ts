describe("Vitals API CRUD", () => {
  before(() => {
    cy.loginByApi({
      email: "api_crud_vitals@example.com",
      name: "API CRUD Vitals User",
    });
  });

  it("performs vitals CRUD", () => {
    const apiUrl = String(Cypress.env("apiUrl"));
    let token = "";
    let vitalsId = "";

    cy.then(() => {
      token = String(Cypress.env("authToken"));
      expect(token).to.be.a("string").and.not.empty;
    });

    cy.then(() =>
      cy.request({
        method: "POST",
        url: `${apiUrl}/vitals`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          systolicBp: 128,
          diastolicBp: 82,
          heartRate: 78,
          glucoseLevel: 102,
          bmi: 24.2,
        },
      }),
    ).then((createRes) => {
      expect([200, 201]).to.include(createRes.status);
      expect(createRes.body?.success).to.eq(true);
      vitalsId = String(createRes.body?.data?._id ?? "");
      expect(vitalsId).to.not.eq("");
    });

    cy.then(() =>
      cy.request({
        method: "PATCH",
        url: `${apiUrl}/vitals/${vitalsId}`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          heartRate: 84,
          glucoseLevel: 108,
        },
      }),
    ).then((updateRes) => {
      expect(updateRes.status).to.eq(200);
      expect(updateRes.body?.success).to.eq(true);
      expect(Number(updateRes.body?.data?.heartRate)).to.eq(84);
    });

    cy.then(() =>
      cy.request({
        method: "GET",
        url: `${apiUrl}/vitals/${vitalsId}`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    ).then((getRes) => {
      expect(getRes.status).to.eq(200);
      expect(String(getRes.body?.data?._id)).to.eq(vitalsId);
    });

    cy.then(() =>
      cy.request({
        method: "DELETE",
        url: `${apiUrl}/vitals/${vitalsId}`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    ).then((deleteRes) => {
      expect(deleteRes.status).to.eq(200);
      expect(deleteRes.body?.success).to.eq(true);
    });
  });
});
