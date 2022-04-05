module.exports = {
    extends: ["../../.eslintrc"],
    rules: {
        "@typescript-eslint/class-name-casing": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "import/extensions": ["error", "always", {
            "props": "never",
            "mdn-data": "never",
            "definition": "never",
            "utilities": "never",
            "service": "never",
            "delete": "never",
            "duplicate": "never",
            "redo": "never",
            "undo": "never",
            "service-action": "never",
            "schema": "never",
            "template": "never",
            "styles": "never",
            "properties": "never",
            "syntax":" never",
            "types": "never"
        }]
    },
};
