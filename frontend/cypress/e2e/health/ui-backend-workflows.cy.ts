describe("Health Workflows (UI <-> Backend)", () => {
  beforeEach(() => {
    cy.loginByApi();
  });

  it("creates symptom from UI and persists in backend", () => {
    const symptomName = `Headache-${Date.now()}`;
    const note = `symptom-note-${Date.now()}`;

    cy.visit("/symptoms");
    cy.contains("button", /Log symptom/i, { timeout: 10000 }).should("be.visible").click();
    cy.get('[data-slot="dialog-content"][data-state="open"]', { timeout: 15000 })
      .should("exist")
      .within(() => {
        cy.contains("Log New Symptom").should("exist");
        cy.get('textarea[placeholder*="comma separated"]', { timeout: 10000 })
          .first()
          .should("be.enabled")
          .type(symptomName);
        cy.get('textarea[placeholder*="Triggers"]').first().type(note);
        cy.get('input[type="number"]').first().clear().type("3");
        cy.contains("button", "Save Symptom").click();
      });

    cy.get('[data-slot="dialog-content"][data-state="open"]', { timeout: 15000 }).should(
      "not.exist",
    );

    cy.get('input[placeholder="Search by symptom or note..."]').clear().type(symptomName);
    cy.contains(symptomName, { timeout: 15000 }).should("be.visible");

    const assertPersisted = (attempt = 0) => {
      const token = String(Cypress.env("authToken"));
      const apiUrl = String(Cypress.env("apiUrl"));
      cy.request({
        method: "GET",
        url: `${apiUrl}/symptoms`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => {
        const list = response.body?.data ?? [];
        const exists = list.some(
          (item: any) =>
            Array.isArray(item?.symptomList) &&
            item.symptomList.some((value: string) => value === symptomName),
        );

        if (exists) return;
        if (attempt >= 3) {
          expect(exists).to.eq(true);
          return;
        }

        cy.wait(750);
        assertPersisted(attempt + 1);
      });
    };

    assertPersisted();
  });

  it("shows symptom created directly in backend on symptoms UI", () => {
    const symptomName = `Fever-${Date.now()}`;
    const apiUrl = String(Cypress.env("apiUrl"));

    cy.then(() => {
      const token = String(Cypress.env("authToken"));
      cy.request({
        method: "POST",
        url: `${apiUrl}/symptoms`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          symptomList: [symptomName],
          status: "ongoing",
          durationDays: 1,
          notes: "seeded from cypress",
        },
      });
    });

    cy.visit("/symptoms");
    cy.get('input[placeholder="Search by symptom or note..."]').type(symptomName);
    cy.contains(symptomName, { timeout: 15000 }).should("be.visible");
  });

  it("creates vitals from UI and persists in backend", () => {
    const heartRate = 79;
    const glucose = 104;
    const systolic = 126;
    const diastolic = 82;

    cy.visit("/vitals");
    cy.contains("button", "Add reading").click();
    cy.get('input[placeholder="72"]').clear().type(String(heartRate));
    cy.get('input[placeholder="95"]').clear().type(String(glucose));
    cy.get('input[placeholder="120"]').clear().type(String(systolic));
    cy.get('input[placeholder="78"]').clear().type(String(diastolic));
    cy.get('input[placeholder="Optional notes"]').type(`vitals-note-${Date.now()}`);
    cy.contains("button", "Save reading").click();

    cy.contains(String(heartRate), { timeout: 15000 }).should("be.visible");

    cy.then(() => {
      const token = String(Cypress.env("authToken"));
      const apiUrl = String(Cypress.env("apiUrl"));
      cy.request({
        method: "GET",
        url: `${apiUrl}/vitals`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => {
        const list = response.body?.data ?? [];
        const exists = list.some(
          (item: any) =>
            Number(item?.heartRate) === heartRate &&
            Number(item?.glucoseLevel) === glucose,
        );
        expect(exists).to.eq(true);
      });
    });
  });

  it("shows vitals created directly in backend on vitals UI", () => {
    const heartRate = 91;
    const systolic = 129;
    const diastolic = 83;
    const apiUrl = String(Cypress.env("apiUrl"));

    cy.then(() => {
      const token = String(Cypress.env("authToken"));
      cy.request({
        method: "POST",
        url: `${apiUrl}/vitals`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          heartRate,
          systolicBp: systolic,
          diastolicBp: diastolic,
          glucoseLevel: 102,
        },
      });
    });

    cy.visit("/vitals");
    cy.contains(String(heartRate), { timeout: 15000 }).should("be.visible");
    cy.contains(`${systolic}/${diastolic}`, { timeout: 15000 }).should("be.visible");
  });
});
