describe("Allergies API CRUD", () => {
  before(() => {
    cy.loginByApi({
      email: "api_crud_allergies@example.com",
      name: "API CRUD Allergies User",
    });
  });

  it("performs allergies CRUD", () => {
    const apiUrl = String(Cypress.env("apiUrl"));
    let token = "";
    let allergyId = "";

    cy.then(() => {
      token = String(Cypress.env("authToken"));
      expect(token).to.be.a("string").and.not.empty;
    });

    cy.then(() =>
      cy.request({
        method: "POST",
        url: `${apiUrl}/allergies`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          allergen: "Pollen",
          type: "environmental",
          severity: "mild",
          status: "active",
        },
      }),
    ).then((createRes) => {
      expect([200, 201]).to.include(createRes.status);
      expect(createRes.body?.success).to.eq(true);
      allergyId = String(createRes.body?.data?._id ?? "");
      expect(allergyId).to.not.eq("");
    });

    cy.then(() =>
      cy.request({
        method: "PATCH",
        url: `${apiUrl}/allergies/${allergyId}`,
        headers: { Authorization: `Bearer ${token}` },
        body: { status: "resolved" },
      }),
    ).then((updateRes) => {
      expect(updateRes.status).to.eq(200);
      expect(updateRes.body?.success).to.eq(true);
      expect(updateRes.body?.data?.status).to.eq("resolved");
    });

    cy.then(() =>
      cy.request({
        method: "GET",
        url: `${apiUrl}/allergies/${allergyId}`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    ).then((getRes) => {
      expect(getRes.status).to.eq(200);
      expect(String(getRes.body?.data?._id)).to.eq(allergyId);
    });

    cy.then(() =>
      cy.request({
        method: "DELETE",
        url: `${apiUrl}/allergies/${allergyId}`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    ).then((deleteRes) => {
      expect(deleteRes.status).to.eq(200);
      expect(deleteRes.body?.success).to.eq(true);
    });
  });
});

