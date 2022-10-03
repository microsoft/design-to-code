import { FormAssociated, FoundationElement } from "@microsoft/fast-foundation";

class _BoxModel extends FoundationElement {}
interface _BoxModel extends FormAssociated {}

/**
 * A form-associated base class for the boxModel component.
 *
 * @internal
 */
export class FormAssociatedCSSBoxModel extends FormAssociated(_BoxModel) {
    public proxy: HTMLInputElement = document.createElement("input");
}
