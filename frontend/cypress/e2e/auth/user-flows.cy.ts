describe("Auth User Flows (UI -> Backend)", () => {
  it("registers a new user from UI and redirects to login", () => {
    const unique = Date.now();
    const email = `ui_signup_${unique}@example.com`;
    const password = "User123!@#";

    cy.visit("/register");
    cy.get('input[placeholder="Enter your full name"]').type("UI Signup User");
    cy.get('input[type="email"]').type(email);
    cy.get('input[placeholder="Enter your phone number"]').type("9812345678");
    cy.get('input[placeholder="Enter your password"]').type(password);
    cy.get('input[placeholder="Confirm your password"]').type(password);
    cy.contains("button", "Sign up").click();

    cy.url({ timeout: 15000 }).should("include", "/login");
    cy.contains("Welcome Back!").should("be.visible");
  });

  it("logs in from UI and reaches dashboard", () => {
    const password = "User123!@#";
    const email = "ui_login_shared@example.com";

    cy.loginByApi({
      name: "UI Login User",
      password,
      email,
    });
    cy.clearCookie("access_token");

    cy.visit("/login");
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.contains("button", "Login").click();

    cy.url({ timeout: 20000 }).should("include", "/dashboard");
    cy.contains("health overview for today", { matchCase: false }).should("be.visible");
  });
});
