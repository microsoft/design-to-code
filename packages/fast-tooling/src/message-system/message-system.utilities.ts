import { cloneDeep, get, set, uniqueId } from "lodash-es";
import { getDataWithDuplicate } from "../data-utilities/duplicate";
import {
    getDataUpdatedWithoutSourceData,
    getDataUpdatedWithSourceData,
    getNextActiveParentDictionaryId,
} from "../data-utilities/relocate";
import { DataType, normalizeDataLocationToDotNotation } from "../data-utilities";
import { XOR } from "../data-utilities/type.utilities";
import { getLinkedDataDictionary, getLinkedDataList } from "./data";
import { MessageSystemType } from "./types";
import {
    CustomMessage,
    DataMessageIncoming,
    DataMessageOutgoing,
    ErrorMessageOutgoing,
    HistoryMessageIncoming,
    HistoryMessageOutgoing,
    InitializeMessageOutgoing,
    InternalMessageSystemIncoming,
    InternalMessageSystemOutgoing,
    InternalOutgoingMessage,
    MessageSystemDataTypeAction,
    MessageSystemHistoryTypeAction,
    MessageSystemIncoming,
    MessageSystemNavigationTypeAction,
    MessageSystemOutgoing,
    MessageSystemSchemaDictionaryTypeAction,
    MessageSystemValidationTypeAction,
    NavigationMessageIncoming,
    NavigationMessageOutgoing,
    SchemaDictionaryMessageIncoming,
    SchemaDictionaryMessageOutgoing,
    ValidationMessageIncoming,
    ValidationMessageOutgoing,
} from "./message-system.utilities.props";
import { getNavigationDictionary } from "./navigation";
import { NavigationConfigDictionary } from "./navigation.props";
import {
    Data,
    DataDictionary,
    LinkedData,
    RemoveLinkedDataParentType,
} from "./data.props";
import { defaultHistoryLimit } from "./history";
import { History } from "./history.props";
import { SchemaDictionary } from "./schema.props";
import { Validation } from "./validation.props";
import { removeRootDataNodeErrorMessage } from "./errors";

/**
 * The default name that the display text maps to
 */
export const dataSetName: string = "data-fast-tooling-name";

/**
 * This is the Message System, through which:
 * - Data manipulation may be performed
 * - Navigation will be updated
 *
 * The main purpose of this is to tie together
 * process heavy actions onto a separate thread,
 * as well as to allow services to opt into a
 * single source for data updates.
 */

const history: History = {
    items: [],
    limit: defaultHistoryLimit,
};
let activeHistoryIndex: number = 0;
let dataDictionary: DataDictionary<unknown>;
let navigationDictionary: NavigationConfigDictionary; // this should never be updated, only provided
let activeNavigationConfigId: string;
let activeDictionaryId: string; // this controls both the data and navigation dictionaries which must remain in sync
let schemaDictionary: SchemaDictionary;
const validation: Validation = {};

/**
 * Handles all custom messages
 */
function getCustomMessage<C, OConfig>(
    data: CustomMessage<C, OConfig>
): CustomMessage<C, OConfig> {
    return data;
}

/**
 * Handles all validation messages
 */
function getValidationMessage(
    data: ValidationMessageIncoming,
    historyId: string
): ValidationMessageOutgoing {
    switch (data.action) {
        case MessageSystemValidationTypeAction.update:
            validation[data.dictionaryId] = data.validationErrors;

            return {
                type: MessageSystemType.validation,
                action: MessageSystemValidationTypeAction.update,
                activeDictionaryId,
                dictionaryId: data.dictionaryId,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                validation,
                validationErrors: data.validationErrors,
                options: data.options,
            };
        case MessageSystemValidationTypeAction.get:
            return {
                type: MessageSystemType.validation,
                action: MessageSystemValidationTypeAction.get,
                activeDictionaryId: data.dictionaryId,
                dictionaryId: data.dictionaryId,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                validation,
                validationErrors: validation[data.dictionaryId],
                options: data.options,
            };
    }
}

/**
 * Handles all history manipulation messages
 */
function getHistoryMessage(
    data: HistoryMessageIncoming,
    historyId: string
): Array<HistoryMessageOutgoing | MessageSystemOutgoing> {
    switch (data.action) {
        case MessageSystemHistoryTypeAction.get:
            return [
                {
                    type: MessageSystemType.history,
                    action: MessageSystemHistoryTypeAction.get,
                    history,
                    dataDictionary,
                    navigationDictionary,
                    activeHistoryIndex,
                    activeNavigationConfigId,
                    schemaDictionary,
                    historyId,
                    activeDictionaryId,
                    dictionaryId: activeDictionaryId,
                    validation,
                },
            ];
        case MessageSystemHistoryTypeAction.next:
            if (activeHistoryIndex + 1 <= history.items.length - 1) {
                activeHistoryIndex += 1;

                /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
                return getMessage(
                    [history.items[activeHistoryIndex - 1].next as any, historyId],
                    activeHistoryIndex
                ).map(message => {
                    return message[0];
                });
            }
            break;
        case MessageSystemHistoryTypeAction.previous:
            if (activeHistoryIndex !== 0) {
                activeHistoryIndex -= 1;

                return history.items[activeHistoryIndex + 1].previous
                    .map(previousItem => {
                        /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
                        return getMessage(
                            [previousItem as any, historyId],
                            activeHistoryIndex
                        ).map(message => {
                            return message[0];
                        });
                    })
                    .flat();
            }
            break;
    }
}

/**
 * Handles all schema dictionary manipulation messages
 */
function getSchemaDictionaryMessage(
    data: SchemaDictionaryMessageIncoming,
    historyId: string
): SchemaDictionaryMessageOutgoing {
    switch (data.action) {
        case MessageSystemSchemaDictionaryTypeAction.add:
            schemaDictionary = data.schemas.reduce(
                (previousSchemaDictionary, currentSchema) => {
                    return {
                        ...previousSchemaDictionary,
                        [currentSchema.$id]: currentSchema,
                    };
                },
                schemaDictionary
            );

            return {
                type: MessageSystemType.schemaDictionary,
                action: MessageSystemSchemaDictionaryTypeAction.add,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
            };
    }
}

/**
 * Gets a previous data message based on an incoming message
 */
function getDataPreviousMessage(
    data: DataMessageIncoming,
    linkedDataIds: string[]
): Array<DataMessageIncoming | NavigationMessageIncoming> | null {
    switch (data.action) {
        case MessageSystemDataTypeAction.duplicate: {
            const splitDataLocation: string[] = normalizeDataLocationToDotNotation(
                data.sourceDataLocation
            ).split(".");
            let index: number = 0;
            const lastDataLocationItem: number = parseInt(
                splitDataLocation[splitDataLocation.length - 1],
                10
            );

            // Determine if this data item had an array number
            if (!isNaN(lastDataLocationItem)) {
                index = lastDataLocationItem;
            }

            return [
                {
                    type: MessageSystemType.data,
                    action: MessageSystemDataTypeAction.remove,
                    dataLocation: `${data.sourceDataLocation}[${index}]`,
                },
            ];
        }
        case MessageSystemDataTypeAction.remove: {
            const dataAtDataLocation = get(
                dataDictionary[0][activeDictionaryId].data,
                data.dataLocation
            );
            const typeofData = typeof dataAtDataLocation;

            return [
                {
                    type: MessageSystemType.data,
                    action: MessageSystemDataTypeAction.add,
                    dataLocation: data.dataLocation,
                    data: get(
                        dataDictionary[0][activeDictionaryId].data,
                        data.dataLocation
                    ),
                    dataType:
                        dataAtDataLocation === null
                            ? DataType.null
                            : Array.isArray(dataAtDataLocation)
                            ? DataType.array
                            : typeofData === "string"
                            ? DataType.string
                            : typeofData === "number"
                            ? DataType.number
                            : typeofData === "object"
                            ? DataType.object
                            : typeofData === "boolean"
                            ? DataType.boolean
                            : DataType.unknown,
                },
            ];
        }
        case MessageSystemDataTypeAction.add:
            return [
                {
                    type: MessageSystemType.data,
                    action: MessageSystemDataTypeAction.remove,
                    dataLocation: data.dataLocation,
                },
            ];
        case MessageSystemDataTypeAction.update: {
            const dictionaryId: string =
                typeof data.dictionaryId === "string"
                    ? data.dictionaryId
                    : activeDictionaryId;

            return [
                {
                    type: MessageSystemType.data,
                    action: MessageSystemDataTypeAction.update,
                    dictionaryId,
                    dataLocation: data.dataLocation,
                    data: cloneDeep(
                        get(dataDictionary[0][dictionaryId].data, data.dataLocation)
                    ),
                },
            ];
        }

        case MessageSystemDataTypeAction.addLinkedData: {
            const dictionaryId: string =
                typeof data.dictionaryId === "string"
                    ? data.dictionaryId
                    : activeDictionaryId;

            return [
                {
                    type: MessageSystemType.data,
                    action: MessageSystemDataTypeAction.removeLinkedData,
                    dictionaryId,
                    dataLocation: data.dataLocation,
                    linkedData: linkedDataIds.map((id: string) => {
                        return {
                            id,
                        };
                    }),
                },
            ];
        }
        case MessageSystemDataTypeAction.removeLinkedData: {
            const parentType: XOR<RemoveLinkedDataParentType, null> = data.dictionaryId
                ? RemoveLinkedDataParentType.suppliedDictionaryId
                : Array.isArray(data.linkedData)
                ? RemoveLinkedDataParentType.activeDictionaryId
                : activeDictionaryId !== dataDictionary[1]
                ? RemoveLinkedDataParentType.activeDictionaryIdParent
                : null;
            let linkedDataParentDictionaryId: string;
            let removedLinkedData: LinkedData[];
            let dataLocation: string;

            switch (parentType) {
                case RemoveLinkedDataParentType.suppliedDictionaryId: {
                    linkedDataParentDictionaryId = data.dictionaryId;
                    removedLinkedData = data.linkedData;
                    dataLocation = data.dataLocation;
                    break;
                }
                case RemoveLinkedDataParentType.activeDictionaryId: {
                    linkedDataParentDictionaryId = activeDictionaryId;
                    removedLinkedData = data.linkedData;
                    dataLocation = data.dataLocation;
                    break;
                }
                case RemoveLinkedDataParentType.activeDictionaryIdParent: {
                    linkedDataParentDictionaryId =
                        dataDictionary[0][activeDictionaryId].parent.id;
                    removedLinkedData = [{ id: activeDictionaryId }];
                    dataLocation =
                        dataDictionary[0][activeDictionaryId].parent.dataLocation;
                    break;
                }
                case null:
                    return null;
            }

            const linkedData = removedLinkedData.map(linkedDataItem => {
                return dataDictionary[0][linkedDataItem.id];
            });

            return [
                {
                    type: MessageSystemType.data,
                    action: MessageSystemDataTypeAction.addLinkedData,
                    dictionaryId: linkedDataParentDictionaryId,
                    dataLocation,
                    linkedData: cloneDeep(linkedData),
                    originalLinkedDataIds: removedLinkedData,
                },
                {
                    type: MessageSystemType.navigation,
                    action: MessageSystemNavigationTypeAction.update,
                    activeDictionaryId,
                    activeNavigationConfigId,
                },
            ];
        }
        case MessageSystemDataTypeAction.reorderLinkedData: {
            const currentLinkedData = get(
                dataDictionary[0][activeDictionaryId].data,
                data.dataLocation
            );

            return [
                {
                    type: MessageSystemType.data,
                    action: MessageSystemDataTypeAction.reorderLinkedData,
                    dataLocation: data.dataLocation,
                    linkedData: cloneDeep(currentLinkedData),
                },
            ];
        }
        default:
            return null;
    }
}

/**
 * Handles all data manipulation messages
 */
function getDataMessage(
    data: DataMessageIncoming,
    linkedDataIds: string[],
    historyId: string
): XOR<DataMessageOutgoing, ErrorMessageOutgoing> {
    switch (data.action) {
        case MessageSystemDataTypeAction.duplicate:
            dataDictionary[0][activeDictionaryId].data = getDataWithDuplicate(
                data.sourceDataLocation,
                dataDictionary[0][activeDictionaryId].data
            );
            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.duplicate,
                sourceDataLocation: data.sourceDataLocation,
                data: dataDictionary[0][activeDictionaryId].data,
                navigation: navigationDictionary[0][activeDictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
        case MessageSystemDataTypeAction.remove:
            dataDictionary[0][activeDictionaryId].data = getDataUpdatedWithoutSourceData({
                sourceDataLocation: data.dataLocation,
                data: dataDictionary[0][activeDictionaryId].data,
            });
            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.remove,
                data: dataDictionary[0][activeDictionaryId].data,
                navigation: navigationDictionary[0][activeDictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
        case MessageSystemDataTypeAction.add:
            dataDictionary[0][activeDictionaryId].data = getDataUpdatedWithSourceData({
                targetDataLocation: data.dataLocation,
                targetDataType: data.dataType,
                sourceData: data.data,
                data: dataDictionary[0][activeDictionaryId].data,
            });
            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.add,
                data: dataDictionary[0][activeDictionaryId].data,
                navigation: navigationDictionary[0][activeDictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
        case MessageSystemDataTypeAction.update: {
            const dictionaryId: string =
                data.dictionaryId !== undefined ? data.dictionaryId : activeDictionaryId;

            if (data.dataLocation === "") {
                dataDictionary[0][dictionaryId].data = data.data;
            } else {
                set(
                    dataDictionary[0][dictionaryId].data as object,
                    data.dataLocation,
                    data.data
                );
            }

            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.update,
                data: dataDictionary[0][dictionaryId].data,
                navigation: navigationDictionary[0][dictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId,
                validation,
                options: data.options,
            };
        }
        case MessageSystemDataTypeAction.addLinkedData: {
            const addLinkedDataDictionaryId: string =
                typeof data.dictionaryId === "string"
                    ? data.dictionaryId
                    : activeDictionaryId;

            const updatedDataForDataDictionary = getLinkedDataDictionary({
                linkedData: data.linkedData,
                linkedDataIds,
                dictionaryId: addLinkedDataDictionaryId,
                dataLocation: data.dataLocation,
            });
            let currentLinkedDataRefs: LinkedData[] | void = get(
                dataDictionary[0][addLinkedDataDictionaryId].data,
                data.dataLocation
            );

            if (Array.isArray(currentLinkedDataRefs)) {
                if (typeof data.index === "number") {
                    currentLinkedDataRefs.splice(data.index, 0, {
                        id: updatedDataForDataDictionary.dataDictionary[1],
                    });
                } else {
                    currentLinkedDataRefs = currentLinkedDataRefs.concat([
                        {
                            id: updatedDataForDataDictionary.dataDictionary[1],
                        },
                    ]);
                }
            } else {
                currentLinkedDataRefs = [
                    {
                        id: updatedDataForDataDictionary.dataDictionary[1],
                    },
                ];
            }

            // update the data dictionary root dictionary id location with
            // the update linked data references
            set(
                dataDictionary[0][addLinkedDataDictionaryId].data as object,
                data.dataLocation,
                currentLinkedDataRefs
            );

            // update the data dictionary keys with the update data dictionary
            // of linked data items
            dataDictionary[0] = {
                ...dataDictionary[0],
                ...updatedDataForDataDictionary.dataDictionary[0],
            };

            // update the navigation dictionary
            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.addLinkedData,
                dictionaryId: addLinkedDataDictionaryId,
                linkedDataIds: Object.keys(
                    updatedDataForDataDictionary.dataDictionary[0]
                ).map((dataDictionaryKey: string) => {
                    return { id: dataDictionaryKey };
                }),
                data: dataDictionary[0][addLinkedDataDictionaryId].data,
                navigation: navigationDictionary[0][addLinkedDataDictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                validation,
                options: data.options,
            };
        }
        case MessageSystemDataTypeAction.removeLinkedData: {
            const parentType: XOR<RemoveLinkedDataParentType, null> = data.dictionaryId
                ? RemoveLinkedDataParentType.suppliedDictionaryId
                : Array.isArray(data.linkedData)
                ? RemoveLinkedDataParentType.activeDictionaryId
                : activeDictionaryId !== dataDictionary[1]
                ? RemoveLinkedDataParentType.activeDictionaryIdParent
                : null;

            const linkedDataIds: string[] = [];
            let linkedDataParentDictionaryId: string;
            let linkedData: LinkedData[];
            let dataLocation: string;

            switch (parentType) {
                case RemoveLinkedDataParentType.suppliedDictionaryId: {
                    linkedDataParentDictionaryId = data.dictionaryId;
                    linkedData = data.linkedData;
                    dataLocation = data.dataLocation;
                    break;
                }
                case RemoveLinkedDataParentType.activeDictionaryId: {
                    linkedDataParentDictionaryId = activeDictionaryId;
                    linkedData = data.linkedData;
                    dataLocation = data.dataLocation;
                    break;
                }
                case RemoveLinkedDataParentType.activeDictionaryIdParent: {
                    linkedDataParentDictionaryId =
                        dataDictionary[0][activeDictionaryId].parent.id;
                    linkedData = [{ id: activeDictionaryId }];
                    dataLocation =
                        dataDictionary[0][activeDictionaryId].parent.dataLocation;
                    break;
                }
                case null:
                    return {
                        type: MessageSystemType.error,
                        message: removeRootDataNodeErrorMessage,
                    };
            }

            const removedLinkedData: unknown =
                dataDictionary[0][linkedDataParentDictionaryId].data;

            // add linked data IDs to be removed
            linkedData.forEach((linkedDataItem: LinkedData) => {
                linkedDataIds.push(linkedDataItem.id);

                // add linked data IDs that are children of the linked data items being removed
                getLinkedDataList(dataDictionary, linkedDataItem.id).forEach(
                    (id: string) => {
                        linkedDataIds.push(id);
                    }
                );
            });

            // get the active dictionary ID in case it is among those being removed
            activeDictionaryId = getNextActiveParentDictionaryId(
                activeDictionaryId,
                linkedDataIds,
                dataDictionary
            );

            // remove linked data from the dictionary
            linkedDataIds.forEach((linkedDataId: string) => {
                delete dataDictionary[0][linkedDataId];
            });

            let filteredLinkedDataRefs: LinkedData[] = get(
                dataDictionary[0][linkedDataParentDictionaryId].data,
                dataLocation,
                []
            );

            // filter the linkedData in the item the linkedData are being removed from to not include
            // those that were just removed
            filteredLinkedDataRefs = filteredLinkedDataRefs.filter(
                (filteredLinkedDataRef: LinkedData) => {
                    return (
                        linkedData.findIndex((linkedDataItem: LinkedData) => {
                            return linkedDataItem.id === filteredLinkedDataRef.id;
                        }) === -1
                    );
                }
            );

            set(
                dataDictionary[0][linkedDataParentDictionaryId].data as object,
                dataLocation,
                filteredLinkedDataRefs
            );

            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.removeLinkedData,
                data: removedLinkedData,
                navigation: navigationDictionary[0][activeDictionaryId],
                linkedDataIds,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
        }
        case MessageSystemDataTypeAction.reorderLinkedData:
            set(
                dataDictionary[0][activeDictionaryId].data as object,
                data.dataLocation,
                data.linkedData
            );

            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );

            return {
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.reorderLinkedData,
                data: dataDictionary[0][activeDictionaryId].data,
                navigation: navigationDictionary[0][activeDictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
    }
}

/**
 * Gets a previous navigation message based on an incoming message
 */
function getNavigationPreviousMessage(
    data: NavigationMessageIncoming
): Array<NavigationMessageIncoming> | null {
    switch (data.action) {
        case MessageSystemNavigationTypeAction.update:
            return [
                {
                    type: MessageSystemType.navigation,
                    action: MessageSystemNavigationTypeAction.update,
                    activeDictionaryId,
                    activeNavigationConfigId,
                    options: data.options,
                },
            ];
    }

    return null;
}

/**
 * Gets the navigation outgoing message
 */
function getNavigationMessage(
    data: NavigationMessageIncoming,
    historyId: string
): NavigationMessageOutgoing {
    switch (data.action) {
        case MessageSystemNavigationTypeAction.update:
            activeDictionaryId = data.activeDictionaryId;
            activeNavigationConfigId = data.activeNavigationConfigId;

            return {
                type: MessageSystemType.navigation,
                action: MessageSystemNavigationTypeAction.update,
                activeDictionaryId: data.activeDictionaryId,
                activeNavigationConfigId: data.activeNavigationConfigId,
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                schemaDictionary,
                historyId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
        case MessageSystemNavigationTypeAction.get:
            return {
                type: MessageSystemType.navigation,
                action: MessageSystemNavigationTypeAction.get,
                navigation: navigationDictionary[0][activeDictionaryId],
                dataDictionary,
                navigationDictionary,
                activeHistoryIndex,
                activeNavigationConfigId,
                schemaDictionary,
                historyId,
                activeDictionaryId,
                dictionaryId: activeDictionaryId,
                validation,
                options: data.options,
            };
    }
}

/**
 * Updates to the history, if the history can store a previous state (not null)
 * then the history will add an item to the list. When moving through history
 * with backward (undo) the "previous" incoming message will execute, when
 * moving forward (redo) the "next" incoming message will execute.
 *
 * The history should be updated whenever any changes are made to:
 * - activeDictionaryId
 * - activeNavigationConfigId
 * - dataDictionary
 * - validation
 */
function updateHistory<C>(
    next: MessageSystemIncoming<C>,
    previous: Array<MessageSystemIncoming<C>> | null,
    id: string,
    historyIndex?: number
): string | void {
    if (previous !== null) {
        /**
         * When history is updated using a historyIndex, it indicates that the history
         * index is being directly set and should not be set here
         */
        if (typeof historyIndex === "undefined") {
            // Determine if an item is not the current one in history
            const isCurrent = history.items.length === activeHistoryIndex;

            if (!isCurrent) {
                // Remove all subsequent history items as they are out of date
                history.items.splice(activeHistoryIndex + 1);
            }

            history.items.push({ next, previous, id });
            let historyItemsLength = history.items.length;

            if (historyItemsLength > history.limit) {
                history.items.shift();
                historyItemsLength = history.limit;
            }

            activeHistoryIndex = historyItemsLength - 1;
        }

        return id;
    }
}

function getLinkedDataIds(ids: string[], linkedData: Data<unknown>[]) {
    linkedData.map(linkedDataItem => {
        if (Array.isArray(linkedDataItem.linkedData)) {
            getLinkedDataIds(ids, linkedDataItem.linkedData);
        }

        ids.push(uniqueId("fast"));
    });
}

export function getMessage<C = {}>(
    data: InternalMessageSystemIncoming,
    historyIndex?: number
): Array<InternalMessageSystemOutgoing<C>> {
    const historyId = data[1];

    switch (data[0].type) {
        case MessageSystemType.custom:
            return [
                [
                    getCustomMessage(data[0] as CustomMessage<C, {}>),
                    data[1],
                ] as InternalOutgoingMessage<CustomMessage<C, {}>>,
            ];
        case MessageSystemType.data: {
            let ids: string[] = [];

            if (data[0].action === MessageSystemDataTypeAction.addLinkedData) {
                if (data[0].originalLinkedDataIds) {
                    ids = data[0].originalLinkedDataIds.map(originalLinkedDataId => {
                        return originalLinkedDataId.id;
                    });
                } else {
                    getLinkedDataIds(ids, data[0].linkedData);
                }
            }

            updateHistory(
                data[0],
                getDataPreviousMessage(data[0], ids) as Array<DataMessageIncoming> | null,
                historyId,
                historyIndex
            );

            return [
                [
                    getDataMessage(data[0] as DataMessageIncoming, ids, historyId),
                    data[1],
                ] as InternalOutgoingMessage<DataMessageOutgoing>,
            ];
        }
        case MessageSystemType.navigation:
            updateHistory(
                data[0],
                getNavigationPreviousMessage(data[0]),
                historyId,
                historyIndex
            );

            return [
                [
                    getNavigationMessage(data[0] as NavigationMessageIncoming, historyId),
                    data[1],
                ] as InternalOutgoingMessage<NavigationMessageOutgoing>,
            ];
        case MessageSystemType.validation:
            return [
                [
                    getValidationMessage(data[0] as ValidationMessageIncoming, historyId),
                    data[1],
                ] as InternalOutgoingMessage<ValidationMessageOutgoing>,
            ];
        case MessageSystemType.history: {
            const historyMessage = getHistoryMessage(
                data[0] as HistoryMessageIncoming,
                history.items?.[history.items.length - 1]?.id || undefined
            );

            if (historyMessage) {
                return historyMessage.map(historyMessageItem => {
                    return [historyMessageItem as HistoryMessageOutgoing, data[1]];
                });
            }
        }
        case MessageSystemType.schemaDictionary:
            return [
                [
                    getSchemaDictionaryMessage(
                        data[0] as SchemaDictionaryMessageIncoming,
                        historyId
                    ),
                    data[1],
                ],
            ];
        case MessageSystemType.initialize:
            /**
             * TODO: remove this ternary to rely on the dataDictionary
             * as data is @deprecated
             */
            dataDictionary = Array.isArray(data[0].dataDictionary)
                ? data[0].dataDictionary
                : data[0].data;
            activeDictionaryId =
                typeof data[0].dictionaryId === "string"
                    ? data[0].dictionaryId
                    : dataDictionary[1];
            schemaDictionary = data[0].schemaDictionary;
            navigationDictionary = getNavigationDictionary(
                schemaDictionary,
                dataDictionary,
                dataSetName
            );
            activeNavigationConfigId =
                navigationDictionary[0][navigationDictionary[1]][1];
            history.limit = data[0].historyLimit || defaultHistoryLimit;

            return [
                [
                    {
                        type: MessageSystemType.initialize,
                        data: dataDictionary[0][activeDictionaryId].data,
                        navigation: navigationDictionary[0][activeDictionaryId],
                        schema:
                            schemaDictionary[
                                dataDictionary[0][activeDictionaryId].schemaId
                            ],
                        historyLimit: history.limit,
                        dataDictionary,
                        navigationDictionary,
                        activeHistoryIndex,
                        activeNavigationConfigId,
                        schemaDictionary,
                        historyId,
                        activeDictionaryId,
                        dictionaryId: activeDictionaryId,
                        validation,
                        options: data[0].options,
                    },
                    data[1],
                ] as InternalOutgoingMessage<InitializeMessageOutgoing>,
            ];
    }
}
