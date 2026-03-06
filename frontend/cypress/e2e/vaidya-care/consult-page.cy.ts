describe("Vaidya Care Consult Page", () => {
  it("redirects to login when consult page is opened without auth", () => {
    cy.visit("/health-intelligence/ai-doctors/consult?doctor=trishan-wagle");
    cy.url().should("include", "/login");
    cy.contains("Welcome Back!").should("be.visible");
  });

  it("renders Vaidya care consult page with selected doctor", () => {
    cy.loginByApi();
    cy.visit("/health-intelligence/ai-doctors/consult?doctor=trishan-wagle");
    cy.contains("Doctor: Dr. Trishan Wagle").should("be.visible");
    cy.contains("Live transcript").should("be.visible");
    cy.contains(
      "Hi there! I'm here to help with your health concern. What brings you in today?",
    ).should("be.visible");
  });

  it("falls back to default doctor when query doctor is invalid", () => {
    cy.loginByApi();
    cy.visit("/health-intelligence/ai-doctors/consult?doctor=unknown-id");
    cy.contains("Doctor: Dr. Nischay Maharan").should("be.visible");
  });

  it("opens consult page from ai doctors list with selected doctor", () => {
    cy.loginByApi();
    cy.visit("/health-intelligence/ai-doctors");
    cy.contains("Doctor: Dr. Trishan Wagle").should("not.exist");
    cy.contains("Start consult").first().click();
    cy.url().should("include", "/health-intelligence/ai-doctors/consult?doctor=");
    cy.contains("Doctor:").should("be.visible");
    cy.contains("Live transcript").should("be.visible");
  });

  it("shows a back button and navigates to ai doctors list", () => {
    cy.loginByApi();
    cy.visit("/health-intelligence/ai-doctors/consult?doctor=trishan-wagle");

    cy.get('a[href="/health-intelligence/ai-doctors"]').first().should("be.visible").click();
    cy.url().should("include", "/health-intelligence/ai-doctors");
  });

  it("toggles mic control state", () => {
    cy.loginByApi();
    cy.visit("/health-intelligence/ai-doctors/consult?doctor=trishan-wagle");

    cy.get("button[aria-pressed]").eq(0).should("have.attr", "aria-pressed", "true");
    cy.get("button[aria-pressed]").eq(0).click().should("have.attr", "aria-pressed", "false");
    cy.get("button[aria-pressed]").eq(0).click().should("have.attr", "aria-pressed", "true");
  });

  it("toggles camera and shows camera off indicator", () => {
    cy.loginByApi();
    cy.visit("/health-intelligence/ai-doctors/consult?doctor=trishan-wagle");

    cy.get("button[aria-pressed]").eq(1).click();
    cy.contains("Camera off").should("be.visible");
    cy.get("button[aria-pressed]").eq(1).click();
    cy.contains("Camera off").should("not.exist");
  });

  it("toggles captions visibility in transcript panel", () => {
    cy.loginByApi();
    cy.visit("/health-intelligence/ai-doctors/consult?doctor=trishan-wagle");

    cy.get("button[aria-pressed]").eq(2).click();
    cy.contains("Captions are off.").should("be.visible");
    cy.get("button[aria-pressed]").eq(2).click();
    cy.contains("Captions are off.").should("not.exist");
  });

  it("toggles screen sharing indicator", () => {
    cy.loginByApi();
    cy.visit("/health-intelligence/ai-doctors/consult?doctor=trishan-wagle");

    cy.get("button[aria-pressed]").eq(3).click();
    cy.contains("Sharing screen").should("be.visible");
    cy.get("button[aria-pressed]").eq(3).click();
    cy.contains("Sharing screen").should("not.exist");
  });
});
