describe("Protected Route Guards", () => {
  it("redirects /dashboard to login when unauthenticated", () => {
    cy.visit("/dashboard");
    cy.url().should("include", "/login");
    cy.contains("Welcome Back!").should("be.visible");
  });

  it("redirects /ai-assistant to login when unauthenticated", () => {
    cy.visit("/ai-assistant");
    cy.url().should("include", "/login");
    cy.contains("Welcome Back!").should("be.visible");
  });
});
