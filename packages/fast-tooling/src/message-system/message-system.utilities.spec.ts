import { expect } from "chai";
import { DataType } from "../data-utilities/types";
import { linkedDataSchema } from "../schemas";
import {
    AddDataMessageOutgoing,
    AddLinkedDataDataMessageOutgoing,
    AddSchemaDictionaryMessageOutgoing,
    DataMessageIncoming,
    DuplicateDataMessageOutgoing,
    GetHistoryMessageIncoming,
    GetHistoryMessageOutgoing,
    GetNavigationMessageOutgoing,
    InitializeMessageOutgoing,
    InternalIncomingMessage,
    InternalOutgoingMessage,
    MessageSystemDataTypeAction,
    MessageSystemHistoryTypeAction,
    MessageSystemNavigationTypeAction,
    MessageSystemSchemaDictionaryTypeAction,
    MessageSystemValidationTypeAction,
    NavigationMessageIncoming,
    NavigationMessageOutgoing,
    RemoveDataMessageOutgoing,
    UpdateDataMessageOutgoing,
    UpdateValidationMessageIncoming,
    ValidationMessageIncoming,
    ValidationMessageOutgoing,
} from "./message-system.utilities.props";
import { MessageSystemType } from "./types";
import { getMessage } from "./message-system.utilities";
import { Data, DataDictionary, LinkedData } from "./data.props";
import { SchemaDictionary } from "./schema.props";
import { getNavigationDictionary } from "./navigation";
import { removeRootDataNodeErrorMessage } from "./errors";

describe("getMessage", () => {
    describe("history", () => {
        it("should return messages sent to get the history", () => {
            const getHistory: InternalIncomingMessage<GetHistoryMessageIncoming> = [
                {
                    type: MessageSystemType.history,
                    action: MessageSystemHistoryTypeAction.get,
                },
                "",
            ];
            const historyMessage = getMessage(getHistory);

            expect(historyMessage[0][0].type).to.equal(MessageSystemType.history);
            expect((historyMessage[0][0] as GetHistoryMessageOutgoing).action).to.equal(
                MessageSystemHistoryTypeAction.get
            );
            expect(
                (historyMessage[0][0] as GetHistoryMessageOutgoing).history.items.length
            ).to.equal(0);
            expect(
                (historyMessage[0][0] as GetHistoryMessageOutgoing).history.limit
            ).to.equal(30);
        });
        it("should update the history when a new message has been sent", () => {
            const dataBlob: DataDictionary<unknown> = [
                {
                    data: {
                        schemaId: "foo",
                        data: {
                            foo: "bar",
                        },
                    },
                },
                "data",
            ];
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    dataDictionary: dataBlob,
                    schemaDictionary,
                },
                "",
            ]);
            getMessage([
                {
                    type: MessageSystemType.navigation,
                    action: MessageSystemNavigationTypeAction.update,
                    activeDictionaryId: "data",
                } as NavigationMessageIncoming,
                "",
            ]);

            const getHistory: GetHistoryMessageIncoming = {
                type: MessageSystemType.history,
                action: MessageSystemHistoryTypeAction.get,
            };

            expect(
                (getMessage([getHistory, ""])[0][0] as GetHistoryMessageOutgoing).history
                    .items.length
            ).to.equal(1);
        });
        it("should remove the first item in the array if another item is added that would be higher than the limit", () => {
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };

            getMessage([
                {
                    type: MessageSystemType.initialize,
                    dataDictionary: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    foo: "bar",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary,
                },
                "",
            ]);

            for (let i = 0, limit = 50; i < limit; i++) {
                getMessage([
                    {
                        type: MessageSystemType.navigation,
                        action: MessageSystemNavigationTypeAction.update,
                        activeDictionaryId: "data" + i,
                    } as NavigationMessageIncoming,
                    "",
                ]);
            }

            const getHistory: GetHistoryMessageIncoming = {
                type: MessageSystemType.history,
                action: MessageSystemHistoryTypeAction.get,
            };

            expect(
                (getMessage([getHistory, ""])[0][0] as GetHistoryMessageOutgoing).history
                    .items.length
            ).to.equal(30);

            const lastItem = (getMessage([
                getHistory,
                "",
            ])[0][0] as GetHistoryMessageOutgoing).history.items[29];

            expect(lastItem.previous[0]).to.not.equal(undefined);
            expect(lastItem.next).to.not.equal(undefined);
        });
        it("should update the active history index if the previous message has been sent", () => {
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };

            getMessage([
                {
                    type: MessageSystemType.initialize,
                    dataDictionary: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    foo: "bar",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary,
                },
                "",
            ]);

            for (let i = 0, limit = 50; i < limit; i++) {
                getMessage([
                    {
                        type: MessageSystemType.navigation,
                        action: MessageSystemNavigationTypeAction.update,
                        activeDictionaryId: "data" + i,
                    } as NavigationMessageIncoming,
                    "",
                ]);
            }

            getMessage([
                {
                    type: MessageSystemType.history,
                    action: MessageSystemHistoryTypeAction.previous,
                },
                "",
            ]);

            const getHistory: GetHistoryMessageIncoming = {
                type: MessageSystemType.history,
                action: MessageSystemHistoryTypeAction.get,
            };

            const history = (getMessage([
                getHistory,
                "",
            ])[0][0] as GetHistoryMessageOutgoing).activeHistoryIndex;

            expect(history).to.equal(28);
        });
        it("should send the previous message if the previous message has been sent", () => {
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };

            getMessage([
                {
                    type: MessageSystemType.initialize,
                    dataDictionary: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    foo: "bar",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary,
                },
                "",
            ]);

            for (let i = 0, limit = 50; i < limit; i++) {
                getMessage([
                    {
                        type: MessageSystemType.navigation,
                        action: MessageSystemNavigationTypeAction.update,
                        activeDictionaryId: "data" + i,
                    } as NavigationMessageIncoming,
                    "",
                ]);
            }

            const previousMessage = getMessage([
                {
                    type: MessageSystemType.history,
                    action: MessageSystemHistoryTypeAction.previous,
                },
                "",
            ]);

            expect(previousMessage[0][0].type).to.equal(MessageSystemType.navigation);
            expect((previousMessage[0][0] as any).action).to.equal(
                MessageSystemNavigationTypeAction.update
            );
            expect((previousMessage[0][0] as any).activeDictionaryId).to.equal("data48");
        });
        it("should update the active history index if the next message has been sent", () => {
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };

            getMessage([
                {
                    type: MessageSystemType.initialize,
                    dataDictionary: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    foo: "bar",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary,
                },
                "",
            ]);

            for (let i = 0, limit = 50; i < limit; i++) {
                getMessage([
                    {
                        type: MessageSystemType.navigation,
                        action: MessageSystemNavigationTypeAction.update,
                        activeDictionaryId: "data" + i,
                    } as NavigationMessageIncoming,
                    "",
                ]);
            }

            for (let i = 0, limit = 6; i < limit; i++) {
                getMessage([
                    {
                        type: MessageSystemType.history,
                        action: MessageSystemHistoryTypeAction.previous,
                    },
                    "",
                ]);
            }

            getMessage([
                {
                    type: MessageSystemType.history,
                    action: MessageSystemHistoryTypeAction.next,
                },
                "",
            ]);

            const getHistory: GetHistoryMessageIncoming = {
                type: MessageSystemType.history,
                action: MessageSystemHistoryTypeAction.get,
            };

            const history = (getMessage([
                getHistory,
                "",
            ])[0][0] as GetHistoryMessageOutgoing).activeHistoryIndex;

            expect(history).to.equal(24);
        });
        it("should send the next message if the next message has been sent", () => {
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };

            getMessage([
                {
                    type: MessageSystemType.initialize,
                    dataDictionary: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    foo: "bar",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary,
                },
                "",
            ]);

            for (let i = 0, limit = 50; i < limit; i++) {
                getMessage([
                    {
                        type: MessageSystemType.navigation,
                        action: MessageSystemNavigationTypeAction.update,
                        activeDictionaryId: "data" + i,
                    } as NavigationMessageIncoming,
                    "",
                ]);
            }

            for (let i = 0, limit = 6; i < limit; i++) {
                getMessage([
                    {
                        type: MessageSystemType.history,
                        action: MessageSystemHistoryTypeAction.previous,
                    },
                    "",
                ]);
            }

            const nextMessage = getMessage([
                {
                    type: MessageSystemType.history,
                    action: MessageSystemHistoryTypeAction.next,
                },
                "",
            ]);

            expect(nextMessage[0][0].type).to.equal(MessageSystemType.navigation);
            expect((nextMessage[0][0] as any).action).to.equal(
                MessageSystemNavigationTypeAction.update
            );
            expect((nextMessage[0][0] as any).activeDictionaryId).to.equal("data44");
        });
        it("should remove history items that are no longer relevent if a new data or navigation update has been sent", () => {
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };

            getMessage([
                {
                    type: MessageSystemType.initialize,
                    dataDictionary: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    foo: "bar",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary,
                },
                "",
            ]);

            for (let i = 0, limit = 50; i < limit; i++) {
                getMessage([
                    {
                        type: MessageSystemType.navigation,
                        action: MessageSystemNavigationTypeAction.update,
                        activeDictionaryId: "data" + i,
                    } as NavigationMessageIncoming,
                    "",
                ]);
            }

            for (let i = 0, limit = 6; i < limit; i++) {
                getMessage([
                    {
                        type: MessageSystemType.history,
                        action: MessageSystemHistoryTypeAction.previous,
                    },
                    "",
                ]);
            }

            getMessage([
                {
                    type: MessageSystemType.navigation,
                    action: MessageSystemNavigationTypeAction.update,
                    activeDictionaryId: "data100",
                } as NavigationMessageIncoming,
                "",
            ]);

            const getHistory: GetHistoryMessageIncoming = {
                type: MessageSystemType.history,
                action: MessageSystemHistoryTypeAction.get,
            };

            const history = getMessage([
                getHistory,
                "",
            ])[0][0] as GetHistoryMessageOutgoing;

            expect(history.activeHistoryIndex).to.equal(24);
            expect(history.history.items.length).to.equal(25);
        });
        describe("items", () => {
            beforeEach(() => {
                const schemaDictionary: SchemaDictionary = {
                    foo: { id: "foo" },
                };
                const dataBlob: DataDictionary<unknown> = [
                    {
                        data: {
                            schemaId: "foo",
                            data: {
                                foo: "bar",
                                children: [
                                    {
                                        id: "data2",
                                    },
                                    {
                                        id: "data3",
                                    },
                                ],
                            },
                        },
                        data2: {
                            schemaId: "foo",
                            data: {},
                            parent: {
                                id: "data",
                                dataLocation: "children",
                            },
                        },
                        data3: {
                            schemaId: "foo",
                            data: {
                                foo: "bat",
                            },
                            parent: {
                                id: "data",
                                dataLocation: "children",
                            },
                        },
                    },
                    "data",
                ];

                getMessage([
                    {
                        type: MessageSystemType.initialize,
                        dataDictionary: dataBlob,
                        schemaDictionary,
                    },
                    "",
                ]);
            });
            describe("navigation", () => {
                it("should store a history item when the active dictionary ID is updated", () => {
                    getMessage([
                        {
                            type: MessageSystemType.navigation,
                            action: MessageSystemNavigationTypeAction.update,
                            activeDictionaryId: "data2",
                        } as NavigationMessageIncoming,
                        "",
                    ]);

                    const getHistory: GetHistoryMessageIncoming = {
                        type: MessageSystemType.history,
                        action: MessageSystemHistoryTypeAction.get,
                    };
                    const items = (getMessage([
                        getHistory,
                        "",
                    ])[0][0] as GetHistoryMessageOutgoing).history.items;
                    const lastItemIndex = items.length - 1;
                    const lastItem = items[lastItemIndex];

                    expect(lastItem.next).to.deep.equal({
                        type: MessageSystemType.navigation,
                        action: MessageSystemNavigationTypeAction.update,
                        activeDictionaryId: "data2",
                    });
                    expect(lastItem.previous[0].type).to.equal(
                        MessageSystemType.navigation
                    );
                    expect((lastItem.previous[0] as any).action).to.equal(
                        MessageSystemNavigationTypeAction.update
                    );
                    expect((lastItem.previous[0] as any).activeDictionaryId).to.equal(
                        "data"
                    );
                    expect(
                        (lastItem.previous[0] as any).activeNavigationConfigId
                    ).to.equal("");
                });
            });
            describe("data", () => {
                it("should store a history item when data has been duplicated", () => {
                    getMessage([
                        {
                            type: MessageSystemType.data,
                            action: MessageSystemDataTypeAction.duplicate,
                            sourceDataLocation: "foo",
                        } as DataMessageIncoming,
                        "",
                    ]);

                    const getHistory: GetHistoryMessageIncoming = {
                        type: MessageSystemType.history,
                        action: MessageSystemHistoryTypeAction.get,
                    };
                    const history = (getMessage([
                        getHistory,
                        "",
                    ])[0][0] as GetHistoryMessageOutgoing).history;
                    const lastItemIndex = history.items.length - 1;
                    const lastItem = history.items[lastItemIndex];

                    expect(lastItem.next.type).to.equal(MessageSystemType.data);
                    expect((lastItem.next as any).action).to.equal(
                        MessageSystemDataTypeAction.duplicate
                    );
                    expect((lastItem.next as any).sourceDataLocation).to.equal("foo");
                    expect(lastItem.previous[0].type).to.equal(MessageSystemType.data);
                    expect((lastItem.previous[0] as any).action).to.equal(
                        MessageSystemDataTypeAction.remove
                    );
                    expect((lastItem.previous[0] as any).dataLocation).to.equal("foo[0]");
                });
                it("should store a history item when data has been removed", () => {
                    getMessage([
                        {
                            type: MessageSystemType.data,
                            action: MessageSystemDataTypeAction.remove,
                            dataLocation: "foo",
                        } as DataMessageIncoming,
                        "",
                    ]);

                    const getHistory: GetHistoryMessageIncoming = {
                        type: MessageSystemType.history,
                        action: MessageSystemHistoryTypeAction.get,
                    };
                    const history = (getMessage([
                        getHistory,
                        "",
                    ])[0][0] as GetHistoryMessageOutgoing).history;
                    const lastItemIndex = history.items.length - 1;
                    const lastItem = history.items[lastItemIndex];

                    expect(lastItem.next.type).to.equal(MessageSystemType.data);
                    expect((lastItem.next as any).action).to.equal(
                        MessageSystemDataTypeAction.remove
                    );
                    expect((lastItem.next as any).dataLocation).to.equal("foo");
                    expect(lastItem.previous[0].type).to.equal(MessageSystemType.data);
                    expect((lastItem.previous[0] as any).action).to.equal(
                        MessageSystemDataTypeAction.add
                    );
                    expect((lastItem.previous[0] as any).dataLocation).to.equal("foo");
                    expect((lastItem.previous[0] as any).data).to.equal("bar");
                    expect((lastItem.previous[0] as any).dataType).to.equal(
                        DataType.string
                    );
                });
                it("should store a history item when data has been added", () => {
                    getMessage([
                        {
                            type: MessageSystemType.data,
                            action: MessageSystemDataTypeAction.add,
                            dataLocation: "bat",
                            data: 42,
                            dataType: DataType.number,
                        } as DataMessageIncoming,
                        "",
                    ]);

                    const getHistory: GetHistoryMessageIncoming = {
                        type: MessageSystemType.history,
                        action: MessageSystemHistoryTypeAction.get,
                    };
                    const history = (getMessage([
                        getHistory,
                        "",
                    ])[0][0] as GetHistoryMessageOutgoing).history;
                    const lastItemIndex = history.items.length - 1;
                    const lastItem = history.items[lastItemIndex];

                    expect(lastItem.next.type).to.equal(MessageSystemType.data);
                    expect((lastItem.next as any).action).to.equal(
                        MessageSystemDataTypeAction.add
                    );
                    expect((lastItem.next as any).dataLocation).to.equal("bat");
                    expect((lastItem.next as any).data).to.equal(42);
                    expect((lastItem.next as any).dataType).to.equal(DataType.number);
                    expect(lastItem.previous[0].type).to.equal(MessageSystemType.data);
                    expect((lastItem.previous[0] as any).action).to.equal(
                        MessageSystemDataTypeAction.remove
                    );
                    expect((lastItem.previous[0] as any).dataLocation).to.equal("bat");
                });
                it("should store a history item when data has been updated", () => {
                    getMessage([
                        {
                            type: MessageSystemType.data,
                            action: MessageSystemDataTypeAction.update,
                            dictionaryId: "data",
                            dataLocation: "foo",
                            data: "baz",
                        } as DataMessageIncoming,
                        "",
                    ]);

                    const getHistory: GetHistoryMessageIncoming = {
                        type: MessageSystemType.history,
                        action: MessageSystemHistoryTypeAction.get,
                    };
                    const history = (getMessage([
                        getHistory,
                        "",
                    ])[0][0] as GetHistoryMessageOutgoing).history;
                    const lastItemIndex = history.items.length - 1;
                    const lastItem = history.items[lastItemIndex];

                    expect(lastItem.next.type).to.equal(MessageSystemType.data);
                    expect((lastItem.next as any).action).to.equal(
                        MessageSystemDataTypeAction.update
                    );
                    expect((lastItem.next as any).dataLocation).to.equal("foo");
                    expect((lastItem.next as any).data).to.equal("baz");
                    expect((lastItem.next as any).dictionaryId).to.equal("data");
                    expect(lastItem.previous[0].type).to.equal(MessageSystemType.data);
                    expect((lastItem.previous[0] as any).action).to.equal(
                        MessageSystemDataTypeAction.update
                    );
                    expect((lastItem.previous[0] as any).dataLocation).to.equal("foo");
                    expect((lastItem.previous[0] as any).data).to.equal("bar");
                    expect((lastItem.previous[0] as any).dictionaryId).to.equal("data");
                });
                it("should store a history item when linked data has been added", () => {
                    getMessage([
                        {
                            type: MessageSystemType.data,
                            action: MessageSystemDataTypeAction.addLinkedData,
                            dictionaryId: "data",
                            index: 0,
                            dataLocation: "children",
                            linkedData: [
                                {
                                    schemaId: "foo",
                                    parent: {
                                        id: "data",
                                        dataLocation: "children",
                                    },
                                    data: {
                                        foo: "foo",
                                    },
                                    dataLocation: "children",
                                },
                            ],
                        } as DataMessageIncoming,
                        "",
                    ]);

                    const getHistory: GetHistoryMessageIncoming = {
                        type: MessageSystemType.history,
                        action: MessageSystemHistoryTypeAction.get,
                    };
                    const history = (getMessage([
                        getHistory,
                        "",
                    ])[0][0] as GetHistoryMessageOutgoing).history;
                    const lastItemIndex = history.items.length - 1;
                    const lastItem = history.items[lastItemIndex];

                    expect(lastItem.next.type).to.equal(MessageSystemType.data);
                    expect((lastItem.next as any).action).to.equal(
                        MessageSystemDataTypeAction.addLinkedData
                    );
                    expect((lastItem.next as any).dataLocation).to.equal("children");
                    expect((lastItem.next as any).linkedData).to.deep.equal([
                        {
                            schemaId: "foo",
                            parent: {
                                id: "data",
                                dataLocation: "children",
                            },
                            data: {
                                foo: "foo",
                            },
                            dataLocation: "children",
                        },
                    ]);
                    expect((lastItem.next as any).dictionaryId).to.equal("data");
                    expect(lastItem.previous[0].type).to.equal(MessageSystemType.data);
                    expect((lastItem.previous[0] as any).action).to.equal(
                        MessageSystemDataTypeAction.removeLinkedData
                    );
                    expect((lastItem.previous[0] as any).dataLocation).to.equal(
                        "children"
                    );
                    expect(Array.isArray((lastItem.previous[0] as any).linkedData)).to.be
                        .true;
                    expect((lastItem.previous[0] as any).dictionaryId).to.equal("data");
                });
                it("should store a history item when linked data has been removed", () => {
                    getMessage([
                        {
                            type: MessageSystemType.data,
                            action: MessageSystemDataTypeAction.removeLinkedData,
                            dictionaryId: "data",
                            index: 0,
                            dataLocation: "children",
                            linkedData: [
                                {
                                    id: "data2",
                                },
                            ],
                        } as DataMessageIncoming,
                        "",
                    ]);

                    const getHistory: GetHistoryMessageIncoming = {
                        type: MessageSystemType.history,
                        action: MessageSystemHistoryTypeAction.get,
                    };
                    const history = (getMessage([
                        getHistory,
                        "",
                    ])[0][0] as GetHistoryMessageOutgoing).history;
                    const lastItemIndex = history.items.length - 1;
                    const lastItem = history.items[lastItemIndex];

                    expect(lastItem.next.type).to.equal(MessageSystemType.data);
                    expect((lastItem.next as any).action).to.equal(
                        MessageSystemDataTypeAction.removeLinkedData
                    );
                    expect((lastItem.next as any).dataLocation).to.equal("children");
                    expect((lastItem.next as any).index).to.equal(0);
                    expect((lastItem.next as any).linkedData).to.deep.equal([
                        {
                            id: "data2",
                        },
                    ]);
                    expect((lastItem.next as any).dictionaryId).to.equal("data");
                    expect(lastItem.previous[0].type).to.equal(MessageSystemType.data);
                    expect((lastItem.previous[0] as any).action).to.equal(
                        MessageSystemDataTypeAction.addLinkedData
                    );
                    expect((lastItem.previous[0] as any).dataLocation).to.equal(
                        "children"
                    );
                    expect((lastItem.previous[0] as any).linkedData).to.deep.equal([
                        {
                            schemaId: "foo",
                            data: {},
                            parent: {
                                id: "data",
                                dataLocation: "children",
                            },
                        },
                    ]);
                    expect((lastItem.previous[0] as any).dictionaryId).to.equal("data");
                });
                it("should store a history item when linked has been reordered", () => {
                    getMessage([
                        {
                            type: MessageSystemType.data,
                            action: MessageSystemDataTypeAction.reorderLinkedData,
                            dataLocation: "children",
                            linkedData: [
                                {
                                    id: "data3",
                                },
                                {
                                    id: "data2",
                                },
                            ],
                        } as DataMessageIncoming,
                        "",
                    ]);

                    const getHistory: GetHistoryMessageIncoming = {
                        type: MessageSystemType.history,
                        action: MessageSystemHistoryTypeAction.get,
                    };
                    const history = (getMessage([
                        getHistory,
                        "",
                    ])[0][0] as GetHistoryMessageOutgoing).history;
                    const lastItemIndex = history.items.length - 1;
                    const lastItem = history.items[lastItemIndex];

                    expect(lastItem.next.type).to.equal(MessageSystemType.data);
                    expect((lastItem.next as any).action).to.equal(
                        MessageSystemDataTypeAction.reorderLinkedData
                    );
                    expect((lastItem.next as any).dataLocation).to.equal("children");
                    expect((lastItem.next as any).linkedData).to.deep.equal([
                        {
                            id: "data3",
                        },
                        {
                            id: "data2",
                        },
                    ]);
                    expect(lastItem.previous[0].type).to.equal(MessageSystemType.data);
                    expect((lastItem.previous[0] as any).action).to.equal(
                        MessageSystemDataTypeAction.reorderLinkedData
                    );
                    expect((lastItem.previous[0] as any).dataLocation).to.equal(
                        "children"
                    );
                    expect((lastItem.previous[0] as any).linkedData).to.deep.equal([
                        {
                            id: "data2",
                        },
                        {
                            id: "data3",
                        },
                    ]);
                });
            });
        });
    });
    describe("initialize", () => {
        it("should return messages sent with initial values provided", () => {
            const dataBlob: DataDictionary<unknown> = [
                {
                    data: {
                        schemaId: "foo",
                        data: {
                            foo: "bar",
                        },
                    },
                },
                "data",
            ];
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };
            const message: InternalOutgoingMessage<InitializeMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.initialize,
                        dataDictionary: dataBlob,
                        schemaDictionary,
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<InitializeMessageOutgoing>;
            expect(message[0].type).to.equal(MessageSystemType.initialize);
            expect(message[0].data).to.equal(dataBlob[0][dataBlob[1]].data);
            expect(message[0].schema).to.equal(schemaDictionary["foo"]);
            expect(typeof message[0].navigation).to.equal("object");
        });
        it("should return messages sent with initial values provided using the deprecated data property", () => {
            const dataBlob: DataDictionary<unknown> = [
                {
                    data: {
                        schemaId: "foo",
                        data: {
                            foo: "bar",
                        },
                    },
                },
                "data",
            ];
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };
            const message: InternalOutgoingMessage<InitializeMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.initialize,
                        dataDictionary: dataBlob,
                        schemaDictionary,
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<InitializeMessageOutgoing>;

            expect(message[0].type).to.equal(MessageSystemType.initialize);
            expect(message[0].data).to.equal(dataBlob[0][dataBlob[1]].data);
            expect(message[0].schema).to.equal(schemaDictionary["foo"]);
            expect(typeof message[0].navigation).to.equal("object");
        });
        it("should return messages sent with a dictionary id provided", () => {
            const dataBlob: DataDictionary<unknown> = [
                {
                    data: {
                        schemaId: "foo",
                        data: {
                            foo: "bar",
                        },
                    },
                    data2: {
                        schemaId: "foo",
                        data: {
                            foo: "bar",
                        },
                    },
                },
                "data",
            ];
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };
            const message: InternalOutgoingMessage<InitializeMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.initialize,
                        dataDictionary: dataBlob,
                        schemaDictionary,
                        dictionaryId: "data2",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<InitializeMessageOutgoing>;

            expect(message[0].type).to.equal(MessageSystemType.initialize);
            expect(message[0].activeDictionaryId).to.equal("data2");
        });
    });
    describe("data", () => {
        it("should return a data blob with duplicated values", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    foo: "bar",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const message: InternalOutgoingMessage<DuplicateDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.duplicate,
                        sourceDataLocation: "foo",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<DuplicateDataMessageOutgoing>;

            expect(message[0].data).to.deep.equal({ foo: ["bar", "bar"] });
        });
        it("should return a data blob without removed values", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    foo: "bar",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const message: InternalOutgoingMessage<RemoveDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.remove,
                        dataLocation: "foo",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<RemoveDataMessageOutgoing>;

            expect(message[0].data).to.deep.equal({});
        });
        it("should return a data blob without removed values from a specified dictionary ID", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    foo: "bar",
                                },
                            },
                            data2: {
                                schemaId: "foo",
                                data: {
                                    foo: "bar2",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const message: InternalOutgoingMessage<RemoveDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.remove,
                        dataLocation: "foo",
                        dictionaryId: "data2",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<RemoveDataMessageOutgoing>;

            expect(message[0].data).to.deep.equal({});
            expect(message[0].activeDictionaryId).to.equal("data");
            expect(message[0].dataDictionary[0].data2.data).to.deep.equal({});
            expect(message[0].dataDictionary[0].data.data).to.deep.equal({ foo: "bar" });
        });
        it("should return a data blob without removed string values", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: "foo",
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const message: InternalOutgoingMessage<RemoveDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.remove,
                        dataLocation: "",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<RemoveDataMessageOutgoing>;

            expect(message[0].data).to.equal(undefined);
        });
        it("should return a data blob with added values", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {},
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const message: InternalOutgoingMessage<AddDataMessageOutgoing> = getMessage([
                {
                    type: MessageSystemType.data,
                    action: MessageSystemDataTypeAction.add,
                    dataLocation: "hello",
                    data: "world",
                    dataType: DataType.object,
                },
                "",
            ])[0] as InternalOutgoingMessage<AddDataMessageOutgoing>;

            expect(message[0].data).to.deep.equal({ hello: "world" });
        });
        it("should return a data blob with updated values", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {},
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const message: InternalOutgoingMessage<UpdateDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.update,
                        dataLocation: "hello",
                        data: "venus",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<UpdateDataMessageOutgoing>;

            expect(message[0].data).to.deep.equal({ hello: "venus" });
        });
        it("should return a data blob with updated values when the data is at the root", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {},
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const message: InternalOutgoingMessage<UpdateDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.update,
                        dataLocation: "",
                        data: { hello: "venus" },
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<UpdateDataMessageOutgoing>;

            expect(message[0].data).to.deep.equal({ hello: "venus" });
            expect(message[0].dictionaryId).to.equal("data");
        });
        it("should return a data blob with updated values when a dictionaryId has been specified", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            foo: {
                                schemaId: "foo",
                                data: {},
                            },
                            bar: {
                                schemaId: "foo",
                                data: {},
                            },
                        },
                        "foo",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const message: InternalOutgoingMessage<UpdateDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.update,
                        dictionaryId: "bar",
                        dataLocation: "",
                        data: { hello: "venus" },
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<UpdateDataMessageOutgoing>;

            expect(message[0].data).to.deep.equal({ hello: "venus" });
            expect(message[0].dictionaryId).to.equal("bar");
            expect(message[0].dataDictionary).to.deep.equal([
                {
                    foo: {
                        schemaId: "foo",
                        data: {},
                    },
                    bar: {
                        schemaId: "foo",
                        data: {
                            hello: "venus",
                        },
                    },
                },
                "foo",
            ]);
        });
        it("should add linkedData to the data and the data dictionary", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {},
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const linkedData: Data<unknown>[] = [
                {
                    schemaId: "foo",
                    data: {
                        hello: "world",
                    },
                    dataLocation: "linkedData",
                },
            ];
            const message: InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.addLinkedData,
                        linkedData,
                        dataLocation: "linkedData",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing>;

            expect(Array.isArray((message[0].data as any).linkedData)).to.equal(true);
            expect((message[0].data as any).linkedData.length).to.equal(1);

            const id: string = (message[0].data as any).linkedData[0].id;

            expect(
                Object.keys(message[0].dataDictionary[0]).findIndex(
                    (dictionaryKey: string) => {
                        return dictionaryKey === id;
                    }
                )
            ).not.to.equal(-1);
            expect(message[0].dataDictionary[0][id].data).to.deep.equal(
                linkedData[0].data
            );
            expect(message[0].linkedDataIds).to.deep.equal([{ id }]);
        });
        it("should add linkedData to the data and the data dictionary when specifying a dictionary ID", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {},
                            },
                            abc: {
                                schemaId: "foo",
                                data: {},
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const linkedData: Data<unknown>[] = [
                {
                    schemaId: "foo",
                    data: {
                        hello: "world",
                    },
                    dataLocation: "linkedData",
                },
            ];
            const message: InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.addLinkedData,
                        dictionaryId: "abc",
                        linkedData,
                        dataLocation: "linkedData",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing>;

            expect(
                Array.isArray((message[0].dataDictionary[0].abc.data as any).linkedData)
            ).to.equal(true);
            expect(
                (message[0].dataDictionary[0].abc.data as any).linkedData.length
            ).to.equal(1);

            const id: string = (message[0].dataDictionary[0].abc.data as any)
                .linkedData[0].id;

            expect(
                Object.keys(message[0].dataDictionary[0]).findIndex(
                    (dictionaryKey: string) => {
                        return dictionaryKey === id;
                    }
                )
            ).not.to.equal(-1);
            expect(message[0].dataDictionary[0][id].data).to.deep.equal(
                linkedData[0].data
            );
            expect(
                (message[0].dataDictionary[0].abc.data as any).linkedData
            ).to.deep.equal([{ id }]);
        });
        it("should add linkedData to an existing array of linkedData items", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    linkedData: [
                                        {
                                            id: "foo",
                                        },
                                    ],
                                },
                            },
                            foo: {
                                schemaId: "foo",
                                data: {
                                    test: "hello world",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const linkedData: Data<unknown>[] = [
                {
                    schemaId: "foo",
                    data: {
                        hello: "world",
                    },
                    dataLocation: "linkedData",
                },
            ];
            const message: InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.addLinkedData,
                        linkedData,
                        dataLocation: "linkedData",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing>;

            expect(Array.isArray((message[0].data as any).linkedData)).to.equal(true);
            expect((message[0].data as any).linkedData.length).to.equal(2);

            const id: string = (message[0].data as any).linkedData[1].id;

            expect(
                Object.keys(message[0].dataDictionary[0]).findIndex(
                    (dictionaryKey: string) => {
                        return dictionaryKey === id;
                    }
                )
            ).not.to.equal(-1);
            expect(message[0].dataDictionary[0][id].data).to.deep.equal(
                linkedData[0].data
            );
        });
        it("should add linkedData to a specific index of an existing array of linkedData items", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    linkedData: [
                                        {
                                            id: "foo",
                                        },
                                    ],
                                },
                            },
                            foo: {
                                schemaId: "foo",
                                data: {
                                    test: "hello world",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const linkedData: Data<unknown>[] = [
                {
                    schemaId: "foo",
                    data: {
                        hello: "world",
                    },
                },
            ];
            const message: InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.addLinkedData,
                        linkedData,
                        dataLocation: "linkedData",
                        index: 0,
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing>;

            expect(Array.isArray((message[0].data as any).linkedData)).to.equal(true);
            expect((message[0].data as any).linkedData.length).to.equal(2);

            const id: string = (message[0].data as any).linkedData[0].id;

            expect(
                Object.keys(message[0].dataDictionary[0]).findIndex(
                    (dictionaryKey: string) => {
                        return dictionaryKey === id;
                    }
                )
            ).not.to.equal(-1);
            expect(message[0].dataDictionary[0][id].data).to.deep.equal(
                linkedData[0].data
            );
        });
        it("should add nested linked data to the data dictionary", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {},
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const linkedData: Data<unknown>[] = [
                {
                    schemaId: "foo",
                    data: {
                        hello: "world",
                    },
                    dataLocation: "linkedData",
                    linkedData: [
                        {
                            schemaId: "foo",
                            data: {
                                hello: "pluto",
                            },
                        },
                    ],
                },
            ];
            const message: InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.addLinkedData,
                        linkedData,
                        dataLocation: "linkedData",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing>;

            expect(Array.isArray((message[0].data as any).linkedData)).to.equal(true);
            expect((message[0].data as any).linkedData.length).to.equal(1);

            const id: string = (message[0].data as any).linkedData[0].id;
            const nestedId: string = (message[0].dataDictionary[0][id].data as any)
                .linkedData[0].id;

            expect(
                Object.keys(message[0].dataDictionary[0]).findIndex(
                    (dictionaryKey: string) => {
                        return dictionaryKey === id;
                    }
                )
            ).not.to.equal(-1);
            expect(message[0].linkedDataIds).to.deep.equal([{ id: nestedId }, { id }]);
        });
        it("should remove linkedData from the data and the data dictionary", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    linkedData: [
                                        {
                                            id: "data2",
                                        },
                                    ],
                                },
                            },
                            data2: {
                                schemaId: "foo",
                                data: {
                                    hello: "world",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const linkedData: LinkedData[] = [
                {
                    id: "data2",
                },
            ];
            const message: InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.removeLinkedData,
                        linkedData,
                        dataLocation: "linkedData",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing>;

            expect((message[0].data as any).linkedData).to.deep.equal([]);
        });
        it("should remove linkedData from the data and the data dictionary when specifying a dictionary ID", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data1: {
                                schemaId: "foo",
                                data: {
                                    hello: "world",
                                },
                            },
                            data: {
                                schemaId: "foo",
                                data: {
                                    linkedData: [
                                        {
                                            id: "data2",
                                        },
                                    ],
                                },
                            },
                            data2: {
                                schemaId: "foo",
                                data: {
                                    hello: "world",
                                },
                            },
                        },
                        "data1",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const linkedData: LinkedData[] = [
                {
                    id: "data2",
                },
            ];
            const message: InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.removeLinkedData,
                        linkedData,
                        dictionaryId: "data",
                        dataLocation: "linkedData",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing>;

            expect(
                (message[0].dataDictionary[0].data.data as any).linkedData
            ).to.deep.equal([]);
        });
        it("should remove linkedData and linked data items from the data and the data dictionary", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    linkedData: [
                                        {
                                            id: "data2",
                                        },
                                    ],
                                },
                            },
                            data2: {
                                parent: {
                                    dataLocation: "linkedData",
                                    id: "data",
                                },
                                schemaId: "foo",
                                data: {
                                    hello: "world",
                                    linkedData: [
                                        {
                                            id: "data3",
                                        },
                                    ],
                                },
                            },
                            data3: {
                                parent: {
                                    dataLocation: "linkedData",
                                    id: "data2",
                                },
                                schemaId: "foo",
                                data: {
                                    foo: "bar",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: {
                            id: "foo",
                            type: "object",
                            properties: {
                                linkedData: linkedDataSchema,
                            },
                        },
                    },
                },
                "",
            ]);
            const linkedData: LinkedData[] = [
                {
                    id: "data2",
                },
            ];
            const message: InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.removeLinkedData,
                        linkedData,
                        dataLocation: "linkedData",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing>;

            expect((message[0].data as any).linkedData).to.deep.equal([]);
            expect(message[0].dataDictionary).to.deep.equal([
                {
                    data: {
                        schemaId: "foo",
                        data: {
                            linkedData: [],
                        },
                    },
                },
                "data",
            ]);
            expect(message[0].linkedDataIds).to.deep.equal(["data2", "data3"]);
        });
        it("should remove the active dictionary ID as linked data if linked data is not supplied and if the active dictionary ID is not the root dictionary ID", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    dictionaryId: "data2",
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    linkedData: [
                                        {
                                            id: "data2",
                                        },
                                    ],
                                },
                            },
                            data2: {
                                parent: {
                                    dataLocation: "linkedData",
                                    id: "data",
                                },
                                schemaId: "foo",
                                data: {
                                    hello: "world",
                                    linkedData: [
                                        {
                                            id: "data3",
                                        },
                                    ],
                                },
                            },
                            data3: {
                                parent: {
                                    dataLocation: "linkedData",
                                    id: "data2",
                                },
                                schemaId: "foo",
                                data: {
                                    foo: "bar",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: {
                            id: "foo",
                            type: "object",
                            properties: {
                                linkedData: linkedDataSchema,
                            },
                        },
                    },
                },
                "",
            ]);
            const message: InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.removeLinkedData,
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing>;

            expect((message[0].data as any).linkedData).to.deep.equal([]);
            expect(message[0].dataDictionary).to.deep.equal([
                {
                    data: {
                        schemaId: "foo",
                        data: {
                            linkedData: [],
                        },
                    },
                },
                "data",
            ]);
            expect(message[0].linkedDataIds).to.deep.equal(["data2", "data3"]);
        });
        it("should send an error if the active dictionary ID is the root dictionary ID, linked data has not been supplied, and a different dictionary ID has not been specified", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    linkedData: [
                                        {
                                            id: "data2",
                                        },
                                    ],
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: {
                            id: "foo",
                            type: "object",
                            properties: {
                                linkedData: linkedDataSchema,
                            },
                        },
                    },
                },
                "",
            ]);
            const message: InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.removeLinkedData,
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing>;

            expect(message[0].type).to.equal(MessageSystemType.error);
            expect((message[0] as any).message).to.equal(removeRootDataNodeErrorMessage);
        });
        it("should reorder linkedData in the exist array of linkedData items", () => {
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: [
                        {
                            data: {
                                schemaId: "foo",
                                data: {
                                    linkedData: [
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
                                schemaId: "foo",
                                data: {
                                    test: "hello world",
                                },
                            },
                            bar: {
                                schemaId: "foo",
                                data: {
                                    test: "hello world",
                                },
                            },
                        },
                        "data",
                    ],
                    schemaDictionary: {
                        foo: { id: "foo" },
                    },
                },
                "",
            ]);
            const linkedData: LinkedData[] = [
                {
                    id: "bar",
                },
                {
                    id: "foo",
                },
            ];
            const message: InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.data,
                        action: MessageSystemDataTypeAction.reorderLinkedData,
                        linkedData,
                        dataLocation: "linkedData",
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<AddLinkedDataDataMessageOutgoing>;

            expect(Array.isArray((message[0].data as any).linkedData)).to.equal(true);
            expect((message[0].data as any).linkedData.length).to.equal(2);
            expect((message[0].data as any).linkedData[0].id).to.equal("bar");
            expect((message[0].data as any).linkedData[1].id).to.equal("foo");
        });
    });
    describe("navigation", () => {
        it("should return messages sent with navigation updates", () => {
            const dictionaryId: string = "foo";
            const navigationConfigId: string = "";
            const message: InternalOutgoingMessage<NavigationMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.navigation,
                        action: MessageSystemNavigationTypeAction.update,
                        activeDictionaryId: dictionaryId,
                        activeNavigationConfigId: navigationConfigId,
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<NavigationMessageOutgoing>;

            expect(message[0].type).to.equal(MessageSystemType.navigation);
            expect(message[0].action).to.equal(MessageSystemNavigationTypeAction.update);
            expect(message[0].activeDictionaryId).to.equal(dictionaryId);
            expect(message[0].activeNavigationConfigId).to.equal(navigationConfigId);
        });
        it("should return messages sent with navigation getter", () => {
            const dictionaryId: string = "data";
            const navigationConfigId: string = "";

            const dataBlob: DataDictionary<unknown> = [
                {
                    data: {
                        schemaId: "foo",
                        data: {
                            foo: "bar",
                        },
                    },
                },
                "data",
            ];
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: dataBlob,
                    schemaDictionary,
                },
                "",
            ]);
            const message: InternalOutgoingMessage<GetNavigationMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.navigation,
                        action: MessageSystemNavigationTypeAction.get,
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<GetNavigationMessageOutgoing>;

            expect(message[0].type).to.equal(MessageSystemType.navigation);
            expect(message[0].action).to.equal(MessageSystemNavigationTypeAction.get);
            expect(message[0].activeDictionaryId).to.equal(dictionaryId);
            expect(message[0].activeNavigationConfigId).to.equal(navigationConfigId);

            const navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataBlob
            );

            expect(message[0].navigation).to.deep.equal(
                navigationDictionary[0][message[0].activeDictionaryId]
            );
        });
    });
    describe("schemaDictionary", () => {
        it("should add schemas to the schema dictionary", () => {
            const dataBlob: DataDictionary<unknown> = [
                {
                    data: {
                        schemaId: "foo",
                        data: {
                            foo: "bar",
                        },
                    },
                },
                "data",
            ];
            const schemaDictionary: SchemaDictionary = {
                foo: { $id: "foo" },
            };
            getMessage([
                {
                    type: MessageSystemType.initialize,
                    data: dataBlob,
                    schemaDictionary,
                },
                "",
            ]);

            const addedSchemaDictionary: InternalOutgoingMessage<AddSchemaDictionaryMessageOutgoing> = getMessage(
                [
                    {
                        type: MessageSystemType.schemaDictionary,
                        action: MessageSystemSchemaDictionaryTypeAction.add,
                        schemas: [
                            {
                                $id: "bar",
                                type: "string",
                            },
                        ],
                    },
                    "",
                ]
            )[0] as InternalOutgoingMessage<AddSchemaDictionaryMessageOutgoing>;

            expect(addedSchemaDictionary[0].type).to.equal(
                MessageSystemType.schemaDictionary
            );
            expect(addedSchemaDictionary[0].action).to.equal(
                MessageSystemSchemaDictionaryTypeAction.add
            );
            expect(addedSchemaDictionary[0].schemaDictionary.bar).not.to.be.undefined;
            expect(addedSchemaDictionary[0].schemaDictionary.foo).not.to.be.undefined;
        });
    });
    describe("validation", () => {
        it("should return messages sent to update the validation", () => {
            const validationUpdate: InternalIncomingMessage<ValidationMessageIncoming> = [
                {
                    type: MessageSystemType.validation,
                    action: MessageSystemValidationTypeAction.update,
                    validationErrors: [
                        {
                            invalidMessage: "foo",
                            dataLocation: "",
                        },
                    ],
                    dictionaryId: "foo",
                },
                "",
            ];
            const message = getMessage(validationUpdate)[0] as InternalOutgoingMessage<
                ValidationMessageOutgoing
            >;

            expect(message[0].type).to.equal(validationUpdate[0].type);
            expect(message[0].action).to.equal(validationUpdate[0].action);
            expect(message[0].validationErrors).to.deep.equal(
                (validationUpdate[0] as ValidationMessageOutgoing).validationErrors
            );
            expect(message[0].dictionaryId).to.equal(validationUpdate[0].dictionaryId);
        });
        it("should return messages sent to get the validation", () => {
            const getValidation: InternalIncomingMessage<ValidationMessageIncoming> = [
                {
                    type: MessageSystemType.validation,
                    action: MessageSystemValidationTypeAction.get,
                    dictionaryId: "bar",
                },
                "",
            ];

            const validationUpdate: InternalIncomingMessage<UpdateValidationMessageIncoming> = [
                {
                    type: MessageSystemType.validation,
                    action: MessageSystemValidationTypeAction.update,
                    validationErrors: [
                        {
                            invalidMessage: "bar",
                            dataLocation: "",
                        },
                    ],
                    dictionaryId: "bar",
                },
                "",
            ];

            getMessage(getValidation);

            const message = getMessage(validationUpdate)[0] as InternalOutgoingMessage<
                ValidationMessageOutgoing
            >;

            expect(message[0].type).to.equal(getValidation[0].type);
            expect(message[0].action).to.equal(validationUpdate[0].action);
            expect(message[0].validationErrors).to.deep.equal(
                validationUpdate[0].validationErrors
            );
            expect(message[0].dictionaryId).to.equal(getValidation[0].dictionaryId);
        });
        it("should return custom messages sent", () => {
            const customMessage: any = [
                {
                    type: MessageSystemType.custom,
                    foo: "bar",
                },
                "",
            ];

            expect(getMessage(customMessage)).to.deep.equal([customMessage]);
        });
    });
});
