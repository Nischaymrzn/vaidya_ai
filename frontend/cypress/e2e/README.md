# Cypress E2E Structure

This suite is grouped by feature so tests stay readable and maintainable.

## Folders

- `auth/`
  - login page, register page, and full auth user flows
- `navigation/`
  - public navigation and unauthenticated route guards
- `protected/`
  - protected-page smoke coverage
- `vaidya-care/`
  - consult page behavior and AI assistant proxy flow
- `health/`
  - UI-to-backend workflow checks
  - `health/api/` for backend CRUD checks per module:
    - `vitals-crud.cy.ts`
    - `symptoms-crud.cy.ts`
    - `medications-crud.cy.ts`
    - `allergies-crud.cy.ts`

## Naming convention

- File names use `kebab-case` and end with `.cy.ts`
- Keep one primary responsibility per spec file
- Keep CRUD checks in module-specific files under `health/api`

