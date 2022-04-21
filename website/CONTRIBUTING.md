# Contributing

This website is a static website, it contains two separate generation methods, a front page which is created using webpack, and documentation pages created from the build script located in `build/docs.js` which leverages markdown.

Both portions of the site contain a `templates/` folder, which is used by both webpack and the `build/docs.js` file to construct the front page and the documentation respectively.

## Adding a document

When a new markdown file is added, be sure to include it in the `docs/sidebar.js`.

## Removing a document

When removing a markdown file, be sure to remove any reference to it from the `docs/sidebar.js`.

## Major versioning

When contributing a new version:
1. Add the version for the package in the `docs/versions.json`
2. Add the versioned folder `docs/{package-name}/{version}`
3. Update the sidebar versions in `docs/sidebar.js`

## Updating styles

The styles are globally applied to the front page and the documentation, they can be found in `src/templates/style/index.html`.
