/**
 * This script moves the generated site from www to the root docs/ folder recognized by github pages
 */
import fs from "fs-extra";
import path from "path";

const __dirname = process.cwd();

fs.copy(path.resolve(__dirname, "www"), path.resolve(__dirname, "../docs"), function (
    err
) {
    if (err) {
        return console.error(err);
    }

    console.log("Generated static files copied to docs folder for GitHub pages.");
});
