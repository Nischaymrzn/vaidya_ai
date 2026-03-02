describe("Register Page", () => {
  it("renders register form fields", () => {
    cy.visit("/register");

    cy.contains("Enter your details to create an account and get started.").should(
      "be.visible",
    );
    cy.get('input[placeholder="Enter your full name"]').should("be.visible");
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[placeholder="Enter your phone number"]').should("be.visible");
    cy.get('input[placeholder="Enter your password"]').should("be.visible");
    cy.get('input[placeholder="Confirm your password"]').should("be.visible");
    cy.contains("button", "Sign up").should("be.visible");
  });

  it("navigates to login from register page", () => {
    cy.visit("/register");
    cy.contains("Login").click();
    cy.url().should("include", "/login");
    cy.contains("Welcome Back!").should("be.visible");
  });
});
