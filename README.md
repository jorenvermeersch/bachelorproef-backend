# BudgetBackEnd

This is the backend used in lessons Webservices.


## Start this project

This server assumes a database named `budget` has been made before the server is started.

* Install all dependencies: `yarn`
* One the following commands, depending on your needs: 
    * Start the development server: `yarn start:dev`
    * Start the production server: `yarn start`

## Test this project

This server assumes a database named `budget_test` has been made before the server is started.

* Install all dependencies: `yarn`
* Run the tests: `yarn test`
    * This will start a new server for each test suite that runs, you won't see any output as logging is disabled to make output more clean.
    * To enable logging change the config parameter `log.disabled` to `true`.
    * The user suite will take 'long' (around 6s) to complete, this is normal as many cryptographic operations are being performed.
