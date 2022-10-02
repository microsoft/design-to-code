import { FormAssociated, FoundationElement } from "@microsoft/fast-foundation";

class _File extends FoundationElement {}
interface _File extends FormAssociated {}

/**
 * A form-associated base class for the {@link @microsoft/design-to-code#(File:class)} component.
 *
 * @internal
 */
export class FormAssociatedFile extends FormAssociated(_File) {
    proxy: HTMLInputElement = (() => {
        const proxy = document.createElement("input");
        proxy.setAttribute("type", "file");
        return proxy;
    })();
}
