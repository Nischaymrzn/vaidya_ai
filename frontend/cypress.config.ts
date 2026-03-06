import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  reporter: "spec",
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
  },
  env: {
    apiUrl: "http://localhost:5000/v1/api",
  },
});
