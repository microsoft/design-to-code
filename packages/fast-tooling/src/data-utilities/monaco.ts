/**
 * These utilities are meant to facilitate the use of
 * the monaco editor https://github.com/Microsoft/monaco-editor
 * with FAST tooling
 */

import { get } from "lodash-es";
import { IPosition } from "monaco-editor";
import { Node, parse } from "vscode-html-languageservice/lib/esm/parser/htmlParser.js";
import {
    Data,
    DataDictionary,
    LinkedData,
    SchemaDictionary,
} from "../message-system/index.js";
import { dictionaryLink } from "../schemas/index.js";
import { DataType, ReservedElementMappingKeyword } from "./types.js";
import { Delimiter, voidElements } from "./html-element.js";

const whiteSpace = " ";
const newline = "\n";
const doubleQuote = '"';

function getLinkedDataDataLocations(
    dictionaryId: string,
    dataDictionary: DataDictionary<unknown>
): string[] {
    // get all linked data data locations for a dictionary id
    const allLinkedDataDictionaryIds = Object.entries(dataDictionary[0])
        .filter(([, dictionaryItem]: [string, Data<any>]) => {
            return get(dictionaryItem, "parent.id") === dictionaryId;
        })
        .map((dictionaryItem: [string, Data<any>]) => {
            return dictionaryItem[0];
        });

    // identify and group all items by slot name
    // e.g. { Slot: ["id1", "id2", "id3"], SlotFoo: ["id5", "id4"] }
    const dictionaryOfLinkedDataIdsBySlotName: { [key: string]: string[] } = {};

    for (let i = 0, length = allLinkedDataDictionaryIds.length; i < length; i++) {
        const linkedDataSlotName =
            dataDictionary[0][allLinkedDataDictionaryIds[i]].parent.dataLocation;
        const slottedIndex = dataDictionary[0][dictionaryId].data[linkedDataSlotName]
            .map(item => {
                return item.id;
            })
            .indexOf(allLinkedDataDictionaryIds[i]);

        if (!dictionaryOfLinkedDataIdsBySlotName[linkedDataSlotName]) {
            dictionaryOfLinkedDataIdsBySlotName[linkedDataSlotName] = [];
        }

        dictionaryOfLinkedDataIdsBySlotName[linkedDataSlotName][slottedIndex] =
            allLinkedDataDictionaryIds[i];
    }

    // flatten the object structure with string arrays into a single string array
    return Object.values(dictionaryOfLinkedDataIdsBySlotName).reduce((prev, curr) => {
        return prev.concat(curr);
    }, []);
}

function mapDataDictionaryItemToMonacoEditorHTMLLine(
    dictionaryId: string,
    data: Data<any>,
    dataDictionary: DataDictionary<unknown>,
    schema: any,
    schemaDictionary: SchemaDictionary,
    lines: string[] = []
): string[] {
    if (schema) {
        if (schema.type === "string") {
            lines.push(data.data);
        } else if (
            typeof schema[ReservedElementMappingKeyword.mapsToTagName] === "string"
        ) {
            const attributes: string[] = Object.entries(data.data)
                .filter(([, dataValue]: [string, any]) => {
                    return (
                        typeof dataValue !== "object" &&
                        !Array.isArray(dataValue) &&
                        dataValue !== false
                    );
                })
                .map((value: [string, any]) => {
                    return typeof value[1] === "string"
                        ? `${value[0]}${Delimiter.assign}${doubleQuote}${value[1]}${doubleQuote}`
                        : typeof value[1] === "boolean"
                        ? value[0]
                        : `${value[0]}${Delimiter.assign}${doubleQuote}${JSON.stringify(
                              value[1]
                          )}${doubleQuote}`;
                });

            if (
                dataDictionary[0][dictionaryId].parent &&
                schemaDictionary[
                    dataDictionary[0][dataDictionary[0][dictionaryId].parent.id].schemaId
                ].properties &&
                schemaDictionary[
                    dataDictionary[0][dataDictionary[0][dictionaryId].parent.id].schemaId
                ].properties[dataDictionary[0][dictionaryId].parent.dataLocation][
                    ReservedElementMappingKeyword.mapsToSlot
                ] !== ""
            ) {
                attributes.push(
                    `slot${Delimiter.assign}${doubleQuote}${
                        schemaDictionary[
                            dataDictionary[0][dataDictionary[0][dictionaryId].parent.id]
                                .schemaId
                        ].properties[dataDictionary[0][dictionaryId].parent.dataLocation][
                            ReservedElementMappingKeyword.mapsToSlot
                        ]
                    }${doubleQuote}`
                );
            }

            if (
                voidElements.includes(schema[ReservedElementMappingKeyword.mapsToTagName])
            ) {
                lines.push(
                    `${Delimiter.startTagOpen}${
                        schema[ReservedElementMappingKeyword.mapsToTagName]
                    }${attributes.length > 0 ? whiteSpace : ""}${attributes.join(
                        whiteSpace
                    )}${whiteSpace}${Delimiter.startTagSelfClose}`
                );
            } else {
                const linkedDataDataLocations = getLinkedDataDataLocations(
                    dictionaryId,
                    dataDictionary
                );
                let content: string[] = [];
                if (linkedDataDataLocations.length > 0) {
                    content = linkedDataDataLocations.map(
                        (linkedDataDataLocation: string) => {
                            return mapDataDictionaryItemToMonacoEditorHTMLLine(
                                linkedDataDataLocation,
                                dataDictionary[0][linkedDataDataLocation],
                                dataDictionary,
                                schemaDictionary[
                                    dataDictionary[0][linkedDataDataLocation].schemaId
                                ],
                                schemaDictionary
                            ).join(newline);
                        }
                    );
                }

                lines.push(
                    `${Delimiter.startTagOpen}${
                        schema[ReservedElementMappingKeyword.mapsToTagName]
                    }${attributes.length > 0 ? whiteSpace : ""}${attributes.join(
                        whiteSpace
                    )}${Delimiter.startTagClose}${content.join("")}${
                        Delimiter.endTagOpen
                    }${schema[ReservedElementMappingKeyword.mapsToTagName]}${
                        Delimiter.endTagClose
                    }`
                );
            }
        }
    }

    return lines;
}

export function mapDataDictionaryToMonacoEditorHTML(
    dataDictionary: DataDictionary<unknown>,
    schemaDictionary: SchemaDictionary
): string {
    return mapDataDictionaryItemToMonacoEditorHTMLLine(
        dataDictionary[1],
        dataDictionary[0][dataDictionary[1]],
        dataDictionary,
        schemaDictionary[dataDictionary[0][dataDictionary[1]].schemaId],
        schemaDictionary
    ).join(newline);
}

/**
 * Find all linked data for a single data item, assuming it is an object and
 * ignore all text children since the parse does not include text nodes only
 * elements.
 */
function findAllNonTextLinkedDataInData(
    schema: any,
    data: any,
    schemaDictionary: SchemaDictionary,
    dataDictionaryItems: { [key: string]: Data<unknown> }
): LinkedData[] {
    const linkedData: LinkedData[] = [];

    Object.keys(schema.properties).map((propertyName: string) => {
        if (
            schema.properties[propertyName][dictionaryLink] &&
            Array.isArray(data[propertyName])
        ) {
            linkedData.push(
                ...data[propertyName].filter((linkedData: LinkedData) => {
                    return (
                        schemaDictionary[dataDictionaryItems[linkedData.id].schemaId]
                            .type === DataType.object
                    );
                })
            );
        }
    });

    return linkedData;
}

interface StartAndEndPosition {
    start: IPosition;
    end: IPosition;
}

interface Position extends StartAndEndPosition {
    matchTargetDictionaryId: boolean;
}

/**
 * This function returns a position for each child Node.
 */
function getPositionFromParsedChildren(
    parsedValue: Node,
    dataDictionary: DataDictionary<unknown>,
    schemaDictionary: SchemaDictionary,
    monacoEditorLineNumberLengths: number[],
    lineNumberLength: number,
    targetDictionaryId: string,
    column: number,
    lineNumber: number,
    childrenOfCurrentDictionaryId: LinkedData[]
): Position {
    // The position to be used may be updated during the following loop for any children found
    // to account for adjacent children
    let previousChildEnd: IPosition = {
        lineNumber,
        column,
    };
    let newPosition: Position;

    // Go through the parsed values children attempting to match them to
    // the data dictionary children
    for (
        let childIndex = 0, childIndexLength = parsedValue.children?.length || 0;
        childIndex < childIndexLength;
        childIndex++
    ) {
        // for each parsed value, check that item for data dictionary child items that match
        /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
        newPosition = findMonacoEditorPositionOfTheDictionaryId(
            parsedValue.children[childIndex],
            dataDictionary,
            schemaDictionary,
            monacoEditorLineNumberLengths,
            lineNumberLength,
            previousChildEnd.column,
            previousChildEnd.lineNumber,
            childrenOfCurrentDictionaryId[childIndex].id,
            targetDictionaryId
        );

        if (newPosition?.matchTargetDictionaryId === false) {
            previousChildEnd = {
                column: newPosition.end.column,
                lineNumber: newPosition.end.lineNumber,
            };
        } else if (newPosition?.matchTargetDictionaryId) {
            return newPosition;
        }
    }
}

/**
 * This function takes an array of numbers representing the columns of each line number,
 * based off this and the parsed value start (or beginning of the node), the column and line number
 * will be returned.
 *
 * @param monacoEditorLineNumberLengths - example [10, 20, 23]
 * @param lineNumberLength - example 3 (see above)
 * @param parsedValueStart - example 21
 * @returns IPosition - example { column: 1, lineNumber: 2 }
 */
function getPositionFromSingleLine(
    monacoEditorLineNumberLengths: number[],
    lineNumberLength: number, // total lines
    parsedValueStart: number // the start location if the HTML was on a single line
): IPosition {
    let totalColumns = 0; // the total number of columns so far

    // go through each line
    for (let lineNumber = 1; lineNumber < lineNumberLength; lineNumber++) {
        const remainingColumns = parsedValueStart - totalColumns;
        const monacoEditorIndex = lineNumber - 1;

        // check to see if the parsedValueStart exists on this line number
        if (
            remainingColumns < monacoEditorLineNumberLengths[monacoEditorIndex] &&
            remainingColumns + monacoEditorLineNumberLengths[monacoEditorIndex] >
                monacoEditorLineNumberLengths[monacoEditorIndex] + 1
        ) {
            return {
                lineNumber,
                column: remainingColumns + 2,
            };
        }

        totalColumns += monacoEditorLineNumberLengths[monacoEditorIndex];
    }

    return {
        lineNumber: 1,
        column: 1,
    };
}

function findMonacoEditorPositionOfTheDictionaryId(
    parsedValue: Node,
    dataDictionary: DataDictionary<unknown>,
    schemaDictionary: SchemaDictionary,
    monacoEditorLineNumberLengths: number[],
    lineNumberLength: number,
    currentColumn: number,
    currentLineNumber: number,
    currentDictionaryId: string,
    targetDictionaryId: string
): Position {
    const parsedValueTag = parsedValue.tag;
    const startAndEndPositionOfDictionaryId: StartAndEndPosition = {
        start: getPositionFromSingleLine(
            monacoEditorLineNumberLengths,
            lineNumberLength,
            parsedValue.start
        ),
        end: getPositionFromSingleLine(
            monacoEditorLineNumberLengths,
            lineNumberLength,
            parsedValue.end
        ),
    };

    // From the current dictionary ID, determine where it is in the Monaco Editors value
    // starting from the current column and line number
    for (
        let lineNumber = currentLineNumber;
        lineNumber < lineNumberLength;
        lineNumber++
    ) {
        for (
            let column = currentLineNumber === lineNumber ? currentColumn : 1,
                columnLength = monacoEditorLineNumberLengths[lineNumber];
            column < columnLength;
            column++
        ) {
            // match the node to the parsedValue tag
            if (
                schemaDictionary[dataDictionary[0][currentDictionaryId].schemaId][
                    ReservedElementMappingKeyword.mapsToTagName
                ] === parsedValueTag
            ) {
                // This is the current target dictionary id
                if (targetDictionaryId === currentDictionaryId) {
                    return {
                        matchTargetDictionaryId: true,
                        ...startAndEndPositionOfDictionaryId,
                    };
                    // This node has children to be parsed
                } else if (parsedValue?.children) {
                    // the children of this current dictionary item, without text children
                    // which the parsed value ignores
                    const childrenOfCurrentDictionaryId: LinkedData[] = findAllNonTextLinkedDataInData(
                        schemaDictionary[dataDictionary[0][currentDictionaryId].schemaId],
                        dataDictionary[0][currentDictionaryId].data,
                        schemaDictionary,
                        dataDictionary[0]
                    );

                    return getPositionFromParsedChildren(
                        parsedValue,
                        dataDictionary,
                        schemaDictionary,
                        monacoEditorLineNumberLengths,
                        lineNumberLength,
                        targetDictionaryId,
                        startAndEndPositionOfDictionaryId.start.column + 1,
                        startAndEndPositionOfDictionaryId.start.lineNumber,
                        childrenOfCurrentDictionaryId
                    );
                    // This is an unmatched end node
                } else {
                    return {
                        matchTargetDictionaryId: false,
                        ...startAndEndPositionOfDictionaryId,
                    };
                }
            }
        }
    }

    return {
        matchTargetDictionaryId: false,
        ...startAndEndPositionOfDictionaryId,
    };
}

/**
 * Find a Monaco Editor position from a provided dictionary ID
 *
 * @alpha
 */
export function findMonacoEditorHTMLPositionByDictionaryId(
    dictionaryId: string,
    dataDictionary: DataDictionary<unknown>,
    schemaDictionary: SchemaDictionary,
    monacoEditorValue: string[]
): IPosition {
    // The below numbered array represents the monaco editor column and line numbers.
    // The parsed value will be relied on for traversing the Nodes, which only uses a single line,
    // this numbered array will be used to re-interpret the line number and columns for the position.
    const monacoEditorLineNumberLengths: number[] = monacoEditorValue.map(
        (monacoEditorLine: string) => {
            return monacoEditorLine.length;
        }
    );
    const position = findMonacoEditorPositionOfTheDictionaryId(
        parse(monacoEditorValue.join("")).roots[0],
        dataDictionary,
        schemaDictionary,
        monacoEditorLineNumberLengths,
        monacoEditorValue.length,
        1,
        1,
        dataDictionary[1],
        dictionaryId
    );

    if (position?.matchTargetDictionaryId) {
        return position.start;
    }

    return {
        column: 1,
        lineNumber: 1,
    };
}

/**
 * Gets the position if this were a parsed and combined value
 */
function getParsedPosition(position: IPosition, monacoEditorValue: string[]): number {
    let parsedStartPosition = position.column;

    for (
        let lineNumber = 1, lineNumberLength = position.lineNumber;
        lineNumber < lineNumberLength;
        lineNumber++
    ) {
        parsedStartPosition =
            parsedStartPosition + monacoEditorValue[lineNumber - 1].length;
    }

    return parsedStartPosition;
}

function findDictionaryIdFromTheMonacoEditorHTML(
    startPosition: number,
    monacoEditorParsed: Node,
    dataDictionaryItems: { [key: string]: Data<unknown> },
    schemaDictionary: SchemaDictionary,
    currentDictionaryId: string
): string {
    // Return the dictionary ID corresponding to this parsed location if it is
    // inbetween the start and end location
    if (
        startPosition > monacoEditorParsed.start + 1 &&
        startPosition <= monacoEditorParsed.end
    ) {
        let dictionaryId = currentDictionaryId;

        // the children of this current dictionary item, without text children
        // which the parsed value ignores
        const childrenOfCurrentDictionaryId: LinkedData[] = findAllNonTextLinkedDataInData(
            schemaDictionary[dataDictionaryItems[currentDictionaryId].schemaId],
            dataDictionaryItems[currentDictionaryId].data,
            schemaDictionary,
            dataDictionaryItems
        );

        // Go through the parsed values children attempting to match them to
        // the position
        for (
            let childIndex = 0,
                childIndexLength = monacoEditorParsed.children?.length || 0;
            childIndex < childIndexLength;
            childIndex++
        ) {
            dictionaryId = findDictionaryIdFromTheMonacoEditorHTML(
                startPosition,
                monacoEditorParsed.children[childIndex],
                dataDictionaryItems,
                schemaDictionary,
                childrenOfCurrentDictionaryId[childIndex].id
            );

            if (typeof dictionaryId === "string") {
                return dictionaryId;
            }
        }

        return currentDictionaryId;
    }
}

/**
 * Find a dictionary ID from a Monaco Editor position
 *
 * @alpha
 */
export function findDictionaryIdByMonacoEditorHTMLPosition(
    position: IPosition,
    dataDictionary: DataDictionary<unknown>,
    schemaDictionary: SchemaDictionary,
    monacoEditorValue: string[]
): string {
    // Go through the monaco editor value, count until we find the character location on a
    // joined monaco editor value
    const parsedPosition: number = getParsedPosition(position, monacoEditorValue);
    const monacoEditorParsed = parse(monacoEditorValue.join("")).roots[0];

    const dictionaryId: string = findDictionaryIdFromTheMonacoEditorHTML(
        parsedPosition,
        monacoEditorParsed,
        dataDictionary[0],
        schemaDictionary,
        dataDictionary[1]
    );

    return typeof dictionaryId === "string" ? dictionaryId : dataDictionary[1];
}
