import { textFieldTemplate as template } from "@microsoft/fast-foundation";
import { textFieldStyles as styles } from "@microsoft/fast-components";
import { UnitsTextField } from "./units-text-field.js";

/**
 * A web component text field that increments / decrements numeric values mixed with text when up and down arrow keys are pressed.
 *
 * @alpha
 * @remarks
 * HTML Element: \<units-text-field\>
 */
export const unitsTextFieldComponent = UnitsTextField.compose({
    baseName: "units-text-field",
    template,
    styles,
    shadowOptions: {
        delegatesFocus: true,
    },
});
