# About

MUL is for MyUltimateList.
You can make lists of anything with it and present it in a cool layout.

## Presquisites

install meteor locally if you dont have it already. You don't even need npm or node if you're installing it via curl.

`npm install -g meteor`

or

`curl https://install.meteor.com/ | sh`

## Dev

If it's your first time, run `meteor npm install`.

then Start whole meteor stack

`meteor npm run start`

### Working with S3 bucket for static file upload

This projects uses s3 bucket for static file persistence.
If you want to improve/add features related to that, you need to configure aws credentials.
To do this, copy `aws-settings.example.js`, and fill the placeholder with your own credentials, then restart the server.
File uploads are handled server-side to keep your s3 key safe.

### Working on authentication

In dev, auth service is disabled. You will be signed in automatically as admin user.
In production, this project uses Google signin to sign users in. regular meteor users are disabled in production.

For google services to work, `GAPI_KEY`, `GAPI_CLIENT_ID`, and `GAPI_SECRET` MUST be set in a `prod-settings.json` file. see ddeployment section for more info

If you need to enable auth service in dev, make sure to set `public.IS_TESTING` to `false` in your local `dev-settings.json`.
You will also need working GAPI key, client_id and secret in your dev settings just like for prod.

IMPORTANT NOTE: sign in as google user WILL NOT WORK in browser launched by vscode. You will need to access http://localhost:3000 normally in a new tab or your usual browser for this to work.

### code guide

see how [the dropdown component](./imports/ui/forms/dropdownField) is made for a good component structure

## Tests

E2E tests powered by [Cypress](https://www.cypress.io/) are available.
Cypress requires a few dependencies to run smoothly on debian-based systems. Make sure to check out their doc.

1. Run meteor stack in test mode. (**WARNING**: this will drop your local mongo collections!) `meteor npm run start_tests`
2. Either run
    1. Cypress UI for interactive testing dev `meteor npm run cypress`
    2. Cypress in headless mode for quick checking `meteor npm run cypress_headless`

## Debugging

run your browser with debug port 9222 open
Example for chrome to do that on windows `"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222`
Once browser is launched, use attach to chrome vscode job.

## Deployment

`meteor deploy --settings prod-settings.json myultimatelist.eu.meteorapp.com --free`

this will take your current **local** version, and deploy it to [meteor galaxy](https://meteor.com/cloud).

## More

### Preparing WSL2 on W10 to run cypress in UI

[website](https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress)
[screenshot](./readme-assets/wsl2-gui.png)

### Install chromium on ubuntu 20.04

[website](https://www.linuxadictos.com/en/como-instalar-chromium-en-ubuntu-20-04-sin-usar-su-paquete-snap.html)
[screenshot](./readme-assets/install-chromium.png)
