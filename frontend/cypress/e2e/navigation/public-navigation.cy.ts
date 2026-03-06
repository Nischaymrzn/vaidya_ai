describe("Public Navigation", () => {
  it("navigates from landing page to login page", () => {
    cy.viewport(1280, 720);
    cy.visit("/");

    cy.contains("Transforming Personal Healthcare Through Intelligent Insights").should("be.visible");
    cy.get('a[href="/login"]:visible').first().click();

    cy.url().should("include", "/login");
    cy.contains("Welcome Back!").should("be.visible");
  });
});
