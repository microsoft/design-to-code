import { provideFASTDesignSystem, fastTextField } from "@microsoft/fast-components";
import { html, ref, slotted, ViewTemplate } from "@microsoft/fast-element";
import { ElementDefinitionContext } from "@microsoft/fast-foundation";
import { IncrementTextField } from "./increment-text-field";

provideFASTDesignSystem().register(fastTextField());

export const incrementTextFieldTemplate: (
    context: ElementDefinitionContext
) => ViewTemplate<IncrementTextField> = context => {
    return html<IncrementTextField>`
        <fast-text-field></fast-text-field>
    `;
};
