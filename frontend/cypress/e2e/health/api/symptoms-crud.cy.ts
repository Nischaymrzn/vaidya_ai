describe("Symptoms API CRUD", () => {
  before(() => {
    cy.loginByApi({
      email: "api_crud_symptoms@example.com",
      name: "API CRUD Symptoms User",
    });
  });

  it("performs symptoms CRUD", () => {
    const apiUrl = String(Cypress.env("apiUrl"));
    let token = "";
    let symptomId = "";

    cy.then(() => {
      token = String(Cypress.env("authToken"));
      expect(token).to.be.a("string").and.not.empty;
    });

    cy.then(() =>
      cy.request({
        method: "POST",
        url: `${apiUrl}/symptoms`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          symptomList: ["Headache", "Fatigue"],
          status: "ongoing",
          durationDays: 2,
          notes: "API CRUD test symptom",
        },
      }),
    ).then((createRes) => {
      expect([200, 201]).to.include(createRes.status);
      expect(createRes.body?.success).to.eq(true);
      symptomId = String(createRes.body?.data?._id ?? "");
      expect(symptomId).to.not.eq("");
    });

    cy.then(() =>
      cy.request({
        method: "PATCH",
        url: `${apiUrl}/symptoms/${symptomId}`,
        headers: { Authorization: `Bearer ${token}` },
        body: { status: "resolved", durationDays: 3 },
      }),
    ).then((updateRes) => {
      expect(updateRes.status).to.eq(200);
      expect(updateRes.body?.success).to.eq(true);
      expect(updateRes.body?.data?.status).to.eq("resolved");
    });

    cy.then(() =>
      cy.request({
        method: "GET",
        url: `${apiUrl}/symptoms/${symptomId}`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    ).then((getRes) => {
      expect(getRes.status).to.eq(200);
      expect(String(getRes.body?.data?._id)).to.eq(symptomId);
    });

    cy.then(() =>
      cy.request({
        method: "DELETE",
        url: `${apiUrl}/symptoms/${symptomId}`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    ).then((deleteRes) => {
      expect(deleteRes.status).to.eq(200);
      expect(deleteRes.body?.success).to.eq(true);
    });
  });
});

