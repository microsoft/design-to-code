import { FileActionObjectUrl } from "./file-action-objecturl.js";

/**
 * @alpha
 * @remarks
 * FileAction component for transforming files into Object URLs via URL.createObjectURL().
 * HTML Element: \<file-action-objecturl\>
 */
export const fileActionObjectUrlComponent = FileActionObjectUrl.compose({
    baseName: "file-action-objecturl",
});
