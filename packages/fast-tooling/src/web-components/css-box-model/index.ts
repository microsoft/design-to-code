import { cssBoxModelTemplate as template } from "./css-box-model.template";
import { cssBoxModelStyles as styles } from "./css-box-model.style";
import { CSSBoxModel } from "./css-box-model";

/**
 * A web component used for updating CSS box model values.
 *
 * @alpha
 * @remarks
 * HTML Element: \<css-box-model\>
 */
export const fastToolingCSSBoxModel = CSSBoxModel.compose({
    baseName: "css-box-model",
    template,
    styles,
});

export { cssBoxModelCssProperties } from "./css-box-model.css-properties";
