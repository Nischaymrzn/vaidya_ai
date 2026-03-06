describe("Vaidya Assistant Chat Proxy", () => {
  beforeEach(() => {
    cy.loginByApi();
  });

  it("sends ai assistant message through /api/vaidya-care", () => {
    const message = `I have mild headache ${Date.now()}`;
    cy.intercept("POST", "/api/vaidya-care").as("vaidyaCare");

    cy.visit("/ai-assistant");
    cy.get('input[placeholder="Message Vaidya.ai"]').type(`${message}{enter}`);
    cy.contains(message, { timeout: 10000 }).should("be.visible");

    cy.wait("@vaidyaCare", { timeout: 30000 }).then((interception) => {
      expect(interception.request.body).to.have.property("doctor");
      expect(interception.request.body).to.have.property("messages");
      expect(interception.response?.statusCode).to.be.oneOf([200, 500]);
    });
  });
});

