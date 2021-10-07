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
This project uses [Beachball](https://microsoft.github.io/beachball/) to publish packages to NPM. The process is controlled through a series of commands located in the root `package.json` file to check, change, and publish. When a change occurs within the configuration (`beachball.config.js`) parameters, Beachball will trigger interactive mode on the command line to capture additional details for generating the changelog file. The change instructions are saved to `./changes/*` folder and used during continuous delivery process on GitHub Actions (`.github/workflows/cd-publish-packages.yml`) to publish to NPM.

#### Development process
The development process must be enhanced to include Beachball prior to submitting new pull requests for review.

1. Check for any changes per the configuration file, generally this is checking for patches and minor changes.
```
npm run publish:check
```
2. If changes are discovered, then this must be run to generate the change files.
```
npm run publish:change
```
3. Changes are now ready to be committed and pushed for review.

#### Testing process
Several commands are available for testing.

Beachball `publish:bump` can be used to version locally without publishing to the remote Git repository or NPM registry. This runs the same logic as `publish:start` so it's good practice to bump things locally to verify what is being changed.



## Joining the Community

Looking to get answers to questions or engage with us in realtime? Our community is most active [on Discord](https://discord.gg/FcSNfg4). Submit requests and issues on [GitHub](https://github.com/microsoft/fast-tooling/issues/new/choose), or join us by contributing on [some good first issues via GitHub](https://github.com/microsoft/fast-tooling/labels/community:good-first-issue).

We look forward to building an amazing open source community with you!

## Contact

* Join the community and chat with us in real-time on [Discord](https://discord.gg/FcSNfg4).
* Submit requests and issues on [GitHub](https://github.com/microsoft/fast-tooling/issues/new/choose).
