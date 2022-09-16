# BudgetBackEnd

This is the backend used in lessons Webservices.

## Requirements

- [NodeJS v17 or higher](https://nodejs.org/)
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

## Before starting/testing this project

Create a `.env` (production) `.env.dev` (development) or `.env.test` (testing) file with the following template.
Complete the environment variables with your secrets, credentials, etc. Note: `false` is defined as an
empty variable (e.g. `LOG_DISABLED`).

```bash
# General configuration
NODE_ENV=development
HOST=localhost
PORT=9000

# Logging configuration
LOG_DISABLED=

# Database configuration
DATABASE_HOST="localhost"
DATABASE_PORT=3306
DATABASE_NAME="budget"
DATABASE_USER="root"
DATABASE_PASSWORD=

# Auth configuration
AUTH_DISABLED=
AUTH_JWT_SECRET="eenveeltemoeilijksecretdatniemandooitzalradenandersisdesitegehacked"
```

## Start this project

This server will create the given database when the server is started.

* Install all dependencies: `yarn`
* Make sure `.env` (production) or `.env.dev` (development) exists
* One the following commands, depending on your needs:
    * Start the development server: `yarn start:dev`
    * Start the production server: `yarn start`

## Test this project

This server will create the given database when the server is started.

* Install all dependencies: `yarn`
* Make sure `.env.test` exists (it's recommended to disabled logging in the testing environment)
* Run the tests: `yarn test`
    * This will start a new server for each test suite that runs, you won't see any output as logging is disabled to make output more clean.
    * To enable logging change the config parameter `log.disabled` to `true`.
    * The user suite will take 'long' (around 6s) to complete, this is normal as many cryptographic operations are being performed.

## Disable authentication

If you want to disable authentication and authorization, set the config parameter `auth.disabled` to `true`. **This is not intended
for use in any production worthy application!**
