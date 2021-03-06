import {
    WebComponentDefinition,
    WebComponentDefinitionTag,
} from "../data-utilities/web-component.js";
import { commonHTMLAttributes } from "./native/common.definition.js";
import * as nativeElementDefinitions from "./native/index.js";

export function extendElementDefinitions(definitions: {
    [key: string]: WebComponentDefinition;
}): { [key: string]: WebComponentDefinition } {
    return Object.entries(definitions)
        .map(([definitionKey, definitionValue]: [string, WebComponentDefinition]): [
            string,
            WebComponentDefinition
        ] => {
            return [
                definitionKey,
                {
                    ...definitionValue,
                    tags: definitionValue.tags?.map((tag: WebComponentDefinitionTag) => {
                        return {
                            ...tag,
                            attributes: (tag.attributes || []).concat(
                                commonHTMLAttributes
                            ),
                        };
                    }),
                },
            ];
        })
        .reduce(
            (
                previousValue: { [key: string]: WebComponentDefinition },
                currentValue: [string, WebComponentDefinition]
            ) => {
                return {
                    ...previousValue,
                    [currentValue[0]]: currentValue[1],
                };
            },
            {}
        );
}

const nativeElementExtendedDefinitions = extendElementDefinitions(
    nativeElementDefinitions
);

export { nativeElementDefinitions, nativeElementExtendedDefinitions };
