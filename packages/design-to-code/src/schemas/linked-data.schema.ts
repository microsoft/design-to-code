import { linkedDataPluginId, pluginIdKeyword } from "./keywords.js";

export const dictionaryLink: string = "@microsoft/design-to-code/dictionary-link";

export default {
    [dictionaryLink]: true,
    [pluginIdKeyword]: linkedDataPluginId,
    type: "array",
    items: {
        type: "object",
        properties: {
            id: {
                title: "The ID of the data corresponding to a dictionary key",
                type: "string",
            },
            dataLocation: {
                title: "The location of the data using lodash path syntax",
                type: "string",
            },
        },
    },
};
