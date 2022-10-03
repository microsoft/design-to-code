import { cssBoxModelTemplate as template } from "./css-box-model.template.js";
import { cssBoxModelStyles as styles } from "./css-box-model.style.js";
import { CSSBoxModel } from "./css-box-model.js";

/**
 * A web component used for updating CSS box model values.
 *
 * @alpha
 * @remarks
 * HTML Element: \<css-box-model\>
 */
export const cssBoxModelComponent = CSSBoxModel.compose({
    baseName: "css-box-model",
    template,
    styles,
});

export { cssBoxModelCssProperties } from "./css-box-model.css-properties.js";
