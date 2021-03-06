import { expect } from "chai";
import { IPosition } from "monaco-editor";
import { linkedDataSchema } from "../schemas";
import {
    mapDataDictionaryToMonacoEditorHTML,
    findMonacoEditorHTMLPositionByDictionaryId,
    findDictionaryIdByMonacoEditorHTMLPosition,
} from "./monaco";
import { DataType, ReservedElementMappingKeyword } from "./types";

const divSchema = {
    type: DataType.object,
    [ReservedElementMappingKeyword.mapsToTagName]: "div",
    properties: {
        Slot: linkedDataSchema,
    },
};
const textSchema = {
    type: DataType.string,
};

describe("mapDataDictionaryToMonacoEditorHTML", () => {
    it("should not map a data dictionary if no schema dictionaries conform to entries", () => {
        const text = "Hello world";
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "text",
                            data: text,
                        },
                    },
                    "root",
                ],
                {}
            )
        ).to.equal("");
    });
    it("should map a data dictionary with a single string entry", () => {
        const text = "Hello world";
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "text",
                            data: text,
                        },
                    },
                    "root",
                ],
                {
                    text: {
                        id: "text",
                        type: "string",
                    },
                }
            )
        ).to.equal(text);
    });
    it("should not map a data dictionary with no mapsToTagName", () => {
        const text = "";
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "input",
                            data: {},
                        },
                    },
                    "root",
                ],
                {
                    input: {
                        id: "input",
                        type: "object",
                    },
                }
            )
        ).to.equal(text);
    });
    it("should map a data dictionary with a single self closing entry", () => {
        const text = "<input />";
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "input",
                            data: {},
                        },
                    },
                    "root",
                ],
                {
                    input: {
                        id: "input",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "input",
                    },
                }
            )
        ).to.equal(text);
    });
    it("should map a data dictionary with a single element entry", () => {
        const text = "<div></div>";
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {},
                        },
                    },
                    "root",
                ],
                {
                    div: {
                        id: "div",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "div",
                    },
                }
            )
        ).to.equal(text);
    });
    it("should map a data dictionary with nested entries", () => {
        const text = "<div>Hello world</div>";
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "text",
                                    },
                                ],
                            },
                        },
                        text: {
                            schemaId: "text",
                            parent: {
                                id: "root",
                                dataLocation: "Slot",
                            },
                            data: "Hello world",
                        },
                    },
                    "root",
                ],
                {
                    div: {
                        id: "div",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "div",
                    },
                    text: {
                        id: "text",
                        type: "string",
                    },
                }
            )
        ).to.equal(text);
    });
    it("should map a data dictionary with multiple nested entries", () => {
        const text = "<div><span>Hello world</span></div>";
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "span",
                                    },
                                ],
                            },
                        },
                        span: {
                            schemaId: "span",
                            parent: {
                                id: "root",
                                dataLocation: "Slot",
                            },
                            data: {
                                Slot: [
                                    {
                                        id: "text",
                                    },
                                ],
                            },
                        },
                        text: {
                            schemaId: "text",
                            parent: {
                                id: "span",
                                dataLocation: "Slot",
                            },
                            data: "Hello world",
                        },
                    },
                    "root",
                ],
                {
                    div: {
                        id: "div",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "div",
                    },
                    span: {
                        id: "span",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "span",
                    },
                    text: {
                        id: "text",
                        type: "string",
                    },
                }
            )
        ).to.equal(text);
    });
    it("should map a data dictionary with named and unnamed slotted nested entries", () => {
        const text = '<div><span slot="foo">Hello world</span></div>';
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                SlotFoo: [
                                    {
                                        id: "span",
                                    },
                                ],
                            },
                        },
                        span: {
                            schemaId: "span",
                            parent: {
                                id: "root",
                                dataLocation: "SlotFoo",
                            },
                            data: {
                                Slot: [
                                    {
                                        id: "text",
                                    },
                                ],
                            },
                        },
                        text: {
                            schemaId: "text",
                            parent: {
                                id: "span",
                                dataLocation: "Slot",
                            },
                            data: "Hello world",
                        },
                    },
                    "root",
                ],
                {
                    div: {
                        id: "div",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "div",
                        properties: {
                            SlotFoo: {
                                [ReservedElementMappingKeyword.mapsToSlot]: "foo",
                                ...linkedDataSchema,
                            },
                        },
                    },
                    span: {
                        id: "span",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "span",
                    },
                    text: {
                        id: "text",
                        type: "string",
                    },
                }
            )
        ).to.equal(text);
    });
    it("should map a data dictionary with multiple named slotted entries", () => {
        const text =
            '<div><span slot="foo">Hello world</span><span slot="foo">Hello pluto</span></div>';
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                SlotFoo: [
                                    {
                                        id: "span1",
                                    },
                                    {
                                        id: "span2",
                                    },
                                ],
                            },
                        },
                        span1: {
                            schemaId: "span",
                            parent: {
                                id: "root",
                                dataLocation: "SlotFoo",
                            },
                            data: {
                                Slot: [
                                    {
                                        id: "text1",
                                    },
                                ],
                            },
                        },
                        text1: {
                            schemaId: "text",
                            parent: {
                                id: "span1",
                                dataLocation: "Slot",
                            },
                            data: "Hello world",
                        },
                        span2: {
                            schemaId: "span",
                            parent: {
                                id: "root",
                                dataLocation: "SlotFoo",
                            },
                            data: {
                                Slot: [
                                    {
                                        id: "text2",
                                    },
                                ],
                            },
                        },
                        text2: {
                            schemaId: "text",
                            parent: {
                                id: "span2",
                                dataLocation: "Slot",
                            },
                            data: "Hello pluto",
                        },
                    },
                    "root",
                ],
                {
                    div: {
                        id: "div",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "div",
                        properties: {
                            SlotFoo: {
                                [ReservedElementMappingKeyword.mapsToSlot]: "foo",
                                ...linkedDataSchema,
                            },
                        },
                    },
                    span: {
                        id: "span",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "span",
                    },
                    text: {
                        id: "text",
                        type: "string",
                    },
                }
            )
        ).to.equal(text);
    });
    it("should map a data dictionary with multiple different named slotted entries", () => {
        const text =
            '<div><span slot="foo">Hello world</span><span id="foo1" title="foo2" slot="bar">Hello pluto</span></div>';
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                SlotFoo: [
                                    {
                                        id: "span1",
                                    },
                                ],
                                SlotBar: [
                                    {
                                        id: "span2",
                                    },
                                ],
                            },
                        },
                        span1: {
                            schemaId: "span",
                            parent: {
                                id: "root",
                                dataLocation: "SlotFoo",
                            },
                            data: {
                                Slot: [
                                    {
                                        id: "text1",
                                    },
                                ],
                            },
                        },
                        text1: {
                            schemaId: "text",
                            parent: {
                                id: "span1",
                                dataLocation: "Slot",
                            },
                            data: "Hello world",
                        },
                        span2: {
                            schemaId: "span",
                            parent: {
                                id: "root",
                                dataLocation: "SlotBar",
                            },
                            data: {
                                id: "foo1",
                                title: "foo2",
                                Slot: [
                                    {
                                        id: "text2",
                                    },
                                ],
                            },
                        },
                        text2: {
                            schemaId: "text",
                            parent: {
                                id: "span2",
                                dataLocation: "Slot",
                            },
                            data: "Hello pluto",
                        },
                    },
                    "root",
                ],
                {
                    div: {
                        id: "div",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "div",
                        properties: {
                            SlotFoo: {
                                [ReservedElementMappingKeyword.mapsToSlot]: "foo",
                                ...linkedDataSchema,
                            },
                            SlotBar: {
                                [ReservedElementMappingKeyword.mapsToSlot]: "bar",
                                ...linkedDataSchema,
                            },
                        },
                    },
                    span: {
                        id: "span",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "span",
                        properties: {
                            id: {
                                type: "string",
                            },
                            title: {
                                type: "string",
                            },
                        },
                    },
                    text: {
                        id: "text",
                        type: "string",
                    },
                }
            )
        ).to.equal(text);
    });
    it("should map a data dictionary with attributes with a single self closing entry", () => {
        const text = '<input title="foo" disabled count="5" />';
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "input",
                            data: {
                                title: "foo",
                                required: false,
                                disabled: true,
                                count: 5,
                            },
                        },
                    },
                    "root",
                ],
                {
                    input: {
                        id: "input",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "input",
                    },
                }
            )
        ).to.equal(text);
    });
    it("should map a data dictionary with attributes with a single element entry", () => {
        const text = '<div id="foo"></div>';
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                id: "foo",
                            },
                        },
                    },
                    "root",
                ],
                {
                    div: {
                        id: "div",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "div",
                    },
                }
            )
        ).to.equal(text);
    });
    it("should map a data dictionary with multiple out of order nested entries at the same level", () => {
        const text = "<div><span>Hello world</span><div>Hello pluto</div></div>";
        expect(
            mapDataDictionaryToMonacoEditorHTML(
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "span",
                                    },
                                    {
                                        id: "div",
                                    },
                                ],
                            },
                        },
                        div: {
                            schemaId: "div",
                            parent: {
                                id: "root",
                                dataLocation: "Slot",
                            },
                            data: {
                                Slot: [
                                    {
                                        id: "text2",
                                    },
                                ],
                            },
                        },
                        span: {
                            schemaId: "span",
                            parent: {
                                id: "root",
                                dataLocation: "Slot",
                            },
                            data: {
                                Slot: [
                                    {
                                        id: "text",
                                    },
                                ],
                            },
                        },
                        text2: {
                            schemaId: "text",
                            parent: {
                                id: "div",
                                dataLocation: "Slot",
                            },
                            data: "Hello pluto",
                        },
                        text: {
                            schemaId: "text",
                            parent: {
                                id: "span",
                                dataLocation: "Slot",
                            },
                            data: "Hello world",
                        },
                    },
                    "root",
                ],
                {
                    div: {
                        id: "div",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "div",
                    },
                    span: {
                        id: "span",
                        type: "object",
                        [ReservedElementMappingKeyword.mapsToTagName]: "span",
                    },
                    text: {
                        id: "text",
                        type: "string",
                    },
                }
            )
        ).to.equal(text);
    });
});

describe("findMonacoEditorHTMLPositionByDictionaryId", () => {
    it("should find the root dictionary ID", () => {
        const position: IPosition = findMonacoEditorHTMLPositionByDictionaryId(
            "root",
            [
                {
                    root: {
                        schemaId: "div",
                        data: {},
                    },
                },
                "root",
            ],
            {
                div: divSchema,
            },
            ["<div></div>"]
        );

        expect(position.column).to.equal(1);
        expect(position.lineNumber).to.equal(1);
    });
    it("should find a nested dictionary ID", () => {
        const position: IPosition = findMonacoEditorHTMLPositionByDictionaryId(
            "foo",
            [
                {
                    root: {
                        schemaId: "div",
                        data: {
                            Slot: [
                                {
                                    id: "foo",
                                },
                            ],
                        },
                    },
                    foo: {
                        schemaId: "div",
                        data: {},
                    },
                },
                "root",
            ],
            {
                div: divSchema,
            },
            ["<div>", "    <div></div>", "</div>"]
        );

        expect(position.column).to.equal(6);
        expect(position.lineNumber).to.equal(2);
    });
    it("should find a nested dictionary ID with adjacent dictionary IDs", () => {
        const position: IPosition = findMonacoEditorHTMLPositionByDictionaryId(
            "bar",
            [
                {
                    root: {
                        schemaId: "div",
                        data: {
                            Slot: [
                                {
                                    id: "foo",
                                },
                                {
                                    id: "bar",
                                },
                            ],
                        },
                    },
                    foo: {
                        schemaId: "div",
                        data: {},
                    },
                    bar: {
                        schemaId: "div",
                        data: {},
                    },
                },
                "root",
            ],
            {
                div: divSchema,
            },
            ["<div>", "    <div></div>", "    <div></div>", "</div>"]
        );

        expect(position.column).to.equal(6);
        expect(position.lineNumber).to.equal(3);
    });
    it("should find a nested dictionary ID when there are text nodes", () => {
        const position: IPosition = findMonacoEditorHTMLPositionByDictionaryId(
            "bar",
            [
                {
                    root: {
                        schemaId: "div",
                        data: {
                            Slot: [
                                {
                                    id: "text1",
                                },
                                {
                                    id: "foo",
                                },
                                {
                                    id: "text2",
                                },
                                {
                                    id: "bar",
                                },
                            ],
                        },
                    },
                    text1: {
                        schemaId: "text",
                        data: "Hello world",
                    },
                    foo: {
                        schemaId: "div",
                        data: {
                            Slot: [
                                {
                                    id: "text3",
                                },
                            ],
                        },
                    },
                    text3: {
                        schemaId: "text",
                        data: "Hello",
                    },
                    text2: {
                        schemaId: "text",
                        data: "Hello world",
                    },
                    bar: {
                        schemaId: "div",
                        data: {
                            Slot: [
                                {
                                    id: "text4",
                                },
                            ],
                        },
                    },
                    text4: {
                        schemaId: "text",
                        data: "world",
                    },
                },
                "root",
            ],
            {
                div: divSchema,
                text: textSchema,
            },
            [
                "<div>",
                "    Hello world",
                "    <div>Hello</div>",
                "    Hello world",
                "    <div>world</div>",
                "</div>",
            ]
        );

        expect(position.column).to.equal(6);
        expect(position.lineNumber).to.equal(5);
    });
    it("should get a nested dictionary item when it is on the same line as another item", () => {
        const position: IPosition = findMonacoEditorHTMLPositionByDictionaryId(
            "foobar",
            [
                {
                    root: {
                        schemaId: "div",
                        data: {
                            Slot: [
                                {
                                    id: "text1",
                                },
                                {
                                    id: "foo",
                                },
                                {
                                    id: "text2",
                                },
                                {
                                    id: "bar",
                                },
                                {
                                    id: "foobar",
                                },
                            ],
                        },
                    },
                    text1: {
                        schemaId: "text",
                        data: "Hello world",
                    },
                    foo: {
                        schemaId: "div",
                        data: {
                            Slot: [
                                {
                                    id: "text3",
                                },
                            ],
                        },
                    },
                    text3: {
                        schemaId: "text",
                        data: "Hello",
                    },
                    text2: {
                        schemaId: "text",
                        data: "Hello world",
                    },
                    bar: {
                        schemaId: "div",
                        data: {
                            Slot: [
                                {
                                    id: "text4",
                                },
                            ],
                        },
                    },
                    text4: {
                        schemaId: "text",
                        data: "world",
                    },
                    foobar: {
                        schemaId: "div",
                        data: {
                            Slot: [
                                {
                                    id: "text5",
                                },
                            ],
                        },
                    },
                    text5: {
                        schemaId: "text",
                        data: "foobar",
                    },
                },
                "root",
            ],
            {
                div: divSchema,
                text: textSchema,
            },
            [
                "<div>",
                "    Hello world",
                "    <div>Hello</div>",
                "    Hello world",
                "    <div>world</div><div>foobar</div>",
                "</div>",
            ]
        );

        expect(position.column).to.equal(22);
        expect(position.lineNumber).to.equal(5);
    });
    it("should get the root location if the dictionary ID could not be found", () => {
        const position: IPosition = findMonacoEditorHTMLPositionByDictionaryId(
            "undefined",
            [
                {
                    root: {
                        schemaId: "div",
                        data: {
                            Slot: [
                                {
                                    id: "foo",
                                },
                            ],
                        },
                    },
                    foo: {
                        schemaId: "div",
                        data: {},
                    },
                },
                "root",
            ],
            {
                div: divSchema,
            },
            ["<div>", "    <div></div>", "</div>"]
        );

        expect(position.column).to.equal(1);
        expect(position.lineNumber).to.equal(1);
    });
});

describe("findDictionaryIdByMonacoEditorHTMLPosition", () => {
    it("should find the root dictionary ID", () => {
        expect(
            findDictionaryIdByMonacoEditorHTMLPosition(
                {
                    lineNumber: 0,
                    column: 0,
                },
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {},
                        },
                    },
                    "root",
                ],
                {
                    div: divSchema,
                },
                ["<div></div>"]
            )
        ).to.equal("root");
    });
    it("should find a nested dictionary ID", () => {
        expect(
            findDictionaryIdByMonacoEditorHTMLPosition(
                {
                    lineNumber: 2,
                    column: 6,
                },
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "foo",
                                    },
                                ],
                            },
                        },
                        foo: {
                            schemaId: "div",
                            data: {},
                        },
                    },
                    "root",
                ],
                {
                    div: divSchema,
                },
                ["<div>", "    <div></div>", "</div>"]
            )
        ).to.equal("foo");
        expect(
            findDictionaryIdByMonacoEditorHTMLPosition(
                {
                    lineNumber: 1,
                    column: 14,
                },
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "foo",
                                    },
                                ],
                            },
                        },
                        foo: {
                            parent: {
                                id: "root",
                                dataLocation: "Slot",
                            },
                            schemaId: "div",
                            data: {},
                        },
                    },
                    "root",
                ],
                {
                    div: divSchema,
                },
                ["<div>", "    <div></div>", "</div>"]
            )
        ).to.equal("foo");
    });
    it("should find a nested dictionary ID with adjacent dictionary IDs", () => {
        expect(
            findDictionaryIdByMonacoEditorHTMLPosition(
                {
                    lineNumber: 2,
                    column: 6,
                },
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "foo",
                                    },
                                    {
                                        id: "bar",
                                    },
                                ],
                            },
                        },
                        foo: {
                            schemaId: "div",
                            data: {},
                        },
                        bar: {
                            schemaId: "div",
                            data: {},
                        },
                    },
                    "root",
                ],
                {
                    div: divSchema,
                },
                ["<div>", "    <div></div>", "    <div></div>", "</div>"]
            )
        ).to.equal("foo");
        expect(
            findDictionaryIdByMonacoEditorHTMLPosition(
                {
                    lineNumber: 3,
                    column: 6,
                },
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "foo",
                                    },
                                    {
                                        id: "bar",
                                    },
                                ],
                            },
                        },
                        foo: {
                            schemaId: "div",
                            data: {},
                        },
                        bar: {
                            schemaId: "div",
                            data: {},
                        },
                    },
                    "root",
                ],
                {
                    div: divSchema,
                },
                ["<div>", "    <div></div>", "    <div></div>", "</div>"]
            )
        ).to.equal("bar");
    });
    it("should find a nested dictionary ID when there are text nodes", () => {
        expect(
            findDictionaryIdByMonacoEditorHTMLPosition(
                {
                    column: 6,
                    lineNumber: 5,
                },
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "text1",
                                    },
                                    {
                                        id: "foo",
                                    },
                                    {
                                        id: "text2",
                                    },
                                    {
                                        id: "bar",
                                    },
                                ],
                            },
                        },
                        text1: {
                            schemaId: "text",
                            data: "Hello world",
                        },
                        foo: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "text3",
                                    },
                                ],
                            },
                        },
                        text3: {
                            schemaId: "text",
                            data: "Hello",
                        },
                        text2: {
                            schemaId: "text",
                            data: "Hello world",
                        },
                        bar: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "text4",
                                    },
                                ],
                            },
                        },
                        text4: {
                            schemaId: "text",
                            data: "world",
                        },
                    },
                    "root",
                ],
                {
                    div: divSchema,
                    text: textSchema,
                },
                [
                    "<div>",
                    "    Hello world",
                    "    <div>Hello</div>",
                    "    Hello world",
                    "    <div>world</div>",
                    "</div>",
                ]
            )
        ).to.equal("bar");
    });
    it("should get a nested dictionary item when it is on the same line as another item", () => {
        expect(
            findDictionaryIdByMonacoEditorHTMLPosition(
                {
                    column: 22,
                    lineNumber: 5,
                },
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "text1",
                                    },
                                    {
                                        id: "foo",
                                    },
                                    {
                                        id: "text2",
                                    },
                                    {
                                        id: "bar",
                                    },
                                    {
                                        id: "foobar",
                                    },
                                ],
                            },
                        },
                        text1: {
                            schemaId: "text",
                            data: "Hello world",
                        },
                        foo: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "text3",
                                    },
                                ],
                            },
                        },
                        text3: {
                            schemaId: "text",
                            data: "Hello",
                        },
                        text2: {
                            schemaId: "text",
                            data: "Hello world",
                        },
                        bar: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "text4",
                                    },
                                ],
                            },
                        },
                        text4: {
                            schemaId: "text",
                            data: "world",
                        },
                        foobar: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "text5",
                                    },
                                ],
                            },
                        },
                        text5: {
                            schemaId: "text",
                            data: "foobar",
                        },
                    },
                    "root",
                ],
                {
                    div: divSchema,
                    text: textSchema,
                },
                [
                    "<div>",
                    "    Hello world",
                    "    <div>Hello</div>",
                    "    Hello world",
                    "    <div>world</div><div>foobar</div>",
                    "</div>",
                ]
            )
        ).to.equal("foobar");
    });
    it("should get the root location if the dictionary ID could not be found", () => {
        expect(
            findDictionaryIdByMonacoEditorHTMLPosition(
                {
                    column: 0,
                    lineNumber: 0,
                },
                [
                    {
                        root: {
                            schemaId: "div",
                            data: {
                                Slot: [
                                    {
                                        id: "foo",
                                    },
                                ],
                            },
                        },
                        foo: {
                            schemaId: "div",
                            data: {},
                        },
                    },
                    "root",
                ],
                {
                    div: divSchema,
                },
                ["<div>", "    <div></div>", "</div>"]
            )
        ).to.equal("root");
    });
});
