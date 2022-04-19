import versions from "./versions.json";
const toolingPackageName = "@microsoft/fast-tooling";
const toolingReactPackageName = "@microsoft/fast-tooling-react";

/**
 * The contents of the "documentation" property can either be a "doc" or "category".
 *
 * A "doc" must contain the following properties:
 * {
 *   type: "doc", // identify this item as a document
 *   label: "Example" // the readable label used in the sidebar UI
 *   path: "path/to/example" // the path to the file the doc is referencing without the ".md"
 * }
 *
 * A "category" must contain the following properties:
 * {
 *   type: "category", // identify this item as a category
 *   label: "Example", // the readable label used in the sidebar UI
 *   path: "path/to/example", // the path to use as an index of items
 *   description: "" // a description that will show up as a paragraph on the category page
 *   items: [ // the list of items in this category
 *     {
 *       type: "doc", // nesting only goes one level deep, do not place a category type as a category item
 *       ...see above "doc" type
 *     }
 *   ]
 * }
 */
export default {
    documentation: [
        {
            type: "doc",
            label: "Introduction",
            path: "introduction",
        },
        {
            type: "doc",
            label: "Examples",
            path: "examples",
        },
        {
            type: "category",
            label: "Message System",
            description:
                "A web worker that serves as the fundamental backbone to the FAST tooling project.",
            path: "message-system",
            items: [
                {
                    type: "doc",
                    label: "Introduction",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/message-system/introduction`,
                },
                {
                    type: "doc",
                    label: "Messages",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/message-system/messages`,
                },
                {
                    type: "doc",
                    label: "Data Format",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/message-system/data-format`,
                },
            ],
        },
        {
            type: "category",
            label: "React Components",
            description:
                "A set of React components that can be registered with the Message System.",
            path: "react-components",
            items: [
                {
                    type: "doc",
                    label: "Form",
                    path: `fast-tooling-react/${versions[toolingReactPackageName].versions[0]}/components/form`,
                },
                {
                    type: "doc",
                    label: "Navigation",
                    path: `fast-tooling-react/${versions[toolingReactPackageName].versions[0]}/components/navigation`,
                },
                {
                    type: "doc",
                    label: "Viewer",
                    path: `fast-tooling-react/${versions[toolingReactPackageName].versions[0]}/components/viewer`,
                },
            ],
        },
        {
            type: "category",
            label: "Web Components",
            description:
                "A set of FAST-based web components that can be registered with the Message System.",
            path: "web-components",
            items: [
                {
                    type: "doc",
                    label: "Color Picker",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/components/color-picker`,
                },
                {
                    type: "doc",
                    label: "CSS Box Model",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/components/css-box-model`,
                },
                {
                    type: "doc",
                    label: "CSS Layout",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/components/css-layout`,
                },
                {
                    type: "doc",
                    label: "File",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/components/file`,
                },
                {
                    type: "doc",
                    label: "HTML Render",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/components/html-render`,
                },
                {
                    type: "doc",
                    label: "Units Text Field",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/components/units-text-field`,
                },
            ],
        },
        {
            type: "category",
            label: "Message System Services",
            description:
                "A set of class-based services that can be registered with the Message System.",
            path: "message-system-services",
            items: [
                {
                    type: "doc",
                    label: "Shortcuts",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/message-system-services/shortcuts`,
                },
                {
                    type: "doc",
                    label: "Monaco Editor",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/message-system-services/monaco-editor`,
                },
                {
                    type: "doc",
                    label: "Data Validation",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/message-system-services/data-validation`,
                },
                {
                    type: "doc",
                    label: "Create a Service",
                    path: `fast-tooling/${versions[toolingPackageName].versions[0]}/message-system-services/create-a-service`,
                },
            ],
        },
    ],
};
