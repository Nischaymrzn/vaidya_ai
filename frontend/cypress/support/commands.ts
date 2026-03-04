type LoginOptions = {
  name?: string;
  password?: string;
  email?: string;
};

declare global {
  namespace Cypress {
    interface Chainable {
      loginByApi(options?: LoginOptions): Chainable<void>;
    }
  }
}

Cypress.Commands.add("loginByApi", (options: LoginOptions = {}) => {
  const apiUrl: string = Cypress.env("apiUrl");
  const password = options.password ?? "User123!@#";
  const email =
    options.email ??
    Cypress.env("e2eUserEmail") ??
    "cypress_e2e_user@example.com";
  const name = options.name ?? "Cypress User";
  const sessionKey = ["api-login", email, password];

  cy.session(
    sessionKey,
    () => {
      cy.visit("/", { failOnStatusCode: false });

      const requestWithRateLimitRetry = (
        requestFn: () => Cypress.Chainable<Cypress.Response<any>>,
        allowedStatuses: number[],
        attempt = 0,
      ): Cypress.Chainable<Cypress.Response<any>> => {
        return requestFn().then((res): Cypress.Chainable<Cypress.Response<any>> => {
          if (res.status === 429 && attempt < 3) {
            const retryAfterHeader = res.headers["retry-after"];
            const retryAfterSeconds = Number(retryAfterHeader ?? 1);
            const boundedSeconds = Math.min(
              5,
              Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : 1,
            );
            return cy
              .wait(boundedSeconds * 1000 + 500)
              .then(() =>
                requestWithRateLimitRetry(requestFn, allowedStatuses, attempt + 1),
              );
          }

          expect(allowedStatuses).to.include(res.status);
          return cy.wrap(res, { log: false });
        });
      };

      requestWithRateLimitRetry(
        () =>
          cy.request({
            method: "POST",
            url: `${apiUrl}/auth/register`,
            failOnStatusCode: false,
            body: {
              name,
              email,
              password,
              confirmPassword: password,
            },
          }),
        [200, 201, 400, 409],
      );

      const attemptLogin = (attempt = 0): Cypress.Chainable<unknown> => {
        return cy
          .request({
            method: "POST",
            url: `${apiUrl}/auth/login`,
            failOnStatusCode: false,
            body: { email, password },
          })
          .then((loginRes) => {
            if (loginRes.status === 429 && attempt < 3) {
              const retryAfterHeader = loginRes.headers["retry-after"];
              const retryAfterSeconds = Number(retryAfterHeader ?? 1);
              const boundedSeconds = Math.min(
                5,
                Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : 1,
              );
              const waitMs = boundedSeconds * 1000;
              return cy.wait(waitMs + 500).then(() => attemptLogin(attempt + 1));
            }

            expect([200, 201]).to.include(loginRes.status);
            const token = loginRes.body?.data?.accessToken;
            expect(token).to.be.a("string").and.not.empty;
            cy.setCookie("access_token", token);
            Cypress.env("authToken", token);
            Cypress.env("authEmail", email);
            return cy.wrap(undefined, { log: false });
          });
      };

      attemptLogin();
    },
    {
      validate: () => {
        cy.getCookie("access_token").should("exist");
      },
      cacheAcrossSpecs: true,
    },
  );

  cy.getCookie("access_token").then((cookie) => {
    if (cookie?.value) {
      Cypress.env("authToken", cookie.value);
    }
  });
});

export {};
