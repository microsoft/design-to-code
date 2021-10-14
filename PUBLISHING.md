# Publishing
This project uses [Beachball](https://microsoft.github.io/beachball/) to publish packages to NPM. The process involves a series of script commands located in the root `package.json` file to check, change, and publish NPM packages.

The pipeline process looks for change files on an automated schedule or manual execution and publishes to the NPM Registry.

## How it works
Beachball is configured for patches and minor changes in a single file (`./beachball.config.js`). _Major changes are ignored, except when manually planning a Major release._

Running `npm run change` triggers an interactive process on the command line to capture the type and description of the change. These details are used to generate a file in the `./change/*` folder. Change file names are formatted as `{package-name}-{guid}.json` with the following example.

File location and name: `change/@microsoft-fast-tooling-4685ad54-b24a-4d2b-b160-519d410f468d.json`
```json
{
  "type": "minor",
  "comment": "Add fancy new feature for components.",
  "packageName": "@microsoft/fast-tooling",
  "email": "name@example.com",
  "dependentChangeType": "minor",
  "date": "2021-03-01T19:10:06.323Z"
}
```
:::note
More information on the change process and change types can be found on the [Beachball website](https://microsoft.github.io/beachball/cli/change.html#change).
:::

These changes are then committed and submitted as a pull request for code review. Once approved and merged into `main` the continuous delivery (CD) process awaits, located on GitHub Actions [CD - Publisher](https://github.com/microsoft/fast-tooling/blob/main/.github/workflows/cd-publish.yml) workflow. This process is triggered every Sunday through Thursday night or on-demand available for repository code owners.

Once fired, the `./change/*` files are used as instructions for Beachball's [Semantic versioning](https://semver.org/) and changelog generation. The process then runs `npm run publish-ci` to publish new package versions to the NPM registry. Publishing to the NPM registry requires a GitHub Secret `NPM_TOKEN` which can be found on the NPM User account for the "Access Tokens" page.

If successful, all changes are then committed back into the `main` branch and a notification is sent to the Discord's channel named `#ms-internal-notifications`. This requires two GitHub Secrets where the values can be found within the Discord channel's Webhook URL `https://discord.com/api/webhooks/{DISCORD_NOTIFICATION_WEBHOOK_ID}/{DISCORD_NOTIFICATION_WEBHOOK_TOKEN}`. These GitHub Secret key names are DISCORD_NOTIFICATION_WEBHOOK_ID and DISCORD_NOTIFICATION_WEBHOOK_TOKEN.

## Testing
When Beachball configurations are changed it's a great idea to validate the entire Beachball publishing process.

1. Check that changes are acknowledged
```bash
npm run check
```

2. Check for changes and that a change file is generated
```bash
npm run change
```

3. Check that each package is versioned and changelogs are created (Changelogs are named `CHANGELOG.json` and `CHANGELOG.md`). This command simulates publishing, without updating the NPM registry. This is a verification step only, the bumped changes should not be staged or committed. Simply revert after the changes are successful.
```bash
npm run bump
```

## NPM Authentication Best Practices
1. Publishing with an NPM Token should be configured to require two-factor authentication or automation tokens from the `fastsvc@microsoft.com` service account which uses the Authenticator App for 2FA, if needed for manual publishing, otherwise automation skips 2FA.
2. When creating the new NPM Access Token select the "Automation" type which will then bypass 2FA from the workflow.
3. Add this token to GitHub Secrets as `NPM_TOKEN`.
4. Always include `registry-url: 'https://registry.npmjs.org'` on `actions/setup-node@v1` runner, in the YAML workflow file, even though it feels like it should be the default.
5. Always set `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` to minimize authentication issues. This will automatically create the correct `.npmrc` configuration for the workflow.

## GIT Authentication Best Practices
1. Automated committing to a protected branch such as `main` requires a PAT (Personal Access Token) from a user with 'workflow' and 'write:packages' security permissions.
2. This token should be added to the repositories GitHub Secrets as `GH_TOKEN`.
3. The token can then be referred to in GitHub workflows as `GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}`.

## Publishing Resources
- [Hackernoon](https://hackernoon.com/publish-npm-packages-using-github-actions-a-how-to-guide-q31c34fg)
- [GitHub](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
