import { FormAssociated, FoundationElement } from "@microsoft/fast-foundation";

/**
 * A form-associated base class for the boxModel component.
 *
 * @internal
 */
export class FormAssociatedCSSBoxModel extends FormAssociated(
    class extends FoundationElement {
        public proxy: HTMLInputElement = document.createElement("input");
    }
) {}

/**
 * @internal
 */
export interface FormAssociatedCSSBoxModel extends FormAssociated {}
