import { FormAssociated, FoundationElement } from "@microsoft/fast-foundation";

class _IncrementTextField extends FoundationElement {}
interface _IncrementTextField extends FormAssociated {}

/**
 * A form-associated base class for the {@link @microsoft/fast-tooling#(IncrementTextField:class)} component.
 *
 * @internal
 */
export class FormAssociatedIncrementTextField extends FormAssociated(
    _IncrementTextField
) {
    proxy: HTMLInputElement = (() => {
        const proxy = document.createElement("input");
        proxy.setAttribute("type", "file");
        return proxy;
    })();
}
