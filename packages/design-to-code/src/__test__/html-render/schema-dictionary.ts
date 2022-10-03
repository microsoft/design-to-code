import { linkedDataSchema } from "../../schemas/index.js";
import { ReservedElementMappingKeyword } from "../../data-utilities/types.js";

export default {
    div: {
        $id: "div",
        id: "div",
        type: "object",
        title: "root_div",
        [ReservedElementMappingKeyword.mapsToTagName]: "div",
        properties: {
            foo: {
                title: "Foo",
                type: "string",
            },
            bar: {
                title: "Bar",
                type: "boolean",
            },
            Slot: {
                [ReservedElementMappingKeyword.mapsToSlot]: "",
                ...linkedDataSchema,
            },
        },
    },
    span: {
        $id: "span",
        id: "span",
        type: "object",
        title: "span",
        [ReservedElementMappingKeyword.mapsToTagName]: "span",
        properties: {
            Slot: {
                [ReservedElementMappingKeyword.mapsToSlot]: "",
                ...linkedDataSchema,
            },
        },
    },
    text: {
        $id: "text",
        id: "text",
        type: "string",
    },
};
