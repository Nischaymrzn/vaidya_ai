describe("Login Page", () => {
  it("should render and accept user input", () => {
    cy.visit("/login");

    cy.contains("Welcome Back!").should("be.visible");
    cy.contains("Enter your email and password to access your account").should(
      "be.visible",
    );

    cy.get('input[type="email"]')
      .should("be.visible")
      .type("tester@example.com");
    cy.get('input[type="password"]')
      .should("be.visible")
      .type("Password123!@#");

    cy.contains("button", "Login").should("be.visible");
    cy.contains("Forgot password?").should("be.visible");
    cy.contains("Sign up").should("be.visible");
  });
});

