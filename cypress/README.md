# Using Cypress

-   Use `yarn cy:run:chrome` to run tests with Chrome locally (easier for debugging)
-   Use the `--spec` flag to isolate the tests you want to run (e.g. `yarn cy:run:chrome --spec "cypress/e2e/login.cy.js"`)
-   Configure how we use Cypress in CI via `e2e-test.yml`
-   Check out [the docs](https://docs.cypress.io/guides/overview/why-cypress) to learn more
-   Unexpected JS errors should fail tests - this is the [default behavior of Cypress](https://on.cypress.io/uncaught-exception-from-application)
