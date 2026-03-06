describe("Protected Pages Smoke Tests", () => {
  beforeEach(() => {
    cy.loginByApi();
  });

  it("renders dashboard page", () => {
    cy.visit("/dashboard");
    cy.contains("health overview for today").should("be.visible");
  });

  it("renders vitals page", () => {
    cy.visit("/vitals");
    cy.contains("Vitals overview").should("be.visible");
  });

  it("renders symptoms page", () => {
    cy.visit("/symptoms");
    cy.contains("Symptom snapshot").should("be.visible");
  });

  it("renders ai assistant page", () => {
    cy.visit("/ai-assistant");
    cy.contains("How can I help you today?").should("be.visible");
  });

  it("renders ai doctors page", () => {
    cy.visit("/health-intelligence/ai-doctors");
    cy.contains("Start a guided health consult").should("be.visible");
  });

  it("renders risk analysis page", () => {
    cy.visit("/health-intelligence/risk-analysis");
    cy.contains("Full Risk Analysis").should("be.visible");
  });

  it("renders anomalies page", () => {
    cy.visit("/symptoms/anomalies");
    cy.contains("Health Anomalies").should("be.visible");
  });

  it("renders support page", () => {
    cy.visit("/support");
    cy.contains("How can we help?").should("be.visible");
  });

  it("renders personal information page", () => {
    cy.visit("/profile/account/personal");
    cy.contains("Personal information").should("be.visible");
  });
});
