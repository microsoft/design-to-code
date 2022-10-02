# Contributing to Design to Code

Contributions are welcome! You can submit a pull request to fix a bug, implementing a feature, or even correcting simple documentation typos.

## Getting started

### Machine setup

To work with the Design to Code [monorepo](https://en.wikipedia.org/wiki/Monorepo) you'll need Git, Node.js@^16.0.0, and npm@^7.0.0 setup on your machine.

Design to Code uses Git as its source control system. If you haven't already installed it, you can download it [here](https://git-scm.com/downloads) or if you prefer a GUI-based approach, try [GitHub Desktop](https://desktop.github.com/).

Once Git is installed, you'll also need Node.js, which Design to Code uses as its JavaScript runtime, enabling its build and test scripts. Node.js instructions and downloads for your preferred OS can be found [here](https://nodejs.org/en/).

:::important
The above steps are a one-time setup for your machine and do not need to be repeated after the initial configuration.
:::

### Cloning the repository

Now that your machine is setup, you can clone the Design to Code repository. Open a terminal and run this command:

```shell
git clone https://github.com/microsoft/design-to-code.git
```
Cloning via SSH:

```shell
git clone git@github.com:microsoft/design-to-code.git
```

### Installing and building

From within the `design-to-code` folder where you've cloned the repo, install all package dependencies and build all workspaces (local dependencies) with this command:

```bash
npm install
```

After the initial install, you can re-build all workspaces in the future with:

```bash
npm run prepare --workspaces
```

### Testing

To run all tests for all packages, use the following command:

```bash
npm run test --workspaces
```

This command can also be run from within individual package folders to execute only tests from that package.

:::note
Packages are located within the `packages` folder of the repository. Each package has a `package.json` file with a `scripts` section that defines the commands available to you for common tasks such as build, test, lint, etc.
:::

### Submitting a pull request

Prior to submitting a pull request please follow the following steps.

1. Review and adhere to the standards defined in the [style guide](./STYLE_GUIDE.md).
2. Rebase your branch from your target branch (typically `main`) or use the *merge* button provided by GitHub. If you're new to rebasing checkout [Merging vs Rebasing](https://www.atlassian.com/git/tutorials/merging-vs-rebasing).
3. Generate a change file(s) using `npm run change` located in `./change/*` and used for continuous delivery. As a convenience, the interactive prompt looks to provide recent commit messages for use in the description. *For changes which do not affect the published package(s), please use "none" when selecting the change type*.
4. Finally, when submitting your pull request please make the title clear and concise, provide a description of the change, and specify any issues that will be closed.

:::note
If you are addressing multiple issues which are unrelated, consider either doing multiple pull requests, or generate separate change files to ensure accurate generation of changelogs and versioning of packages.
:::

For additional details on package versioning and changelog generation read the [publishing](./PUBLISHING.md) documentation.

:::note
If you are finding that your changes are either breaking changes or require multiple pull requests, open an issue to discuss this.
:::

For additional details on branch management read the [branch guide](./BRANCH_GUIDE.md) documentation.

### Merging a pull request

If you are merging a pull request, be sure to use the pull request title as the commit title. It is recommended that if you are merging in pull requests regularly that you add a browser extension that will auto-correct the title for you. A few that should do this are [Refined GitHub](https://github.com/sindresorhus/refined-github) and [Squashed Merge Message](https://github.com/zachwhaley/squashed-merge-message).

For further reading on how commits are created through the GitHub interface during pull request merging, read this [article](https://docs.github.com/en/github/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request#merging-a-pull-request).
### Documenting breaking changes

Make sure to document the migration strategy in a `MIGRATION.md` file in the package(s) that has breaking changes, eg. `packages/fast-tooling/MIGRATION.md`.

Example of how to format `MIGRATION.md`:

```md
# Migrating from previous versions

## v1 to v2

- Export `Foo` has been renamed to `Bar`.
- `Bat` has been updated to use the new API [`BatConfig`](link/to/api).
```

### Recommended settings for Visual Studio Code

You can use any code editor you like when working with the FAST Tooling monorepo. One of our favorites is [Visual Studio Code](https://code.visualstudio.com/). VS Code has great autocomplete support for TypeScript and JavaScript APIs, as well as a rich ecosystem of plugins.

Default VS Code settings for this project are configured as [Workspace settings](https://code.visualstudio.com/docs/getstarted/settings) in the `.vscode` directory. These settings override user settings for the workspace and are configured to ensure consistent code formatting across different environments. We also include a list of [Workspace recommended extensions](https://code.visualstudio.com/docs/editor/extension-marketplace#_workspace-recommended-extensions) for VS Code for syntax highlighting and code linting.

## FAST guidance

The Design to Code project follows the contribution policy outlined in the FAST project for their [governance](https://github.com/microsoft/fast/blob/master/CONTRIBUTING.md#governance), [acceptance and consensus seeking process](https://github.com/microsoft/fast/blob/master/CONTRIBUTING.md#acceptance-and-consensus-seeking-process), and [stability policy](https://github.com/microsoft/fast/blob/master/CONTRIBUTING.md#stability-policy).

## Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

* a. The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file; or
* b. The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license (unless I am permitted to submit under a different license), as indicated in the file; or
* c. The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it.
* d. I understand and agree that this project and the contribution are public and that a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.

## Resources

Several open source projects have influenced our contribution policy:

* [Project Governance @Node](https://nodejs.org/en/about/governance/)
* [Contributions @Node](https://github.com/nodejs/node/blob/master/CONTRIBUTING.md)
* [Open Source @GitHub](https://github.com/blog/2039-adopting-the-open-code-of-conduct)
* [Open Source examples @todogroup](https://github.com/todogroup/policies)
