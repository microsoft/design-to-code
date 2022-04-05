import { File } from "./file.js";
import { FileTemplate as template } from "./file.template.js";
import { FileStyles as styles } from "./file.styles.js";

/**
 * @alpha
 * @remarks
 * HTML Element: \<fast-tooling-file\>
 */
export const fastToolingFile = File.compose({
    baseName: "file",
    template,
    styles,
});
