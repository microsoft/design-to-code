import { TextField, textFieldTemplate as template } from "@microsoft/fast-foundation";
import { textFieldStyles as styles } from "@microsoft/fast-components";
import { IncrementTextField } from "./increment-text-field";

/**
 * A web component text field that increments / decrements numaric values mixed with text when up and down arrow keys are pressed.
 *
 * @alpha
 * @remarks
 * HTML Element: \<increment-text-field\>
 */
export const fastToolingIncrementTextField = IncrementTextField.compose({
    baseName: "increment-text-field",
    template,
    styles,
});
