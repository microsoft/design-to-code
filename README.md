# FAST Tooling

This is the FAST Tooling project, containing a set of packages that can be combined to create complex workflows for web applications. The goal of these workflows is to allow users to create and modify their own web based experiences, from individual web components to completed web sites.

This project is not to be confused with its related project [FAST](https://github.com/microsoft/fast), a set of libraries for creating native web components and design systems.

## Packages

### `@microsoft/fast-tooling`

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/@microsoft%2Ffast-tooling.svg)](https://badge.fury.io/js/@microsoft%2Ffast-tooling)

The `@microsoft/fast-tooling` package contains a web worker referred to as the Message System and infrastructure for registering, posting, and receiving messages that aide in editing and navigating a serializable data structure that maps to JSON schema. There are also various services available to integrate commonly used libraries with the Message System, such as AJV and the Monaco Editor. To learn more, check out the package [README](./packages/fast-tooling).

### `@microsoft/fast-tooling-react`

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/@microsoft%2Ffast-tooling-react.svg)](https://badge.fury.io/js/@microsoft%2Ffast-tooling-react)

The `@microsoft/fast-tooling-react` package contains various React components that work with the message system provided by `@microsoft/fast-tooling` to edit data, render data as HTML, and navigate data. To learn more, check out the package [README](./packages/fast-tooling-react).

### Publishing
This project uses [Beachball](https://microsoft.github.io/beachball/) to publish packages to NPM. The process is controlled through a series of commands located in the root `package.json` file to check, change, and publish. 

When a change occurs within the configuration (`beachball.config.js`) parameters, Beachball will trigger interactive mode on the command line to capture additional details for generating the changelog file. The change instructions are saved to `./changes/*` folder and used during continuous delivery process on GitHub Actions (`.github/workflows/cd-publish-packages.yml`) to publish to NPM. 

Beachball `publish:bump` can be used to version locally without publishing to the remote Git repository or NPM registry. This runs the same logic as `publish:start` so it's good practice to bump things locally to verify what's being changed.

Publishing is made possible to the NPM registry using a GitHub Secret `NPM_TOKEN` which can be found on the NPM User account for the "Access Tokens" page.

#### Development & Testing process
This process must be followed prior to submitting new pull requests for review.

1. Check for any changes per the configuration file, this is checking for patches and minor changes. _Major changes are ignored, except when manually planning a Major release._

Note: Optional, because the following step is default and includes checking.
  ```
  npm run publish:check
  ```

2. Check for changes, if found, generate the change files located in `./change`.

  ```
  npm run publish:change
  ```

3. Check for changelog generation within each package named `CHANGELOG.json` and `CHANGELOG.md`.

  ```
  npm run publish:bump
  ``` 

4. Changes are now ready to be committed and pushed to the the repository for review. 

5. Once merged to main, the continuous delivery process will automatically publish to NPM every Sunday through Thursday night. Including an on-demand option for repository owners and maintainers directly from the GitHub Action "CD - FAST Tooling Publisher" workflow page. Beachball failures on GitHub Actions trigger a notification to the private Discord channel named `#ms-internal-notifications`. This requires two GitHub Secrets where the values can be found within the Discord channel's Webhook URL `https://discord.com/api/webhooks/{DISCORD_NOTIFICATION_WEBHOOK_ID}/{DISCORD_NOTIFICATION_WEBHOOK_TOKEN}`. These GitHub Secret key names are DISCORD_NOTIFICATION_WEBHOOK_ID and DISCORD_NOTIFICATION_WEBHOOK_TOKEN.

## Joining the Community

Looking to get answers to questions or engage with us in realtime? Our community is most active [on Discord](https://discord.gg/FcSNfg4). Submit requests and issues on [GitHub](https://github.com/microsoft/fast-tooling/issues/new/choose), or join us by contributing on [some good first issues via GitHub](https://github.com/microsoft/fast-tooling/labels/community:good-first-issue).

We look forward to building an amazing open source community with you!

## Contact

* Join the community and chat with us in real-time on [Discord](https://discord.gg/FcSNfg4).
* Submit requests and issues on [GitHub](https://github.com/microsoft/fast-tooling/issues/new/choose).
