# Contributing

## Setting up your environment

All projects are built in Rust. Follow the installation instructions for Rust in the [Rust documentation](https://doc.rust-lang.org/stable/book/ch01-01-installation.html). Aside from Rust you will also need NodeJS 16+ and `wasm-pack`.

## Running the test environment

To run the app you will need to build the `.wasm` and `.js` files then start up the webpack dev server:

```bash
$ npm build
$ npm start
```

## Adding a new project

1. Add a unique folder name inside the `./src` folder, separate any words with "-" and use lowercase
2. Add any generated files to the `.gitignore`
3. Add any build steps to the `package.json` `scripts` property, use the syntax `build:{folder-name}` and add this to the `build` script. If there are multiple build scripts use `&&` for example `npm build:project-1 && npm build:project-2`
4. Add some manual testing mechanism to the `./app/index.ts` and/or `./app/index.html` files
5. Add the `.js` file to the `./app/index.html` file (do not use webpack to wrap any files generated from emscripten, this will result in the global `Module` variable not being modified)
6. Modify the `webpack.config.js` file to copy any files `.js` or `.wasm` to the `outDir`, see the `CopyPlugin` in the plugins section of the config
