import { FormAssociated, FoundationElement } from "@microsoft/fast-foundation";

class _CSSLayout extends FoundationElement {}
interface _CSSLayout extends FormAssociated {}

/**
 * A form-associated base class for the flexbox component.
 *
 * @internal
 */
export class FormAssociatedCSSLayout extends FormAssociated(_CSSLayout) {
    proxy: HTMLInputElement = document.createElement("input");
}
