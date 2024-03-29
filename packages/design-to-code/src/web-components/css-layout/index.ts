import { cssLayoutTemplate as template } from "./css-layout.template.js";
import { cssLayoutStyles as styles } from "./css-layout.styles.js";
import { CSSLayout } from "./css-layout.js";

/**
 * A web component used for updating CSS layout values.
 *
 * @alpha
 * @remarks
 * HTML Element: \<css-layout\>
 */
export const cssLayoutComponent = CSSLayout.compose({
    baseName: "css-layout",
    template,
    styles,
});
export { cssLayoutCssProperties } from "./css-layout.css-properties.js";
