module.exports = {
    disallowedChangeTypes: ["major"],
    ignorePatterns: [
        ".*ignore",
        ".*rc",
        ".git*",
        ".github/**",
        ".vscode/**",
        "build/*",
        "jest.*.js",
        "src/e2e/**",
        "src/tests/**",
        "src/fixtures/**",
        "yarn.lock",
    ],
};
