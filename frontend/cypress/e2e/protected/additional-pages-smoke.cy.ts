describe("Protected Pages Additional Smoke Tests", () => {
  beforeEach(() => {
    cy.loginByApi();
  });

  it("renders analytics page", () => {
    cy.visit("/analytics");
    cy.contains("Clinical overview").should("be.visible");
  });

  it("renders health records page", () => {
    cy.visit("/health-records");
    cy.contains("Documents").should("be.visible");
    cy.contains("AI scan intake").should("be.visible");
  });

  it("renders profile theme page", () => {
    cy.visit("/profile/general/theme");
    cy.contains("Theme").should("be.visible");
    cy.contains("Choose your preferred appearance").should("be.visible");
    cy.contains("Appearance").should("be.visible");
  });

  it("renders profile notification page", () => {
    cy.visit("/profile/general/notification");
    cy.contains("Notifications").should("be.visible");
    cy.contains("Preferences").should("be.visible");
  });

  it("renders profile contact page", () => {
    cy.visit("/profile/support/contact");
    cy.contains("Contact us").should("be.visible");
    cy.contains("button", "Send").should("be.visible");
  });

  it("renders profile overview page", () => {
    cy.visit("/profile");
    cy.contains("Account").should("be.visible");
    cy.contains("General").should("be.visible");
    cy.contains("Support").should("be.visible");
  });

  it("renders family health page", () => {
    cy.visit("/family-health");
    cy.get("body", { timeout: 20000 }).then(($body) => {
      const text = $body.text();
      const loaded =
        text.includes("Family members") || text.includes("Create family group");
      expect(loaded).to.eq(true);
    });
  });
});
