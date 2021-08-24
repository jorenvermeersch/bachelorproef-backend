# BudgetBackEnd

This is the backend used in lessons Webservices.

## Requirements

- [NodeJS v14 or higher](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)
- [MySQL v8](https://dev.mysql.com/downloads/windows/installer/8.0.html) (no Oracle account needed, click the tiny link below the grey box)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) (no Oracle account needed, click the tiny link below the grey box)

For users of [Chocolatey](https://chocolatey.org/):

```powershell
choco install nodejs -y
choco install yarn -y
choco install mysql -y
choco install mysql.workbench -y
```

## Start this project

This server will create a database named `budget` when the server is started.

* Install all dependencies: `yarn`
* One the following commands, depending on your needs:
    * Start the development server: `yarn start:dev`
    * Start the production server: `yarn start`

## Test this project

This server will create a database named `budget_test` when the server is started.

* Install all dependencies: `yarn`
* Run the tests: `yarn test`
    * This will start a new server for each test suite that runs, you won't see any output as logging is disabled to make output more clean.
    * To enable logging change the config parameter `log.disabled` to `true`.
    * The user suite will take 'long' (around 6s) to complete, this is normal as many cryptographic operations are being performed.

## Disable authentication

If you want to disable authentication and authorization, set the config parameter `auth.disabled` to `true`. **This is not intended
for use in any production worthy application!**
