import { ColorPicker } from "./color-picker.js";
import { colorPickerTemplate as template } from "./color-picker.template.js";
import { colorPickerStyles as styles } from "./color-picker.styles.js";

/**
 * A web component used for updating color values.
 *
 * @alpha
 * @remarks
 * HTML Element: \<color-picker\>
 */
export const colorPickerComponent = ColorPicker.compose({
    baseName: "color-picker",
    template,
    styles,
});
