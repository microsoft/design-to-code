module.exports = {
    extends: ["../../.eslintrc"],
    rules: {
        "@typescript-eslint/class-name-casing": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "import/extensions": ["error", "always", { "props": "never" }]
    },
};
